import React from 'react';
import { createBrowserRouter, Navigate } from "react-router";
import { Spin } from 'antd';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
// import Index from "../pages/index";
import Login from "../pages/login/login";
import ChatPage from "../pages/chat/ChatPage";
// 引入 store
import useUserStore from "../store/user";

// 全局加载组件
const FullPageLoading = () => (
    <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <Spin size="large" />
    </div>
);

// 登录守卫：如果已登录，访问登录页会跳转到 chat
const LoginGuard = ({ children }: { children: React.ReactNode }) => {
    const isLogin = useUserStore(state => state.isLogin);
    const isLoading = useUserStore(state => state.isLoading);

    if (isLoading) return <FullPageLoading />;

    if (isLogin) {
        return <Navigate to="/chat" replace />;
    }
    return <>{children}</>;
};

// 鉴权守卫：如果未登录，访问受保护页面跳转到 /
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const isLogin = useUserStore(state => state.isLogin);
    const isLoading = useUserStore(state => state.isLoading);

    if (isLoading) return <FullPageLoading />;

    if (!isLogin) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const mainRouters = [{
    path: '/',
    element: <LoginGuard><Login /></LoginGuard>
}, {
    path: '/chat',
    element: <AuthGuard><ChatPage /></AuthGuard>
}, {
    path: '/chat/:id',
    element: <AuthGuard><ChatPage /></AuthGuard>
}];

const router = createBrowserRouter(mainRouters, {
    basename: qiankunWindow.__POWERED_BY_QIANKUN__ ? '/app/aiChat' : '/'
});

export default router;