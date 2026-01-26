import { Button, Form, Input } from "antd";
import styles from './ChatInput.module.less';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import useAiChatStore from "@/store/aiChat";

const { TextArea } = Input;

type FieldType = {
    prompt?: string;
};

export default function ChatInput() {
    const { aiChatState, curSession, sendMessage } = useAiChatStore();

    const [form] = Form.useForm();
    const currentSessionData = aiChatState[curSession];
    const isLoading = currentSessionData?.isSteamEnd === false;
    // const { sendMessage, isLoading } = 

    const onFinish = async (values: FieldType) => {
        sendMessage(values.prompt || '');
    };

    return <>
        <div className={styles.input}>
            <Form
                form={form}
                name="basic"
                style={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    width: '100%',
                }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <div className={styles.inputWrapper}>
                    <Form.Item<FieldType> noStyle name="prompt">
                        <TextArea
                            placeholder="输入提示词..."
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            disabled={isLoading}
                            variant="borderless"
                        />
                    </Form.Item>

                    <div className={styles.btnWrapper}>
                        <Form.Item noStyle>
                            <Button icon={<UploadOutlined />} disabled={isLoading} type="text" />
                        </Form.Item>
                        <Form.Item noStyle>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={isLoading}
                                icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                            >
                                {isLoading ? '发送中' : '发送'}
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </div>
    </>
}