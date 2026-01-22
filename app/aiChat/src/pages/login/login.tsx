import { Button, Card, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router';
import useUserStore from '@/store/user';
import { login } from '@/api/user';
import styles from './login.module.less';

export default function Login() {
    const navigate = useNavigate();
    const { setAccessToken } = useUserStore();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        try {
            const res = await login(values);
            // 假设接口返回结构如下，根据实际情况调整
            const token = res.data?.access_token || res.data.access_token || (res as any).token;

            if (token) {
                setAccessToken(token);
                messageApi.success('登录成功');
                setTimeout(() => {
                    navigate('/');
                }, 500);
            } else {
                console.log('Login response:', res);
                messageApi.error('登录失败：Token未返回');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            messageApi.error(error.message || '登录失败，请检查网络或账号密码');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            {contextHolder}
            <Card title="AI Chat 登录" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input size="large" placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password size="large" placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
