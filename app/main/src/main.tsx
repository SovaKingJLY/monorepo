import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import 'antd/dist/reset.css'; // Ant Design 5 样式重置 (v5 默认不需要 import css 但为了保险)
import { loginCheck } from './api/login';

// 初始化 state
const actions = initGlobalState({
    user: {}, // 初始用户信息
    cookie: document.cookie // 将当前所有可读取到的非 HttpOnly Cookie 放入全局状态
});

// 监听 state 变更
actions.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev);
});

// 预检请求（非 React 组件中直接调用即可，不需要 useEffect）
loginCheck().then((check) => {
    console.log(check, "这里");
}).catch(() => {
    // 错误在拦截器中处理
});

// 注册子应用
registerMicroApps([
    {
        name: 'aiChat',
        entry: '//localhost:5174', // 假设的端口，后续需在子应用vite.config.ts配置
        container: '#subapp-viewport',
        activeRule: '/app/aiChat',
    },
    {
        name: 'notebook',
        entry: '//localhost:5175',
        container: '#subapp-viewport',
        activeRule: '/app/notebook',
    },
]);

// 启动 qiankun
start();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
