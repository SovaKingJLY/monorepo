import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const activeSessionRef = useRef<string>('');
    const prevChatLengthRef = useRef<number>(0);
    const cacheRef = useRef(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 120,
            minHeight: 72,
        })
    );
    const [autoScroll, setAutoScroll] = useState(true); // 是否自动滚动到底部

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
            prevChatLengthRef.current = 0;
            cacheRef.current.clearAll();
            listRef.current?.recomputeRowHeights();
        }
    }, [activeSessionId]);

    const lastMessage = chatList[chatList.length - 1];
    const lastMessageContentLength = lastMessage?.content?.length ?? 0;
    const lastReasoningContentLength = lastMessage?.reasoningContent?.length ?? 0;

    // 新消息（或流式更新）时，重新测量最后一条并滚动到底部
    useLayoutEffect(() => {
        if (!chatList.length) return;

        const lastIndex = chatList.length - 1;
        const isNewMessage = prevChatLengthRef.current !== chatList.length;
        prevChatLengthRef.current = chatList.length;

        // 新消息或流式内容增长时，重新测量最后一条高度
        if (isNewMessage || isGenerating) {
            cacheRef.current.clear(lastIndex, 0);
            listRef.current?.recomputeRowHeights(lastIndex);
        }

        if ((isGenerating || isNewMessage) && autoScroll) {
            requestAnimationFrame(() => {
                listRef.current?.scrollToRow(lastIndex);
                const grid = chatContainerRef.current?.querySelector('.ReactVirtualized__Grid') as HTMLElement | null;
                if (grid) {
                    grid.scrollTop = grid.scrollHeight;
                }
            });
        }
    }, [chatList.length, lastMessageContentLength, lastReasoningContentLength, isGenerating, autoScroll]);

    // 监听滚动事件，判断是否需要停止自动滚动
    const handleScroll = useCallback(({ clientHeight, scrollHeight, scrollTop }: { clientHeight: number, scrollHeight: number, scrollTop: number }) => {
        const isBottom = scrollHeight - scrollTop - clientHeight <= 0; // 允许20px的误差
        if (isBottom) {
            setAutoScroll(true);
            console.log("可以自动滚动");
        } else {
            // 如果不在底部，且正在生成中，说明用户手动向上滚动了，暂停自动滚动
            // 注意：这里需要区分是自动滚动导致的 scrollTop 变化 还是 用户手动滚动的
            // 简单处理：只要不在底部，就视为用户想看上面的内容
            // 但产生的问题是：自动滚动过程中，offsetHeight变大，scrollTop还没跟上变大时，可能会误判不在底部
            // 通常 scrollToRow 会在渲染后同步执行，所以这里简单通过位置判断即可

            // 优化：只有在非生成状态，或者用户明确滚离底部较远时才取消
            // 这里为了响应"向上滑取消自动向下"，只要离开了底部就取消 (除了初次渲染瞬间)
            console.log("不要自动滚动");
            setAutoScroll(false);
        }
    }, []);

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
            <div className={styles.chat} ref={chatContainerRef}>
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
                            onScroll={handleScroll}
                            // scrollToAlignment="end"
                            overscanRowCount={4}
                        />
                    )}
                </AutoSizer>
            </div>
            {isHome && <h2 className={styles.welcomeTitle}>今天有什么可以帮到你？</h2>}
            <ChatInput className={isHome ? styles.homeInput : undefined} />
        </div>

    </>
}