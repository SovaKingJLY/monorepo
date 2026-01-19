import { Form, Checkbox, Input, Button, App } from "antd"
import type { FormProps } from 'antd';
import { loginRequest } from "../../../../api/http/api";
import { useNavigate } from "react-router";
import useUserStore from "../../../../store/user";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import styles from './login.module.less'
type FieldType = {
    email: string;
    password: string;
    remember: boolean;
};
export default function Login() {
    const { message } = App.useApp();
    const nav = useNavigate();
    const [form] = Form.useForm();
    const UserStore = useUserStore();
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
    const onFinish: FormProps<FieldType>['onFinish'] = async (value) => {//values是填入的值
        try {
            message.loading({ content: '正在加载...', key: "login" });
            const res = await loginRequest({ email: value.email, password: value.password, remember: value.remember });
            if (form.getFieldValue('remember')) {
                UserStore.setAccessToken(res.accessToken);
                UserStore.setRole(res.role);
            }
            else
                UserStore.setAccessToken(res.accessToken);
            message.success({ content: '登录成功', key: "login", duration: 2 });
            nav('/');
        } catch (e) {
            //全局抛出message显示
            message.error({ content: `${e}`, key: "login", duration: 2 })
        }

    };
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return <>
        <div className={styles.wrapper}>
            <Form
                form={form}
                name="log"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 24 }}

                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                requiredMark={false}
                style={{ width: "500px" }}
            >
                <Form.Item<FieldType>
                    label="电子邮箱"
                    name="email"
                    rules={[{ required: true, validator: validateEmail }]}
                >
                    <Input prefix={<MailOutlined />} size="large" />
                </Form.Item>
                <Form.Item<FieldType>
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password prefix={<LockOutlined />} size="large" />
                </Form.Item>
                <Form.Item<FieldType>
                    name="remember"
                    valuePropName="checked"
                    wrapperCol={{ offset: 0, span: 24 }}
                >
                    <Checkbox>记住我</Checkbox>
                </Form.Item>

                <Form.Item<FieldType> >
                    <Button type="primary" htmlType="submit" block size="large">
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>

    </>
}