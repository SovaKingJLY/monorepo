import { RouterProvider } from 'react-router'
import './App.less'
import router from './router/router'
import { lazy, Suspense, useEffect, useState } from 'react'
import useDarkStore from './store/darkMode'
import useUserStore from './store/user'
import { ConfigProvider } from 'antd'
import getThemeConfig from './css/themeConfig/themeConfig'
import { GlobalStyle } from './components/cssinJS/GlobalStyle'
import { getInfo } from './api/http/api'
import 'nprogress/nprogress.css'; // 必须引入这一行
function App() {
  const AiChat = lazy(() => import('./components/AIChat/AiChat'));
  const DarkMode = useDarkStore();
  const UserStore = useUserStore();
  let { isDark } = DarkMode;
  let [themeConfig, setThemeConfig] = useState({});

  useEffect(() => {
    setThemeConfig(getThemeConfig());
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
