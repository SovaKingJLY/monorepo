import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import uploadBundleQiniu from '@repo/qiniu';
import qiankun from 'vite-plugin-qiankun';
//import qiniu from 'vite-plugin-qiniu'; // 引入插件
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const envDir = path.resolve(__dirname, 'env');
  const env = loadEnv(mode, envDir);
  const isProduction = mode === 'production';
  const cliCommand = process.argv.find(arg => arg.startsWith('--command='))?.split('=')[1];
  const backendCommand = (cliCommand || env.VITE_BACKEND_COMMAND || '').toLowerCase();

  const localApiTarget = env.VITE_LOCAL_API_TARGET || 'http://localhost:3002';
  const remoteApiTarget = env.VITE_REMOTE_API_TARGET || 'http://124.221.73.180:3002';

  const useLocalBackend = backendCommand
    ? backendCommand === 'local'
    : command === 'serve';

  const apiProxyTarget = useLocalBackend ? localApiTarget : remoteApiTarget;
  // console.log(isProduction)
  return {
    envDir: './env',
    base: isProduction ? 'https://redsources.jlyproject.cn/vite/' : 'http://localhost:5175/', //CDN
    plugins: [
      react(),
      qiankun('notebook', {
        useDevMode: true
      }),

      uploadBundleQiniu({
        accessKey: 'EIriimCUVKCk0G4gCFACezpYSZFvpZ6L8IvQqYUR',
        secretKey: 'oN_nA1SkDFDOpjxf3c4gfw_LGwtEGBb9TV-yzsDE',
        bucket: 'jlyred',
        remotePath: `vite`,
        cacheControl: {
          html: 0,
          assets: 31536000
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'reactVendor';
              }
              if (id.includes('antd') || id.includes('@ant-design/icons')) return 'antdVendor';
              else return 'mainVendor';
            }
          }
        }
      }
    },
    server: {
      port: 5175, // 强制锁定端口，不要让它自动变
      strictPort: true, // 如果端口被占用，直接报错而不是尝试下一个
      origin: 'http://localhost:5175',
      cors: {
        origin: 'http://localhost:3000', // 允许主应用访问
        credentials: true,
      },
      proxy: {//服务器代理，防止跨域报错
        '/api': { // 1. 拦截指令：管家，凡是看到 '/api' 开头的请求，都要拦下来处理

          target: apiProxyTarget, // 2. 目标地址：实际的收信人是谁

          changeOrigin: true, // 3. 伪装身份：非常重要！
          // 解释：很多后端服务器会检查 "Host" 请求头。
          // 如果设置为 false：后端看到 Host 是 localhost:5173，可能会拒绝服务（觉得你是外人）。
          // 如果设置为 true：Vite 会把 Host 头改成 target 对应的地址。
          // 也就是管家对后端说：“我是自己人，我就是从你们那边来的。”

          rewrite: (path) => path.replace(/^\/api/, ''),// 4. 路径重写：撕掉标签
          headers: {
            Referer: apiProxyTarget,
            Origin: apiProxyTarget
          }
          // 解释：
          // 你发的是：/api/user
          // 但后端真正的接口可能只是：/user
          // 后端如果收到 /api/user 可能会报 404 找不到。
          // 所以管家在转发前，把 '/api' 这个为了方便识别的前缀给删掉，只把 '/user' 发给后端。
        }
      }
    }

  }
})