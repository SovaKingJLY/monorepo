import { useNavigate, useParams } from 'react-router';
import styles from './textShow.module.less';
import { useCallback, useEffect, useState, useRef } from 'react'; // 引入 useRef
import { App, Button, Image, Skeleton } from 'antd'; // 引入 message 用于提示
import useTextFontSize from '../../store/state/textFontSize';
import useUserStore from '../../store/user';
import { getText } from '@/api/http/text/textRequest';
import { useRequest } from '@/api/http/text/useRequest';

// ... 你的 interface 定义 ...
interface Text {
    tag: string;
    title: string;
    content: string;
}

// 定义悬浮菜单的位置接口
interface SelectionPop {
    show: boolean;
    x: number;
    y: number;
    text: string;
}

const NOTEBOOK_QUOTE_EVENT = 'notebook:quote-text';
const NOTEBOOK_QUOTE_ACK_EVENT = 'notebook:quote-text:ack';

function getTextFromDom(node: any): string {
    if (!node) return '';
    if (node.type === 'text') return node.data ?? '';
    if (!Array.isArray(node.children)) return '';
    return node.children.map((child: any) => getTextFromDom(child)).join('');
}

export default function TextShow() {
    const nav = useNavigate();
    const { id } = useParams();
    const [parsedContent, setParsedContent] = useState<React.ReactNode>(null);
    const [textFontSize, setTextFontSize] = useState(1);
    const [isParsing, setIsParsing] = useState(false);

    // --- 新增：选中菜单的状态 ---
    const [selectionPop, setSelectionPop] = useState<SelectionPop>({ show: false, x: 0, y: 0, text: '' });
    // --- 新增：内容区域的 Ref，用于限定选中范围（可选）---
    const textContainerRef = useRef<HTMLDivElement>(null);

    const textFontSizeStore = useTextFontSize();
    const userStore = useUserStore();
    const app = App.useApp();

    const getTextService = useCallback(async (): Promise<Text> => {
        if (!id) {
            throw new Error('文章 id 不存在');
        }
        return await getText(Number(id));
    }, [id]);

    const {
        data: text,
        isLoading,
        refresh,
    } = useRequest<Text>(getTextService, { manual: true });

    // ... (获取文章数据的 useEffect 保持不变) ...
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (!id) {
            nav('/404/');
            return;
        }

        refresh()
            .then((res) => {
                document.title = res.title;
            })
            .catch((err: any) => {
                console.log(err);
                app.message.error("当前页面不存在，正在跳转");
                setTimeout(() => nav('/404/'), 3000);
            });
    }, [id, nav, refresh, app.message]);

    useEffect(() => {
        setTextFontSize(Number(textFontSizeStore.fontSize));
    }, [textFontSizeStore.fontSize]);

    // ... (动态加载库的 useEffect 保持不变) ...
    // 为了节省篇幅，这里略过 parse 逻辑，保持你原有的代码即可
    useEffect(() => {
        if (!text?.content) return;
        const loadLibrariesAndParse = async () => {
            setIsParsing(true);
            // ... 你的原有解析逻辑 ...
            // 假设这里最终 setParsedContent(result); setIsLoading(false);
            //动态导入富文本库
            try {
                const [{ default: parse, domToReact }, { Prism: SyntaxHighlighter }, { vscDarkPlus }, { default: DOMPurify }] = await Promise.all([
                    import('html-react-parser'),
                    import('react-syntax-highlighter'),
                    import('react-syntax-highlighter/dist/esm/styles/prism'),
                    import('dompurify')
                ]);
                // ... (复制你原有的解析配置逻辑) ...         吧 
                const htmlOptions = {
                    replace: (domNode: any) => {
                        // 1. 处理图片
                        if (domNode.name === 'img') {
                            const { style: rawStyle, ...restAttribs } = domNode.attribs;
                            const isBase64 = restAttribs.src?.slice(0, 4) === 'data';
                            const finalSrc = isBase64
                                ? restAttribs.src
                                : restAttribs.src + '?imageMogr2/format/webp/quality/20';

                            return (
                                <div className="image-wrapper">
                                    <Image
                                        {...restAttribs}
                                        src={finalSrc}
                                        preview={{
                                            src: restAttribs.src,
                                            onVisibleChange: (visible) => {
                                                const html = document.documentElement;
                                                html.style.scrollbarGutter = visible ? 'auto' : 'stable';
                                            },
                                        }}
                                    />
                                </div>
                            );
                        }

                        // 2. 处理代码块 <pre>
                        if (domNode.name === 'pre') {
                            const codeString = getTextFromDom(domNode);
                            let language = 'javascript';
                            const firstChild = domNode.children?.[0];
                            if (firstChild?.name === 'code' && firstChild.attribs?.class) {
                                const classAttr = firstChild.attribs.class;
                                if (classAttr.includes('language-')) {
                                    language = classAttr.replace('language-', '');
                                }
                            }

                            return (
                                <div style={{ fontSize: '14px', margin: '1em 0' }}>
                                    {/* 这里直接使用加载好的组件，不需要 Suspense */}
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={language}
                                        PreTag="div"
                                        showLineNumbers={true}
                                        wrapLongLines={true}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }

                        // 3. 处理行内代码 <code>
                        if (domNode.name === 'code' && domNode.parent?.name !== 'pre') {
                            return (
                                <span style={{
                                    backgroundColor: '#F0F0F0',
                                    padding: '0.2em 0.4em',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.85em',
                                    color: '#24292f'
                                }}>
                                    {domToReact(domNode.children)}
                                </span>
                            );
                        }
                    }
                };
                const sanitizedHtml = DOMPurify.sanitize(text.content, {
                    USE_PROFILES: { html: true },
                    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                });

                const result = parse(sanitizedHtml, htmlOptions as any); // 类型简单处理下
                setParsedContent(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsParsing(false);
            }
        };
        loadLibrariesAndParse();
    }, [text]);


    // --- 核心新增：监听文字选中逻辑 ---
    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection();

            // 1. 如果没有选中内容，或者选中的是空字符串，隐藏菜单
            if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
                setSelectionPop(prev => ({ ...prev, show: false }));
                return;
            }

            // 2. 获取选中的文本
            const selectedText = selection.toString();

            // 3. 获取选中区域的几何信息
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 4. 简单的边界检查（可选）：确保选中的是在文章内容区域内
            // if (textContainerRef.current && !textContainerRef.current.contains(selection.anchorNode)) {
            //    setSelectionPop(prev => ({ ...prev, show: false }));
            //    return;
            // }

            // 5. 计算按钮位置 (居中显示在选区上方)
            // rect.left: 选区左边距离视口左边的距离
            // rect.width: 选区宽度
            // window.scrollX/Y: 加上滚动条偏移量 (如果使用 position: fixed 则不需要加 scroll)

            // 这里我们使用 position: fixed，坐标基于视口
            const x = rect.left + rect.width / 2;
            const y = rect.top; // 选区顶部

            setSelectionPop({
                show: true,
                x,
                y,
                text: selectedText
            });
        };

        // 监听 mousedown，一旦点击其他地方准备重新选，就隐藏旧的按钮
        const handleMouseDown = () => {
            setSelectionPop(prev => ({ ...prev, show: false }));
        };

        // 绑定到 document 上，确保任何地方的交互都能响应
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    // --- 按钮点击处理示例 ---
    const handleQuote = () => {
        const quoteText = selectionPop.text?.trim();
        if (!quoteText) return;

        const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const payload = {
            text: quoteText,
            source: 'notebook',
            ts: Date.now(),
            requestId,
        };

        const ackHandler = (event: Event) => {
            const customEvent = event as CustomEvent<{ requestId?: string }>;
            if (customEvent?.detail?.requestId !== requestId) return;
            window.removeEventListener(NOTEBOOK_QUOTE_ACK_EVENT, ackHandler as EventListener);
            clearTimeout(timeoutId);
            app.message.success('已引用到 AI 输入框');
        };

        window.addEventListener(NOTEBOOK_QUOTE_ACK_EVENT, ackHandler as EventListener);
        const timeoutId = window.setTimeout(() => {
            window.removeEventListener(NOTEBOOK_QUOTE_ACK_EVENT, ackHandler as EventListener);
            app.message.warning('AI 聊天窗口未响应');
        }, 1000);

        window.dispatchEvent(new CustomEvent(NOTEBOOK_QUOTE_EVENT, { detail: payload }));

        setSelectionPop(prev => ({ ...prev, show: false }));
        window.getSelection()?.removeAllRanges();

    };


    const jump = () => {
        nav(`/admin/upload/?id=${id}`);
    };

    return (
        <>
            {/* 悬浮按钮渲染区域 */}
            {selectionPop.show && (
                <div
                    style={{
                        position: 'fixed',
                        top: selectionPop.y,
                        left: selectionPop.x,
                        transform: 'translate(-50%, -45px)', // 保持位置计算不变
                        zIndex: 1000,
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center', // 确保垂直居中
                        cursor: 'default',
                        userSelect: 'none'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* --- 修改开始：引用按钮 --- */}
                    <div
                        onClick={handleQuote}
                        style={{
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        引用
                    </div>

                    {/* 小三角箭头 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #333'
                    }}></div>
                </div>
            )}

            {(isLoading || isParsing) ? <Skeleton active paragraph={{ rows: 10 }} /> : (
                <div className={styles.sumWrapper}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.tag}>{text?.tag}</div>
                        <div className={styles.title}>{text?.title}</div>
                    </div>
                    {userStore.role == '管理员' ? <Button onClick={() => jump()}>修改</Button> : ''}
                </div>
            )}

            {!(isLoading || isParsing) && parsedContent && (
                <div
                    ref={textContainerRef} // 绑定 ref
                    style={{ fontSize: `${textFontSize}rem` }}
                    className={styles.text}
                >
                    {parsedContent}
                </div>
            )}
        </>
    );
}