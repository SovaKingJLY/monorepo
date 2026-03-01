import React from 'react';
import { Button, Checkbox, Form, Input, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router';
// 如果报错找不到 react-router，请检查是否应该用 react-router-dom，这里沿用 main.tsx 的风格
import { type LoginParams } from '../api/auth';
import styles from './Login.module.css';
import { useUserStore } from '../store/user';

const { Title } = Typography;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useUserStore();

    const onFinish = async (value: LoginParams) => {
        try {
            // 调用 store 的 login (store 内部调用 api)
            const success = await login({
                email: value.email || '',
                password: value.password || '',
                remember: value.remember || false
            });

            if (success) {
                message.success('登录成功');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
        }
    };
    const validateEmail = (_: any, value: string) => {
        const emailRegex = /^[\w.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {

            return Promise.reject(new Error("请输入邮箱"))
        }
        else if (!emailRegex.test(value)) {

            return Promise.reject(new Error('请输入正确的邮箱地址'))
        }
        else {

            return Promise.resolve()
        };
    }

    return (
        <div className={styles.container}>
            <Card
                className={styles.card}
                hoverable
            >
                <div className={styles.header}>
                    <Title level={2} className={styles.title}>
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
                        name="email"

                        rules={[{ required: true, validator: validateEmail }]}
                    >
                        <Input
                            prefix={<UserOutlined className={styles.siteFormItemIcon} />}
                            placeholder="邮箱"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className={styles.siteFormItemIcon} />}
                            type="password"
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className={styles.loginFormButton} block >
                            登录
                        </Button>ginLo
                        <div className={styles.registerLink}>
                            或者 <Link to="/register">立即注册!</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
