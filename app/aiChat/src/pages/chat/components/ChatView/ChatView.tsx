import styles from './ChatView.module.less';
import ChatInput from '../Input/ChatInput';
import { useParams, useNavigate } from 'react-router';
import useAiChatStore from '@/store/aiChat';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

// 新增引入
import { App, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VariableSizeList as List, type ListChildComponentProps } from 'react-window';

const ESTIMATED_ITEM_SIZE = 180;

type ChatMessage = {
    role: string;
    content: string;
    reasoningContent?: string;
};

type RowData = {
    chatList: ChatMessage[];
    isGenerating: boolean;
    handleCopy: (text: string) => Promise<void>;
    setItemSize: (index: number, size: number) => void;
};

const MessageRow = memo(function MessageRow({ index, style, data }: ListChildComponentProps<RowData>) {
    const rowRef = useRef<HTMLDivElement>(null);

    const item = data.chatList[index];
    const isUser = item.role === 'user';
    const isLastMessage = index === data.chatList.length - 1;
    const showCopy = isUser || !isLastMessage || !data.isGenerating;

    useEffect(() => {
        const element = rowRef.current;
        if (!element) {
            return;
        }

        const updateSize = () => {
            data.setItemSize(index, element.getBoundingClientRect().height);
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [data, index]);

    return (
        <div style={style}>
            <div ref={rowRef} className={styles.rowItem}>
                <div
                    className={classNames(styles.message, {
                        [styles.userMessage]: isUser,
                        [styles.aiMessage]: !isUser
                    })}
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
                                        onClick={() => data.handleCopy(item.content)}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});


export default function ChatView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { curSession, aiChatState, getChatDatas, resetSession } = useAiChatStore();

    // 获取 message 实例用于提示
    const { message } = App.useApp();

    // 虚拟列表 refs
    const listRef = useRef<List>(null);
    const listOuterRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const itemSizeMapRef = useRef<Record<number, number>>({});
    const isNearBottomRef = useRef(true);
    const chatLengthRef = useRef(0);
    const [listSize, setListSize] = useState({ width: 0, height: 0 });

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

    const setItemSize = useCallback((index: number, size: number) => {
        if (itemSizeMapRef.current[index] !== size) {
            itemSizeMapRef.current[index] = size;
            listRef.current?.resetAfterIndex(index);

            // 流式输出导致最后一条消息高度变化时，若当前在底部附近则保持吸底
            if (index === chatLengthRef.current - 1 && isNearBottomRef.current) {
                requestAnimationFrame(() => {
                    listRef.current?.scrollToItem(chatLengthRef.current - 1, 'end');
                });
            }
        }
    }, []);

    const getItemSize = useCallback((index: number) => {
        return itemSizeMapRef.current[index] ?? ESTIMATED_ITEM_SIZE;
    }, []);

    const updateNearBottom = useCallback(() => {
        const scrollElement = listOuterRef.current;
        if (!scrollElement) {
            return;
        }

        const threshold = 120;
        isNearBottomRef.current = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - threshold;
    }, []);

    const scrollToBottom = useCallback(() => {
        if (chatLengthRef.current > 0) {
            listRef.current?.scrollToItem(chatLengthRef.current - 1, 'end');
        }
    }, []);

    // 会话切换时重置缓存高度
    useEffect(() => {
        itemSizeMapRef.current = {};
        listRef.current?.resetAfterIndex(0, true);
        isNearBottomRef.current = true;
    }, [activeSessionId]);

    // 监听容器大小变化
    useEffect(() => {
        const element = chatContainerRef.current;
        if (!element) {
            return;
        }

        const updateSize = () => {
            setListSize({
                width: element.clientWidth,
                height: element.clientHeight
            });

            if (isNearBottomRef.current) {
                requestAnimationFrame(() => {
                    scrollToBottom();
                });
            }
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [scrollToBottom]);

    // 记录当前消息数，供回调中使用
    useEffect(() => {
        chatLengthRef.current = chatList.length;
    }, [chatList.length]);

    // 新消息时：仅在接近底部时自动吸底
    useEffect(() => {
        if (chatList.length > 0 && isNearBottomRef.current) {
            scrollToBottom();
        }
    }, [chatList.length, curSession, isGenerating, scrollToBottom]);

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

    const rowData: RowData = {
        chatList: chatList as ChatMessage[],
        isGenerating,
        handleCopy,
        setItemSize
    };

    return <>
        <div className={classNames(styles.wrapper, { [styles.homeWrapper]: isHome })}>
            <div ref={chatContainerRef} className={styles.chat}>
                {listSize.height > 0 && listSize.width > 0 && (
                    <List
                        ref={listRef}
                        outerRef={listOuterRef}
                        className={styles.virtualList}
                        height={listSize.height}
                        width={listSize.width}
                        itemCount={chatList.length}
                        itemData={rowData}
                        itemSize={getItemSize}
                        estimatedItemSize={ESTIMATED_ITEM_SIZE}
                        onScroll={updateNearBottom}
                    >
                        {MessageRow}
                    </List>
                )}
            </div>
            {isHome && <h2 className={styles.welcomeTitle}>今天有什么可以帮到你？</h2>}
        </div>
        <ChatInput className={isHome ? styles.homeInput : undefined} />
    </>
}