import { Button, Card, Form, Input, message, Checkbox } from 'antd';
import { useNavigate } from 'react-router';
import useUserStore from '@/store/user';
import { loginRequest } from '@/api/user';
import styles from './login.module.less';

export default function Login() {
    const navigate = useNavigate();
    const { setAccessToken } = useUserStore();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        try {
            const res = await loginRequest({ ...values, remember: values.remember || true });
            // 假设接口返回结构如下，根据实际情况调整
            const token = res.data?.accessToken || res.data.accessToken || (res as any).token;

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
                {/* Temporary button for testing */}
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Button type="dashed" onClick={() => navigate('/chat')}>
                        Go to Chat (Temp)
                    </Button>
                </div>
                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[{ required: true, message: '请输入邮箱!' }]}
                    >
                        <Input size="large" placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password size="large" placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked" initialValue={true}>
                        <Checkbox>记住我</Checkbox>
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
