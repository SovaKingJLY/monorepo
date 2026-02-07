import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { useEffect, useRef } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export default function ChatView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { curSession, aiChatState, getChatDatas, resetSession } = useAiChatStore();

    // 自动滚动到底部
    const bottomRef = useRef<HTMLDivElement>(null);

    // 1. 监听路由参数变化，同步到 store
    useEffect(() => {
        if (id) {
            // 如果 URL 有 ID，切换到该会话
            getChatDatas(id);
        } else {
            // 如果 URL 没有 ID，说明是新对话状态，重置当前会话 ID
            resetSession();
        }
    }, [id, getChatDatas, resetSession]);

    // 2. 监听 Store 的 curSession 变化，反向同步到 URL
    // 主要用于：新对话第一次发送消息后，Store 生成了 ID，需要更新 URL
    useEffect(() => {
        if (curSession && curSession !== id) {
            navigate(`/chat/${curSession}`);
        }
    }, [curSession, id, navigate]);

    // 优先使用路由参数中的 ID，如果没有则使用 store 中的 curSession
    const activeSessionId = id || curSession;
    // 获取当前会话数据的 chatDatas
    const chatList = (activeSessionId && aiChatState[activeSessionId]) ? aiChatState[activeSessionId].chatDatas : [];

    // 聊天列表更新时，自动滚动到底部
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatList.length, curSession]);
    return (
        <div className={styles.wrapper}>
            <div className={styles.chat}>
                {chatList.map((item, index) => {
                    const isUser = item.role === 'user';
                    return (
                        <div
                            key={index}
                            className={classNames(styles.message, {
                                [styles.userMessage]: isUser,
                                [styles.aiMessage]: !isUser
                            })}
                        >
                            <div className={styles.avatar}>
                                <Avatar
                                    style={{ backgroundColor: isUser ? '#1677ff' : '#52c41a' }}
                                    icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                                />
                            </div>
                            <div className={styles.content}>
                                <div className={styles.messageBubble} style={{
                                    backgroundColor: isUser ? '#e6f7ff' : '#f6ffed',
                                    border: isUser ? '1px solid #91caff' : '1px solid #b7eb8f'
                                }}>
                                    {item.reasoningContent && (
                                        <div className={styles.reasoning}>
                                            {item.reasoningContent}
                                        </div>
                                    )}
                                    {item.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} style={{ float: "left", clear: "both" }} />
            </div>
            <ChatInput />
        </div>
    );
}
