import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';

// 新增引入
import { App, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkBreaks from 'remark-breaks';

export default function ChatView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { curSession, aiChatState, getChatDatas, resetSession } = useAiChatStore();

    // 获取 message 实例用于提示
    const { message } = App.useApp();

    // 自动滚动到底部
    const bottomRef = useRef<HTMLDivElement>(null);

    // 1. 监听路由参数变化，同步到 store
    useEffect(() => {
        if (id) {
            getChatDatas(id);
        } else {
            resetSession();
        }
    }, [id, getChatDatas, resetSession]);

    // 2. 监听 Store 的 curSession 变化
    useEffect(() => {
        if (curSession && curSession !== id) {
            navigate(`/chat/${curSession}`);
        }
    }, [curSession, id, navigate]);

    const activeSessionId = id || curSession;
    const currentSessionData = activeSessionId ? aiChatState[activeSessionId] : undefined;
    const chatList = currentSessionData ? currentSessionData.chatDatas : [];
    const isGenerating = currentSessionData?.isSteamEnd === false;

    // 是否为首页（无会话ID）
    const isHome = !id;

    // 滚动到底部
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        console.log(chatList);
    }, [chatList.length, curSession]);

    // 复制功能函数
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success("复制成功");
        } catch (err) {
            console.error('复制失败:', err);
            message.error("复制失败");
        }
    };

    return <>
        <div className={classNames(styles.wrapper, { [styles.homeWrapper]: isHome })}>
            <div className={styles.chat}>
                {chatList.map((item, index) => {
                    const isUser = item.role === 'user';
                    const isLastMessage = index === chatList.length - 1;
                    const showCopy = isUser || !isLastMessage || !isGenerating;

                    return (
                        <div
                            key={index}
                            className={classNames(styles.message, {
                                [styles.userMessage]: isUser,
                                [styles.aiMessage]: !isUser
                            })}

                        >
                            <div className={classNames({ [styles.content]: !isUser })}>
                                <div className={classNames(styles.messageBubble, {
                                    [styles.userBubble]: isUser
                                })}>
                                    {/* 思考过程内容 */}
                                    {item.reasoningContent && (
                                        <div className={styles.reasoning}>
                                            {item.reasoningContent}
                                        </div>
                                    )}

                                    {/*主要内容 - 使用 ReactMarkdown 渲染 */}
                                    {isUser ? <div>{item.content}</div> : <div className="markdown-body" style={{ overflow: 'hidden' }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code(props: any) {
                                                    const { node, inline, className, children, ...rest } = props;
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            {...rest}
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...rest}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {item.content.replace(/\n\n+/g, '\n')}
                                        </ReactMarkdown>
                                        {/* {item.content} */}
                                    </div>}
                                </div>
                                <div className={classNames(styles.tools, { [styles.userTools]: isUser })}>
                                    {showCopy && (
                                        <Tooltip title="复制">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<CopyOutlined />}
                                                className={styles.copyBtn}
                                                onClick={() => handleCopy(item.content)}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} style={{ float: "left", clear: "both" }} />
            </div>
            {isHome && <h2 className={styles.welcomeTitle}>今天有什么可以帮到你？</h2>}
        </div>
        <ChatInput className={isHome ? styles.homeInput : undefined} />
    </>
}