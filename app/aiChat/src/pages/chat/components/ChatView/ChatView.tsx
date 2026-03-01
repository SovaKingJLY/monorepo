import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { App, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import type { ListRowProps } from 'react-virtualized';
import 'react-virtualized/styles.css';

export default function ChatView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { curSession, aiChatState, getChatDatas, resetSession } = useAiChatStore();

    const { message } = App.useApp();

    // 虚拟滚动：行高缓存 & List 实例引用
    const cacheRef = useRef(
        new CellMeasurerCache({ fixedWidth: true, defaultHeight: 150 })
    );
    const listRef = useRef<List>(null);

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

    // 是否靠近底部（阈值 150px），初始值 true（列表为空时视为在底部）
    const isNearBottomRef = useRef(true);
    // 上一次渲染的消息条数，用于区分「新消息」还是「流式内容更新」
    const prevChatLengthRef = useRef(0);

    // 3. 会话切换时，清空缓存并重置状态
    useEffect(() => {
        cacheRef.current.clearAll();
        listRef.current?.forceUpdateGrid();
        isNearBottomRef.current = true;
        prevChatLengthRef.current = 0;
    }, [activeSessionId]);

    // 滚到虚拟列表的绝对底部（直接操作 DOM）
    // 双 RAF：等待 recomputeRowHeights 触发的第一次重渲 + CellMeasurer 测量后触发的第二次重渲全部完成
    const scrollToVirtualBottom = useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Grid._scrollingContainer 是 react-virtualized 内部的 overflow:auto 滚动容器
                const container = (listRef.current as any)?.Grid?._scrollingContainer as HTMLElement | null;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        });
    }, []);

    // 4. 消息列表变化：区分「新增消息」与「流式内容追加」
    useEffect(() => {
        if (chatList.length === 0) {
            prevChatLengthRef.current = 0;
            return;
        }
        const lastIndex = chatList.length - 1;
        // 清除最后一行高度缓存，重新测量
        cacheRef.current.clear(lastIndex, 0);
        listRef.current?.recomputeRowHeights(lastIndex);

        const isNewMessage = chatList.length > prevChatLengthRef.current;
        prevChatLengthRef.current = chatList.length;

        // 新消息（条数增加）→ 强制吸底；流式更新 → 仅靠近底部时吸底
        if (isNewMessage || isNearBottomRef.current) {
            scrollToVirtualBottom();
        }
    }, [chatList, scrollToVirtualBottom]);

    // List 滚动回调：实时更新「是否靠近底部」
    const handleScroll = useCallback(({ clientHeight, scrollHeight, scrollTop }: {
        clientHeight: number;
        scrollHeight: number;
        scrollTop: number;
    }) => {
        const THRESHOLD = 150; // px
        isNearBottomRef.current = scrollTop + clientHeight >= scrollHeight - THRESHOLD;
    }, []);

    // 复制功能
    const handleCopy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success('复制成功');
        } catch (err) {
            console.error('复制失败:', err);
            message.error('复制失败');
        }
    }, [message]);

    // 虚拟列表行渲染器
    const rowRenderer = useCallback(({ index, key, style, parent }: ListRowProps) => {
        const item = chatList[index];
        if (!item) return null;
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
                    <div ref={registerChild as any} style={style}>
                        {/* 用 paddingBottom 代替 margin，确保 CellMeasurer offsetHeight 能包含底部间距 */}
                        <div style={{ paddingBottom: '24px' }}>
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
                                        {item.reasoningContent && (
                                            <div className={styles.reasoning}>
                                                {item.reasoningContent}
                                            </div>
                                        )}
                                        {isUser ? (
                                            <div>{item.content}</div>
                                        ) : (
                                            <div className="markdown-body" style={{ overflow: 'hidden' }}>
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
                                            </div>
                                        )}
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
                    </div>
                )}
            </CellMeasurer>
        );
    }, [chatList, isGenerating, handleCopy]);

    return (
        <>
            <div className={classNames(styles.wrapper, { [styles.homeWrapper]: isHome })}>
                <div className={styles.chat}>
                    {!isHome && (
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    ref={listRef}
                                    height={height}
                                    width={width}
                                    rowCount={chatList.length}
                                    rowHeight={cacheRef.current.rowHeight}
                                    deferredMeasurementCache={cacheRef.current}
                                    rowRenderer={rowRenderer}
                                    overscanRowCount={5}
                                    onScroll={handleScroll}
                                />
                            )}
                        </AutoSizer>
                    )}
                </div>
                {isHome && <h2 className={styles.welcomeTitle}>今天有什么可以帮到你？</h2>}
            </div>
            <ChatInput className={isHome ? styles.homeInput : undefined} />
        </>
    );
}