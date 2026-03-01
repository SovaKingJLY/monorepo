import { App, Button, Input, Modal } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react';

interface verificationProp {
    isCorrect: () => void,
    isCheckCode: boolean,
    closeModel: () => void
}
export default function VerificationCode(prop: verificationProp) {
    const [code, setCode] = useState('');
    const [resCode, setResCode] = useState('');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const app = App.useApp();

    const generateCode = useCallback((len = 4) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }, []);

    const drawCaptcha = useCallback((captcha: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#f6f8fa';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < captcha.length; i++) {
            const fontSize = 30 + Math.floor(Math.random() * 8);
            const angle = (Math.random() - 0.5) * 0.6;
            const x = 20 + i * 40;
            const y = 60 + (Math.random() - 0.5) * 12;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = `rgb(${80 + Math.random() * 100}, ${80 + Math.random() * 100}, ${80 + Math.random() * 100})`;
            ctx.fillText(captcha[i], 0, 0);
            ctx.restore();
        }

        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${100 + Math.random() * 100}, 0.8)`;
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`;
            ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }, []);

    const refreshCaptcha = useCallback(() => {
        const nextCode = generateCode();
        setResCode(nextCode);
        drawCaptcha(nextCode);
    }, [drawCaptcha, generateCode]);

    useEffect(() => {
        if (prop.isCheckCode) {
            refreshCaptcha();
            setCode('');
        }
    }, [prop.isCheckCode, refreshCaptcha]);

    const handleOk = () => {
        if (code.trim().toUpperCase() === resCode) {
            prop.isCorrect();

        }
        else {
            app.message.error({ content: "验证码错误", duration: 2 });
            refreshCaptcha();
        }

    };

    const handleCancel = () => {
        prop.closeModel();
    };
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
            <canvas
                ref={canvasRef}
                width={200}
                height={100}
                onClick={refreshCaptcha}
                style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 12,
                    display: 'block'
                }}
            />
            <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>点击图片可刷新验证码</div>
            <Input size="large" placeholder='请输入验证码' value={code} onChange={(e) => setCode(e.target.value)} />
        </Modal>
    </>
}