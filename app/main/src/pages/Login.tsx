import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router';
// 如果报错找不到 react-router，请检查是否应该用 react-router-dom，这里沿用 main.tsx 的风格
import { login, type LoginParams } from '../api/auth';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: LoginParams) => {
        setLoading(true);
        try {
            await login(values);
            message.success('登录成功');
            // 登录成功后跳转到首页或之前访问的页面
            navigate('/');
        } catch (error) {
            console.error(error);
            message.error('登录失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <Card
                style={styles.card}
                bodyStyle={{ padding: '40px' }}
                hoverable
            >
                <div style={styles.header}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                        系统登录
                    </Title>
                </div>

                <Form
                    name="login_form"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>

                        <a className="login-form-forgot" href="" style={{ float: 'right' }}>
                            忘记密码
                        </a>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
                            登录
                        </Button>
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            或者 <Link to="/register">立即注册!</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5', // 这是一个浅灰色背景，类似 Ant Design Pro
        backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")', // 可选背景纹理
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 110px',
        backgroundSize: '100%',
    },
    card: {
        width: 400,
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        borderRadius: '8px',
    },
};

export default Login;
