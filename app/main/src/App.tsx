import React, { useEffect } from 'react';
import { Button } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router'; // 注意：react-router-dom v6+ 这里的包名可能是 react-router-dom
import { useUserStore } from './store/user';

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

                <div style={styles.contentBody}>
                    {/* ⚠️ 核心：Qiankun 子应用挂载点 */}
                    {/* 子应用的内容会被自动插入到这个 div 中 */}
                    <div id="subapp-viewport"></div>

                    {/* 如果主应用自己也有路由页面，会在这里渲染 */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// 简单的内联样式对象，代替 CSS 文件
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    sidebar: {
        width: '200px',
        backgroundColor: '#001529', // 深色背景
        color: '#fff',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
    },
    logo: {
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '30px',
        color: '#fff',
    },
    navList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    navItem: {
        margin: '10px 0',
    },
    link: {
        display: 'block',
        color: '#bbb',
        textDecoration: 'none',
        padding: '10px 20px',
        transition: 'color 0.3s',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f2f5',
    },
    header: {
        height: '64px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
    },
    contentBody: {
        flex: 1,
        padding: '24px',
        overflow: 'auto', // 防止子应用内容溢出
        position: 'relative', // 这里的定位有助于子应用布局
    }
};

export default App;