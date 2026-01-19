import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
import uploadBundleQiniu from './plugins/uploadBundleQiniu';
//import qiniu from 'vite-plugin-qiniu'; // 引入插件
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  console.log(isProduction)
  return {
    envDir: './env',
    base: isProduction ? 'https://redsources.jlyproject.cn/vite/' : '/', //CDN
    plugins: [
      react(),
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
      // qiniu({
      //   accessKey: 'EIriimCUVKCk0G4gCFACezpYSZFvpZ6L8IvQqYUR',
      //   secretKey: 'oN_nA1SkDFDOpjxf3c4gfw_LGwtEGBb9TV-yzsDE',
      //   bucket: 'jlyred',
      //   rootName: "vite",
      // })
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
      proxy: {//服务器代理，防止跨域报错
        '/api': { // 1. 拦截指令：管家，凡是看到 '/api' 开头的请求，都要拦下来处理

          target: 'http://124.221.73.180:3002', // 2. 目标地址：实际的收信人是谁

          changeOrigin: true, // 3. 伪装身份：非常重要！
          // 解释：很多后端服务器会检查 "Host" 请求头。
          // 如果设置为 false：后端看到 Host 是 localhost:5173，可能会拒绝服务（觉得你是外人）。
          // 如果设置为 true：Vite 会把 Host 头偷偷改成 124.221.73.180:3002。
          // 也就是管家对后端说：“我是自己人，我就是从你们那边来的。”

          rewrite: (path) => path.replace(/^\/api/, ''),// 4. 路径重写：撕掉标签
          headers: {
            Referer: 'http://124.221.73.180:3002',
            Origin: 'http://124.221.73.180:3002'
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