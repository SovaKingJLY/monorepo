import React, { useState } from 'react';
import { Button, Form, Input, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router';
import { register, type RegisterParams } from '../api/auth';

const { Title } = Typography;

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values: RegisterParams) => {
        setLoading(true);
        try {
            await register(values);
            message.success('注册成功，请登录');
            navigate('/login');
        } catch (error) {
            console.error(error);
            message.error('注册失败，请重试');
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
                        注册账户
                    </Title>
                </div>

                <Form
                    form={form}
                    name="register_form"
                    className="register-form"
                    onFinish={onFinish}
                    size="large"
                    scrollToFirstError
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名!', whitespace: true },
                            { min: 3, message: '用户名至少3个字符' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { type: 'email', message: '输入的邮箱格式不正确!' },
                            { required: true, message: '请输入邮箱!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="邮箱"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码!' },
                            { min: 6, message: '密码至少6个字符' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: '请确认密码!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="确认密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
                            注册
                        </Button>
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            已有账户? <Link to="/login">去登录</Link>
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
        background: '#f0f2f5',
        backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")',
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

export default Register;
