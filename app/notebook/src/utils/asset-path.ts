// src/utils/public-path.ts
// 获取存储在pulibc下的静态文件
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

export const getPublicPath = () => {
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
        // 确保结尾有 /
        const path = qiankunWindow.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
        return path.endsWith('/') ? path : `${path}/`;
    }
    // 独立运行时，通常根据 vite base 配置或默认为 /
    return import.meta.env.BASE_URL;
};

/**
 * 辅助函数：专门用于拼接静态资源路径
 * @param path 资源相对于 public 目录的路径，如 'images/logo.png'
 */
export const getAssetUrl = (path: string) => {
    const publicPath = getPublicPath();
    // 移除 path 开头的 / 防止双重斜杠
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${publicPath}${cleanPath}`;
};