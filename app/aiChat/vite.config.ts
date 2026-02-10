import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 引入 Node.js 的 path 模块
import qiankun from 'vite-plugin-qiankun';
// https://vite.dev/config/
export default defineConfig({
  envDir: './env',

  plugins: [
    qiankun('aiChat', { // 'reactApp' 替换为你微应用实际的名字
      useDevMode: true
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      // 关键代码：告诉 Vite，遇到 '@' 就把它替换为 'src' 目录的绝对路径
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174, // 强制锁定端口，不要让它自动变
    strictPort: true, // 如果端口被占用，直接报错而不是尝试下一个
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
})
