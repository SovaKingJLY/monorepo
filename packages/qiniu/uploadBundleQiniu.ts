import qiniu from 'qiniu';
import path from 'path';
import type { Plugin } from 'vite';
import type { OutputBundle } from 'rollup';
import mime from 'mime-types';

/**
 * 插件配置参数接口
 */
export interface QiniuOptions {
    accessKey: string;
    secretKey: string;
    bucket: string;
    /** 存储区域，如：Zone_z2 (华南), Zone_z0 (华东) */
    zone?: keyof typeof qiniu.zone;
    /** * 上传到七牛云的根目录前缀 
     * 例如：'assets/v1.0.0/'
     */
    remotePath?: string;
}

export default function uploadBundleQiniu(options: QiniuOptions): Plugin {
    // 1. 初始化七牛认证鉴权
    const mac = new qiniu.auth.digest.Mac(options.accessKey, options.secretKey);

    // 2. 配置七牛上传环境
    const config = new qiniu.conf.Config();
    if (options.zone && qiniu.zone[options.zone]) {
        config.zone = qiniu.zone[options.zone];
    }

    const formUploader = new qiniu.form_up.FormUploader(config);

    return {
        name: "vite-plugin-upload-qiniu",
        // 仅在打包（build）模式下生效
        apply: 'build',

        /**
         * writeBundle 钩子在文件成功写入磁盘后触发
         */
        async writeBundle(_outputOptions, bundle: OutputBundle) {
            const uploadPromises: Promise<void>[] = [];
            const remotePrefix = options.remotePath || '';

            console.log(`\n☁️  [Qiniu] 开始上传至存储桶: ${options.bucket}`);
            if (remotePrefix) console.log(`📂 [Qiniu] 远程路径前缀: ${remotePrefix}`);

            // 遍历打包生成的资源列表
            for (const [fileName, file] of Object.entries(bundle)) {
                // 拼接最终的远程存储 Key (使用 POSIX 标准路径分隔符)
                const key = path.posix.join(remotePrefix, fileName);

                // 获取文件内容：Asset 为 Buffer，Chunk 为 string
                const content = file.type === 'asset' ? file.source : file.code;

                // 获取 MIME 类型，确保 CDN 正确响应 Content-Type
                const mimeType = mime.lookup(fileName) || 'application/octet-stream';

                // 配置上传参数：手动指定 mimeType 以跳过七牛的自动探测
                const putExtra = new qiniu.form_up.PutExtra();
                putExtra.mimeType = mimeType;

                // 生成上传凭证（覆盖模式：允许相同 key 的文件更新）
                const putPolicy = new qiniu.rs.PutPolicy({
                    scope: `${options.bucket}:${key}`
                });
                const uploadToken = putPolicy.uploadToken(mac);

                // 封装上传任务
                const task = new Promise<void>((resolve, reject) => {
                    formUploader.put(uploadToken, key, content, putExtra, (respErr, _respBody, respInfo) => {
                        if (respErr) {
                            return reject(new Error(`[${fileName}] 上传失败: ${respErr.message}`));
                        }
                        if (respInfo.statusCode !== 200) {
                            return reject(new Error(`[${fileName}] 状态异常: ${respInfo.statusCode}`));
                        }
                        console.log(`✅ ${fileName} -> ${key} (${mimeType})`);
                        resolve();
                    });
                });

                uploadPromises.push(task);
            }

            // 执行并发上传
            try {
                await Promise.all(uploadPromises);
                console.log(`\n✨ [Qiniu] 恭喜！所有文件（共 ${uploadPromises.length} 个）已成功上传到七牛云。\n`);
            } catch (error) {
                console.error(`\n💥 [Qiniu] 上传过程中发生错误:`);
                console.error(error);
                // 如果需要因为上传失败导致构建流程报错退出，可以抛出异常
                throw error;
            }
        }
    };
}