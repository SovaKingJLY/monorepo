import React from 'react';
import { Button, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './ChatSider.module.less';
import classNames from 'classnames';
import useAiChatStore from '@/store/aiChat';

interface ChatSiderProps {
    collapsed: boolean;
}

const ChatSider: React.FC<ChatSiderProps> = ({ collapsed }) => {
    const { sessions, currentSessionId, setCurrentSessionId, removeSession } = useAiChatStore();

    const handleNewChat = () => {
        setCurrentSessionId(null);
    };

    const handleSelectSession = (sessionId: string) => {
        setCurrentSessionId(sessionId);
    };

    const handleDelete = (sessionId: string) => {
        removeSession(sessionId);
    };

    return (
        <div className={styles.siderContainer}>
            <div className={styles.newChatBtnWrapper}>
                <Tooltip placement="right" title={collapsed ? "New Chat" : ""}>
                    <Button
                        className={styles.newChatBtn}
                        icon={<PlusOutlined />}
                        block={!collapsed}
                        onClick={handleNewChat}
                    >
                        {!collapsed && "New Chat"}
                    </Button>
                </Tooltip>
            </div>

            <div className={styles.menuList}>
                {sessions.map((session) => (
                    <div
                        key={session.sessionId}
                        className={classNames(styles.menuItem, {
                            [styles.active]: session.sessionId === currentSessionId
                        })}
                        onClick={() => handleSelectSession(session.sessionId)}
                        title={session.title}
                    >
                        <MessageOutlined className={styles.icon} />
                        {!collapsed && (
                            <>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {session.title || 'New Chat'}
                                </span>
                                {session.sessionId === currentSessionId && (
                                    <Popconfirm
                                        title="Delete this chat?"
                                        onConfirm={(e) => {
                                            e?.stopPropagation();
                                            handleDelete(session.sessionId);
                                        }}
                                        onCancel={(e) => e?.stopPropagation()}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <DeleteOutlined
                                            className="delete-icon"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ fontSize: 12, color: '#999', opacity: 0.8 }}
                                        />
                                    </Popconfirm>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {/* Collapsed View (Optional: show icons for recent chats) */}
                {collapsed && sessions.map(session => (
                    <Tooltip key={session.sessionId} placement="right" title={session.title}>
                        <div
                            className={classNames(styles.menuItem, {
                                [styles.active]: session.sessionId === currentSessionId
                            })}
                            onClick={() => handleSelectSession(session.sessionId)}
                            style={{ justifyContent: 'center', padding: '10px 0' }}
                        >
                            <MessageOutlined className={styles.icon} />
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

export default ChatSider;
