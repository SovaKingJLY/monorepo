import { RouterProvider, createBrowserRouter, createMemoryRouter } from 'react-router'
import './App.less'
import { mainRouters } from './router/router'
import { ConfigProvider } from 'antd'
import getThemeConfig from '@repo/antd_config//themeConfig'
import { GlobalStyle } from '@repo/antd_config/GlobalStyle'
import { useEffect, useState, useMemo } from 'react'
import useDarkStore from './store/darkMode'
import useUserStore from './store/user'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

function App(props: any) {
  const DarkMode = useDarkStore();
  let { isDark } = DarkMode;
  let [themeConfig, setThemeConfig] = useState({});

  const { checkLogin } = useUserStore();

  // 根据当前运行模式选择路由策略
  const router = useMemo(() => {
    // 1. 如果明确指定为 widget 模式 (例如被主应用 float box 加载)，使用内存路由，不影响 url
    if (props?.appType === 'widget') {
      return createMemoryRouter(mainRouters, {
        initialEntries: ['/'], // 默认进入首页
      });
    }

    // 2. 也是作为 qiankun 子应用加载，但不是 widget (可能是通过路由加载的页面)
    //    或者独立运行
    return createBrowserRouter(mainRouters, {
      basename: qiankunWindow.__POWERED_BY_QIANKUN__ ? '/aiChat' : '/'
    });
  }, [props?.appType]);

  useEffect(() => {
    const init = async () => {
      console.log("初始化");
      await checkLogin();
    }
    init();
  }, []);

  useEffect(() => {
    setThemeConfig(getThemeConfig({ isDark }));
  }, [isDark])
  return (
    <>
      <ConfigProvider theme={themeConfig} prefixCls="app-aichat">
        <GlobalStyle scopeSelector=".app-aichat-root"></GlobalStyle>
        <div className="app-aichat-root">
          <RouterProvider router={router} />
        </div>
      </ConfigProvider>
    </>
  )
}

export default App
