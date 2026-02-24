import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { registerMicroApps } from 'qiankun';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import 'antd/dist/reset.css'; // Ant Design 5 样式重置 (v5 默认不需要 import css 但为了保险)
import { loginCheck } from './api/login';

import useDarkModeStore from './store/darkMode';
import { darkModeStoreBridge } from './store/darkMode';

// 触发持久化状态初始化
useDarkModeStore.getState();


// 预检请求（非 React 组件中直接调用即可，不需要 useEffect）
loginCheck().then((check) => {
    console.log(check, "这里");
}).catch(() => {
    // 错误在拦截器中处理
});

// 注册子应用
// {
//     name: 'aiChat',
//     entry: '//localhost:5174', // 假设的端口，后续需在子应用vite.config.ts配置
//     container: '#subapp-aichat',
//     activeRule: '/app/aiChat',
// },

registerMicroApps([
    {
        name: 'notebook',
        entry: '//localhost:5175',
        container: '#subapp-viewport',
        props: {
            baseURL: "ttttt",
            darkModeStore: darkModeStoreBridge,
        },
        activeRule: (location) => {
            // 在根路径 '/' 或者 '/app/notebook' 开头的路径下激活
            return location.pathname === '/' || location.pathname.startsWith('/app/notebook');
        },
    },
]);

// 启动 qiankun
// start(); Moved to App.tsx to ensure container exists

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
