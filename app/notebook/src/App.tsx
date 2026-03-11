import { RouterProvider } from 'react-router'
import './App.less'
import router from './router/router'
import { useEffect, useState } from 'react'
import useDarkStore from './store/darkMode'
import useUserStore from './store/user'
import { ConfigProvider } from 'antd'
import getThemeConfig from '@repo/antd_config//themeConfig'
import { GlobalStyle } from '@repo/antd_config/GlobalStyle'

import 'nprogress/nprogress.css';
import { getInfo } from './api/http/text/textRequest'
import { loginCheck } from './api/http/admin/adminRequest'

function App() {
  // const AiChat = lazy(() => import('./components/AIChat/AiChat'));
  const DarkMode = useDarkStore();
  const UserStore = useUserStore();
  let { isDark } = DarkMode;
  let [themeConfig, setThemeConfig] = useState({});

  useEffect(() => {
    setThemeConfig(getThemeConfig({ isDark }));
  }, [isDark])

  useEffect(() => {//取出token,设置全局变量,和后端进行检验
    const init = async () => {
      try {
        await Promise.all([loginCheck(), getInfo()]);
        UserStore.setIsLogin(true);
        UserStore.setRole('管理员');//目前就管理员
        UserStore.setIsLoading(false);
      } catch {
        UserStore.setIsLoading(false);
        UserStore.logout();
        console.log("登录失效");
      }
    }
    // loginCheck().then((check) => {
    //   console.log(check, "这里");
    //   try {
    //     const res = await getInfo();
    //     UserStore.setRole(res.role);
    //     UserStore.setIsLoading(false);
    //   } catch {
    //     UserStore.logout();
    //     UserStore.setIsLoading(false);
    //   }
    // }).catch(() => {
    //   console.log("登录失效");
    //   // 错误在拦截器中处理
    // });

    init();
  }, [])


  return (
    <>
      {/* ConfigProvider用于配置antd的react context传递css in js信息，而GlobalStyle用于将css in js的数据转换成全局css变量 */}
      <ConfigProvider theme={themeConfig} prefixCls="app-notebook">
        <GlobalStyle scopeSelector=".app-notebook-root"></GlobalStyle>
        <div className="app-notebook-root">
          {/* {UserStore.role &&
          <Suspense fallback={<div></div>}>
            <AiChat></AiChat>
          </Suspense>
        } */}
          <RouterProvider router={router} />
        </div>
      </ConfigProvider>
    </>
  )
}

export default App
