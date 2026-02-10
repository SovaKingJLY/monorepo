import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router';

const { Header, Content, Sider } = Layout;

const App = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">
                        <Link to="/app/aiChat">AI Chat</Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/app/notebook">Notebook</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0 }}>
                    <h2 style={{ textAlign: 'center', margin: 0 }}>Main Application Base</h2>
                </Header>
                <Content style={{ margin: '16px' }}>
                    {/* Qiankun 子应用挂载点 */}
                    <div id="subapp-viewport" style={{ minHeight: '100%', background: '#fff', padding: 24 }}></div>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
