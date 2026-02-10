import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { registerMicroApps, start } from 'qiankun';
import { App as AntdApp } from 'antd'; // Ant Design 全局上下文
import { QueryClientProvider } from '@tanstack/react-query';
import 'antd/dist/reset.css'; // 样式重置

// 引入你的组件和配置
import App from './App';
import { queryClient } from './queryClient'; // 假设你有一个配置好的 queryClient

// --------------------------------------------------------------------------
// 1. 配置 Qiankun 子应用
// --------------------------------------------------------------------------
registerMicroApps([
  {
    name: 'aiChat',
    entry: '//localhost:5174', // 开发环境地址
    container: '#subapp-viewport', // 对应 App.tsx 里的 id
    activeRule: '/app/aiChat',     // 激活路由
  },
  {
    name: 'notebook',
    entry: '//localhost:5175',
    container: '#subapp-viewport',
    activeRule: '/app/notebook',
  },
]);

// --------------------------------------------------------------------------
// 2. 渲染 React 基座应用
// --------------------------------------------------------------------------
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    {/* Ant Design 的全局上下文 (Message, Modal 等) */}
    <AntdApp>
      {/* React Query 的数据流上下文 */}
      <QueryClientProvider client={queryClient}>
        {/* 路由上下文 */}
        <BrowserRouter>
          <Routes>
            {/* 通配符路由：任何路径都渲染 App，由 App 内部布局决定显示哪里 */}
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AntdApp>
  </React.StrictMode>
);

// --------------------------------------------------------------------------
// 3. 启动 Qiankun
// --------------------------------------------------------------------------
// start 放在最后调用即可
start({
  sandbox: { experimentalStyleIsolation: true }, // 建议开启样式隔离
});