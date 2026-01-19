import { createBrowserRouter } from "react-router";
import MainLayout from "../layout/mainLayout/mainLayout";
import NotFound from "../pages/404/notFound";
import AuthGuard from "./guard";
import nProgress from "nprogress";


const modules = import.meta.glob('../pages/**/*.tsx');
const loadPage = async (path: string) => {
    //使用import.meta.glob可以实现动态导入，这里实现的是一个对象，属性值是()=>import()
    const importFn = modules[`${path}.tsx`] as () => Promise<any>;
    if (!importFn) {
        console.error(`路由文件路径错误: ${path} 未找到`);
        return { Component: NotFound };
    }
    nProgress.start(); // 开始进度条
    try {
        const module = await importFn(); // 等待网络下载
        nProgress.done()
        return {
            Component: module.default
        }; // 返回组件,lazy需要这样的格式
    } finally {
        // nProgress.done(); // 无论成功失败，结束进度条
    }
};
// dynamicImport: () => Promise<{ default: ComponentType<any> }>
const adminRouters = [{
    path: 'upload',
    lazy: async () => {
        return loadPage('../pages/upload/upload');
    }
}];

const showRouters = [
    {
        path: "/login/",
        lazy: async () => {
            return loadPage('../pages/login/Login_register');
        }
    }, {
        path: "/",
        lazy: async () => {
            return loadPage('../pages/home/home');
        }
    }, {
        path: '/text/:id',
        lazy: async () => {
            return loadPage('../pages/text/textShow');
        }
    }, {
        path: '/search/',
        lazy: async () => {
            return loadPage('../pages/search/searchText');
        }
    }, {
        path: '/*',
        element: <NotFound />
    },
];


const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: showRouters,
    }, {
        path: "admin/",
        element: <AuthGuard></AuthGuard>,
        children: adminRouters,
    }, {
        path: '/*',
        element: <NotFound />
    }
]);
export default router;