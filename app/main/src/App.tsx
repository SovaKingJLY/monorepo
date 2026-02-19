import React, { useEffect } from 'react';
import { Button } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router'; // 注意：react-router-dom v6+ 这里的包名可能是 react-router-dom
import { useUserStore } from './store/user';
import './App.less'

const App = () => {
    const navigate = useNavigate();
    const { isLogin, logout, checkLogin } = useUserStore();

    useEffect(() => {
        const init = async () => {
            await checkLogin();
        }
        init();
    }, []);

    const handleAuthClick = () => {
        if (isLogin) {
            logout();
        } else {
            navigate('/login');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        },
        sidebar: {
            width: '240px',
            backgroundColor: '#001529',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column' as 'column',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 10
        },
        logo: {
            height: '64px',
            lineHeight: '64px',
            paddingLeft: '24px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#002140',
            color: '#fff'
        },
        navList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        navItem: {
            margin: 0
        },
        link: {
            display: 'block',
            padding: '12px 24px',
            color: 'rgba(255,255,255,0.65)',
            textDecoration: 'none',
            transition: 'color 0.3s'
        },
        linkHover: {
            color: '#fff',
            backgroundColor: '#1890ff'
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as 'column',
            backgroundColor: '#f0f2f5',
            overflow: 'auto',
            position: 'relative' as 'relative'
        },
        header: {
            height: '64px',
            backgroundColor: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            zIndex: 1
        }
    };

    return (
        <div style={styles.container}>
            {/* 左侧侧边栏 */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>微前端主应用</div>
                <nav>
                    <ul style={styles.navList}>
                        <li style={styles.navItem}>
                            {/* 这里的 /app/aiChat 对应你注册子应用时的 activeRule */}
                            <Link to="/app/aiChat" style={styles.link}>🤖 AI Chat</Link>
                        </li>
                        <li style={styles.navItem}>
                            <Link to="/app/notebook" style={styles.link}>📓 Notebook</Link>
                        </li>
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', padding: '20px' }}>
                    <Button
                        type="primary"
                        block
                        onClick={handleAuthClick}
                        danger={isLogin}
                    >
                        {isLogin ? '注销' : '登录'}
                    </Button>
                </div>
            </aside>

            {/* 右侧主内容区 */}
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <h2>Main Application Base</h2>
                </header>

                <div style={{ flex: 1, position: 'relative' }}>
                    {/* ⚠️ 核心：Qiankun 子应用挂载点 */}
                    {/* 子应用的内容会被自动插入到这个 div 中 */}
                    <div id="subapp-viewport"></div>
                    <div id="subapp-aichat"></div>

                    {/* 如果主应用自己也有路由页面，会在这里渲染 */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


export default App;