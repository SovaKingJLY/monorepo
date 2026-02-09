import { Button, Form, Input } from "antd";
import styles from './ChatInput.module.less';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import useAiChatStore from "@/store/aiChat";
import classNames from 'classnames';

const { TextArea } = Input;

type FieldType = {
    prompt?: string;
};

interface ChatInputProps {
    className?: string;
}

export default function ChatInput(props: ChatInputProps) {
    const { aiChatState, curSession, sendMessage, processList, stopMessage } = useAiChatStore();

    // 获取 form 实例
    const [form] = Form.useForm();
    const currentSessionData = aiChatState[curSession];
    const isLoading = currentSessionData?.isSteamEnd === false;

    // 定义限制条件：当 processList 长度小于等于2 时视为受限状态
    const isRestricted = processList.length > 2;

    const onFinish = async (values: FieldType) => {
        // 防止发送空内容（可选，但推荐）
        if (!values.prompt || values.prompt.trim() === '') return;

        // 发送消息
        sendMessage(values.prompt);

        // 【关键修改】使用 form 实例重置表单，这样才能清空输入框 UI
        form.resetFields();
    };

    // 监听回车键发送（为了更好的体验，通常需要支持 Ctrl+Enter 或 Enter 发送）
    // const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         e.preventDefault(); // 阻止默认换行
    //         if (!isButtonDisabled) {
    //             form.submit();
    //         }
    //     }
    // };

    return (
        <div className={styles.input}>
            <Form
                form={form}
                name="basic"
                className={styles.chatForm}
                onFinish={onFinish}
                autoComplete="off"
            >
                <div className={styles.inputWrapper}>
                    <Form.Item<FieldType> noStyle name="prompt">
                        <TextArea
                            placeholder={isRestricted ? "请等待..." : "给AI助手发送消息.."}
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            disabled={isLoading} // 加载时禁用输入框
                            variant="borderless"
                        // onKeyDown={handleKeyDown} // 绑定回车发送事件
                        />
                    </Form.Item>

                    <div className={styles.btnWrapper}>
                        <Form.Item noStyle>
                            <Button icon={<UploadOutlined />} disabled={isLoading} type="text" />
                        </Form.Item>
                        <Form.Item noStyle>
                            {isLoading ?
                                <Button
                                    type="primary"
                                    onClick={() => stopMessage()}
                                    icon={<LoadingOutlined />}
                                >
                                    停止发送
                                </Button> :
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    // 【关键修改】这里同时判断加载状态和列表长度
                                    disabled={isRestricted}
                                    icon={<SendOutlined />}
                                >
                                    {isRestricted ? "请等待" : "发送"}
                                </Button>
                            }
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </div>
    );
}