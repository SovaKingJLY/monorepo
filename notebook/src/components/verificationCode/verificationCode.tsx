import { App, Button, Input, Modal } from 'antd'
import { useCallback, useState } from 'react';
import Captcha from 'react-captcha-code';

interface verificationProp {
    isCorrect: () => void,
    isCheckCode: boolean,
    closeModel: () => void
}
export default function VerificationCode(prop: verificationProp) {
    const [code, setCode] = useState('');
    const [resCode, setResCode] = useState('');
    const app = App.useApp();

    const handleOk = () => {
        if (code === resCode) {
            prop.isCorrect();

        }
        else {
            app.message.error({ content: "验证码错误", duration: 2 });
        }

    };

    const handleCancel = () => {
        prop.closeModel();
    };
    const handleChange = useCallback((captcha: string) => {
        console.log('当前验证码:', captcha);
        setResCode(captcha);
        // setCaptchaCode(captcha);
    }, []);
    return <>
        <Modal
            title="请完成验证码"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={prop.isCheckCode}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="submit" type="primary" onClick={handleOk}>
                    提交
                </Button>,
                <Button key="back" onClick={handleCancel}>
                    返回
                </Button>,
            ]}
        >
            <Captcha
                charNum={4}
                onChange={handleChange}
                width={200}
                height={100}
            />
            <Input size="large" placeholder='请输入验证码' value={code} onChange={(e) => setCode(e.target.value)} />
        </Modal>
    </>
}