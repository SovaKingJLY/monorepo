import qiniu from 'qiniu';
import path from 'path';
import type { Plugin } from 'vite';
import type { OutputBundle } from 'rollup';
import mime from 'mime-types'; // 🎯 [修复] 引入 mime 库
export interface QiniuOptions {
    accessKey: string;
    secretKey: string;
    bucket: string;
    zone?: keyof typeof qiniu.zone;

    /**
     * 🎯 [新增] 上传的根目录（前缀）
     * 例如：'project-a/v1.0.0/'
     * 如果不传，则默认上传到 Bucket 根目录
     */
    remotePath?: string;

    /**
     * 缓存控制
     */
    cacheControl?: {
        html?: number;
        assets?: number;
    } | number;
}

export default function uploadBundleQiniu(options: QiniuOptions): Plugin {
    const mac = new qiniu.auth.digest.Mac(options.accessKey, options.secretKey);
    const config = new qiniu.conf.Config();
    if (options.zone && qiniu.zone[options.zone]) {
        config.zone = qiniu.zone[options.zone];
    }

    const formUploader = new qiniu.form_up.FormUploader(config);
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    // ❌ [移除] 不要在这里定义 putExtra，因为它是单例，无法针对不同文件设置不同 MIME
    // const putExtra = new qiniu.form_up.PutExtra();

    const getCacheControlHeader = (fileName: string): string | null => {
        // ... (保持不变) ...
        if (!options.cacheControl) return null;
        let maxAge = 0;
        if (typeof options.cacheControl === 'number') {
            maxAge = options.cacheControl;
        } else {
            const isHtml = fileName.endsWith('.html');
            maxAge = isHtml ? (options.cacheControl.html ?? 0) : (options.cacheControl.assets ?? 31536000);
        }
        return `public, max-age=${maxAge}`;
    };

    return {
        name: "uploadBundleQiniu",
        writeBundle: async (_outputOptions, bundle: OutputBundle) => {
            const uploadPromises: Promise<void>[] = [];
            const remotePrefix = options.remotePath || '';

            console.log(`\n🚀 [Qiniu] 开始上传到: ${options.bucket}/${remotePrefix}`);

            for (const [fileName, file] of Object.entries(bundle)) {
                const key = path.posix.join(remotePrefix, fileName);
                const content = file.type === 'asset' ? file.source : file.code;

                // 🎯 [修复] 1. 获取准确的 MIME Type
                // 如果 lookup 失败，回退到 octet-stream，但通常 js/css 都能识别准确
                const mimeType = mime.lookup(fileName) || 'application/octet-stream';

                // 🎯 [修复] 2. 为每个文件创建独立的 PutExtra 对象
                const putExtra = new qiniu.form_up.PutExtra();
                // 🎯 [修复] 3. 显式设置 mimeType
                // 这样七牛云就会直接使用这个类型，而不会去触发 detectMime 进行猜测
                putExtra.mimeType = mimeType;

                const putPolicy = new qiniu.rs.PutPolicy({
                    scope: `${options.bucket}:${key}`
                });
                const uploadToken = putPolicy.uploadToken(mac);

                const task = new Promise<void>((resolve, reject) => {
                    // 传入我们配置好的 putExtra
                    formUploader.put(uploadToken, key, content, putExtra, async (respErr, _respBody, respInfo) => {
                        if (respErr) return reject(respErr);
                        if (respInfo.statusCode !== 200) return reject(new Error(`Status: ${respInfo.statusCode}`));

                        const cacheHeader = getCacheControlHeader(fileName);
                        if (cacheHeader) {
                            try {
                                await bucketManager.changeHeaders(options.bucket, key, { 'Cache-Control': cacheHeader });
                            } catch (e) { /* ignore */ }
                        }

                        // 打印时可以顺便确认一下类型
                        console.log(`✅ [${mimeType}] ${fileName} -> ${key}`);
                        resolve();
                    });
                });

                uploadPromises.push(task);
            }

            try {
                await Promise.all(uploadPromises);
                console.log(`✨ [Qiniu] 上传完成！\n`);
            } catch (error) {
                console.error(`💥 [Qiniu] 上传失败`, error);
            }
        }
    }
}