import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, theme, message, Avatar } from 'antd';
import { SendOutlined, ClearOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import styles from './ChatPage.module.less';
import ChatSider from './components/ChatSider';
import useAiChatStore from '@/store/aiChat';
import getStreamData from '@/api/aiChat';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const ChatPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        currentSessionId,
        sessions,
        sessionChatMap,
        addMessageToSession,
        updateLastMessageContent,
        addSession,
        setCurrentSessionId,
        fetchSessions,
        fetchSessionMessages
    } = useAiChatStore();

    // Init: Fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    // Fetch history if needed when switching sessions
    useEffect(() => {
        if (currentSessionId && !sessionChatMap[currentSessionId]) {
            fetchSessionMessages(currentSessionId);
        }
    }, [currentSessionId, sessionChatMap]);

    // 
    // Use current session or default to a temporary one
    const [tempSessionId, setTempSessionId] = useState('');
    const sessionId = currentSessionId || tempSessionId;

    const chatList = sessionId ? (sessionChatMap[sessionId] || []) : [];

    // Reset temp session when switching to "New Chat" (currentSessionId becomes null)
    useEffect(() => {
        // If there is no active session (user clicked New Chat), ensure we have a fresh temp ID.
        // If there IS an active session, we don't need temp ID.
        if (!currentSessionId) {
            setTempSessionId(Date.now().toString());
        } else {
            setTempSessionId('');
        }
    }, [currentSessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatList, isLoading]);

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;

        const targetSessionId = sessionId;
        const msgContent = inputValue;
        const newMsg = { role: 'user' as const, content: msgContent };

        // 0. If this is a new session (not in store yet), add it
        const isNewSession = !sessions.some(s => s.sessionId === targetSessionId);
        if (isNewSession) {
            addSession({
                sessionId: targetSessionId,
                title: msgContent.slice(0, 20) || 'New Chat',
                updatedAt: new Date().toISOString()
            });
            // Promote temp session to current session
            setCurrentSessionId(targetSessionId);
        }

        // 1. Add User Message
        addMessageToSession(targetSessionId, newMsg);
        setInputValue('');
        setIsLoading(true);

        // 2. Add Assistant Placeholder
        addMessageToSession(targetSessionId, { role: 'assistant', content: '', reasoningContent: '' });

        // 3. Prepare History
        const history = chatList.map(m => ({ role: m.role, content: m.content }));
        const apiMessages = [...history, { role: 'user', content: msgContent }];

        // 4. Call Stream API
        getStreamData(
            apiMessages,
            (update) => {
                updateLastMessageContent(targetSessionId, update.content, update.reasoning);
            },
            () => {
                setIsLoading(false);
            },
            (err) => {
                message.error('Failed: ' + err.message);
                setIsLoading(false);
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        if (confirm('Clear current conversation?')) {
            setTempSessionId(Date.now().toString());
        }
    };

    return (
        <Layout className={styles.container}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={260}
                style={{ borderRight: '1px solid #f0f0f0' }}
            >
                <ChatSider collapsed={collapsed} />
            </Sider>

            <Layout>
                <Content className={styles.mainContent}>
                    <div className={styles.chatArea}>
                        {chatList.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
                                <h2>AI Chat Assistant</h2>
                                <p>Start a conversation...</p>
                            </div>
                        ) : (
                            <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 20 }}>
                                {chatList.map((msg, index) => (
                                    <div key={index} style={{ marginBottom: 24, display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 16 }}>
                                        <Avatar
                                            icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                            style={{ backgroundColor: msg.role === 'user' ? '#1677ff' : '#52c41a', flexShrink: 0 }}
                                        />
                                        <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                            {msg.role === 'assistant' && msg.reasoningContent && (
                                                <div style={{
                                                    marginBottom: 8,
                                                    padding: '8px 12px',
                                                    background: '#f0f2f5',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    color: '#666',
                                                    borderLeft: '3px solid #d9d9d9',
                                                    width: '100%'
                                                }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Thinking Process</div>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.reasoningContent}</div>
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '10px 16px',
                                                borderRadius: 12,
                                                background: msg.role === 'user' ? '#1677ff' : '#fff',
                                                color: msg.role === 'user' ? '#fff' : '#333',
                                                boxShadow: msg.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word'
                                            }}>
                                                {msg.content}
                                                {!msg.content && !msg.reasoningContent && isLoading && index === chatList.length - 1 && (
                                                    <span style={{ opacity: 0.5 }}>Thinking...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className={styles.inputWrapper}>
                        <div className={styles.inputBox}>
                            <TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me anything..."
                                autoSize={{ minRows: 1, maxRows: 6 }}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <div className={styles.actions}>
                                <div style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }} onClick={handleClear}>
                                    <ClearOutlined /> Clear context
                                </div>
                                <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<SendOutlined />}
                                    onClick={handleSend}
                                    loading={isLoading}
                                    disabled={!inputValue.trim()}
                                />
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default ChatPage;
