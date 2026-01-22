import { RouterProvider } from 'react-router'
import './App.less'
import router from './router/router'
import { lazy, Suspense, useEffect, useState } from 'react'
import useDarkStore from './store/darkMode'
import useUserStore from './store/user'
import { ConfigProvider } from 'antd'
import getThemeConfig from '@repo/antd_config//themeConfig'
import { GlobalStyle } from '@repo/antd_config/GlobalStyle'

import 'nprogress/nprogress.css';
import { getInfo } from './api/http/text/textRequest'

function App() {
  const AiChat = lazy(() => import('./components/AIChat/AiChat'));
  const DarkMode = useDarkStore();
  const UserStore = useUserStore();
  let { isDark } = DarkMode;
  let [themeConfig, setThemeConfig] = useState({});

  useEffect(() => {
    setThemeConfig(getThemeConfig({ isDark }));
  }, [isDark])

  useEffect(() => {//取出token,设置全局变量,和后端进行检验
    const init = async () => {
      if (UserStore.accessToken) {
        try {
          const res = await getInfo();
          UserStore.setAccessToken(res.accessToken);
          UserStore.setRole(res.role);
          UserStore.setIsLoading(false);
        } catch {
          UserStore.logout();
          UserStore.setIsLoading(false);
        }
      } else UserStore.setIsLoading(false);
    }
    init();
  }, [])


  return (
    <>
      {/* ConfigProvider用于配置antd的react context传递css in js信息，而GlobalStyle用于将css in js的数据转换成全局css变量 */}
      <ConfigProvider theme={themeConfig}>
        <GlobalStyle></GlobalStyle>
        {UserStore.role &&
          <Suspense fallback={<div></div>}>
            <AiChat></AiChat>
          </Suspense>
        }
        <RouterProvider router={router} />
      </ConfigProvider>
    </>
  )
}

export default App
