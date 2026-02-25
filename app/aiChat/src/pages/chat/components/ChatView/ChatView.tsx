import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

// 新增引入
import { App, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, type ListRowRenderer } from 'react-virtualized';

export default function ChatView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { curSession, aiChatState, getChatDatas, resetSession } = useAiChatStore();

    // 获取 message 实例用于提示
    const { message } = App.useApp();

    const listRef = useRef<List>(null);
    const activeSessionRef = useRef<string>('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const cacheRef = useRef(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 120,
            minHeight: 72,
        })
    );

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

    // 会话切换时重置高度缓存
    useEffect(() => {
        const sessionKey = activeSessionId || '';
        if (activeSessionRef.current !== sessionKey) {
            activeSessionRef.current = sessionKey;
            cacheRef.current.clearAll();
            listRef.current?.recomputeRowHeights();
            setIsAtBottom(true);
        }
    }, [activeSessionId]);

    // 新消息（或流式更新）时，重新测量最后一条
    useEffect(() => {
        if (!chatList.length) return;
        const lastIndex = chatList.length - 1;
        cacheRef.current.clear(lastIndex, 0);
        listRef.current?.recomputeRowHeights(lastIndex);
        if (isAtBottom || isGenerating) {
            requestAnimationFrame(() => {
                listRef.current?.scrollToRow(lastIndex);
            });
        }
    }, [chatList, isAtBottom, isGenerating]);

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

    const handleListResize = useCallback(() => {
        cacheRef.current.clearAll();
        listRef.current?.recomputeRowHeights();
    }, []);

    const handleListScroll = useCallback(({ clientHeight, scrollHeight, scrollTop }: {
        clientHeight: number;
        scrollHeight: number;
        scrollTop: number;
    }) => {
        const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
        setIsAtBottom(distanceToBottom <= 48);
    }, []);

    const rowRenderer = useCallback<ListRowRenderer>(({ index, key, parent, style }) => {
        const item = chatList[index];
        const isUser = item.role === 'user';
        const isLastMessage = index === chatList.length - 1;
        const showCopy = isUser || !isLastMessage || !isGenerating;

        return (
            <CellMeasurer
                cache={cacheRef.current}
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
            >
                {({ registerChild }) => (
                    <div ref={registerChild} style={{ ...style, paddingBottom: 24, boxSizing: 'border-box' }}>
                        <div
                            className={classNames(styles.message, {
                                [styles.userMessage]: isUser,
                                [styles.aiMessage]: !isUser
                            })}
                            style={{ marginBottom: 0 }}
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
                    </div>
                )}
            </CellMeasurer>
        );
    }, [chatList, isGenerating]);

    return <>
        <div className={classNames(styles.wrapper, { [styles.homeWrapper]: isHome })}>
            <div className={styles.chat}>
                <AutoSizer onResize={handleListResize}>
                    {({ width, height }) => (
                        <List
                            ref={listRef}
                            width={width}
                            height={height}
                            rowCount={chatList.length}
                            rowHeight={cacheRef.current.rowHeight}
                            deferredMeasurementCache={cacheRef.current}
                            rowRenderer={rowRenderer}
                            overscanRowCount={4}
                            onScroll={handleListScroll}
                            scrollToAlignment="end"
                            scrollToIndex={chatList.length > 0 && (isAtBottom || isGenerating) ? chatList.length - 1 : undefined}
                        />
                    )}
                </AutoSizer>
            </div>
            {isHome && <h2 className={styles.welcomeTitle}>今天有什么可以帮到你？</h2>}
        </div>
        <ChatInput className={isHome ? styles.homeInput : undefined} />
    </>
}