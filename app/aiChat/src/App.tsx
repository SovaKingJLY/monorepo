import { RouterProvider } from 'react-router'
import './App.less'
import router from './router/router'
import { ConfigProvider } from 'antd'
import getThemeConfig from '@repo/antd_config//themeConfig'
import { GlobalStyle } from '@repo/antd_config/GlobalStyle'
import { useEffect, useState } from 'react'
import useDarkStore from './store/darkMode'
import useUserStore from './store/user'

function App() {
  const DarkMode = useDarkStore();
  let { isDark } = DarkMode;
  let [themeConfig, setThemeConfig] = useState({});

  const { checkLogin } = useUserStore();

  useEffect(() => {
    const init = async () => {
      await checkLogin();
    }
    init();
  }, []);

  useEffect(() => {
    setThemeConfig(getThemeConfig({ isDark }));
  }, [isDark])
  return (
    <>
      <ConfigProvider theme={themeConfig}>
        <GlobalStyle></GlobalStyle>
        <RouterProvider router={router} />
      </ConfigProvider>
    </>
  )
}

export default App
