import { useNavigate, useParams } from 'react-router';
import { getText } from '../../api/http/api';
import styles from './textShow.module.less';
import { useEffect, useState } from 'react'; // 移除 lazy, 增加 useRef
import { App, Button, Image, Skeleton } from 'antd';
import useTextFontSize from '../../store/state/textFontSize';
import useUserStore from '../../store/user';

// 注意：这里移除了静态 import
// import parse, { domToReact } from 'html-react-parser';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Text {
    tag: string;
    title: string;
    content: string;
}

export default function TextShow() {
    const nav = useNavigate();
    const { id } = useParams();
    const [text, setText] = useState<Text>();
    // 新增：用于存储解析后的 React Node
    const [parsedContent, setParsedContent] = useState<React.ReactNode>(null);
    const [textFontSize, setTextFontSize] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const textFontSizeStore = useTextFontSize();
    const userStore = useUserStore();
    const app = App.useApp();

    // 1. 获取文章数据的逻辑 (保持不变)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const init = async () => {
            if (!id) { nav('/404/'); return; }
            try {
                const res = await getText(Number(id));
                // 注意：这里不直接 setIsLoading(false)，等库加载完再取消 loading
                setText(res);
                document.title = res.title;
            } catch (err: any) {
                app.message.error("当前页面不存在，正在跳转");
                setTimeout(() => nav('/404/'), 3000);
            }
        };
        init();
    }, [id]);

    useEffect(() => {
        setTextFontSize(Number(textFontSizeStore.fontSize));
    }, [textFontSizeStore.fontSize]);

    const jump = () => {
        nav(`/admin/upload/?id=${id}`);
    };

    // --- 核心修改：动态加载库并解析 HTML ---
    useEffect(() => {
        if (!text?.content) return;

        const loadLibrariesAndParse = async () => {
            try {
                // 并行加载所有需要的库
                // 这样只有进入这个页面且获取到数据后，才会下载这些大文件
                const [
                    { default: parse, domToReact },
                    { Prism: SyntaxHighlighter }, // 处理具名导出
                    { vscDarkPlus }
                ] = await Promise.all([
                    import('html-react-parser'),
                    import('react-syntax-highlighter'),
                    import('react-syntax-highlighter/dist/esm/styles/prism')
                ]);

                // --- 辅助函数：提取纯文本 (移到了内部) ---
                const getTextFromDom = (domNode: any): string => {
                    if (domNode.type === 'text') return domNode.data;
                    if (domNode.children?.length) {
                        return domNode.children.map((child: any) => getTextFromDom(child)).join('');
                    }
                    return '';
                };

                // --- 解析配置 ---
                const htmlOptions = {
                    replace: (domNode: any) => {
                        // 1. 处理图片
                        if (domNode.name === 'img') {
                            const { style: rawStyle, ...restAttribs } = domNode.attribs;
                            const isBase64 = restAttribs.src?.slice(0, 4) === 'data';
                            const finalSrc = isBase64
                                ? restAttribs.src
                                : restAttribs.src + '?imageMogr2/format/webp/quality/15';

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

                // 执行解析
                const result = parse(text.content, htmlOptions);
                setParsedContent(result);
            } catch (error) {
                console.error("库加载失败", error);
            } finally {
                // 无论是数据加载完还是库加载完，最后取消 Loading
                setIsLoading(false);
            }
        };

        loadLibrariesAndParse();

    }, [text]); // 依赖 text，当 text 获取到后触发

    return (
        <>
            {isLoading ? <Skeleton active paragraph={{ rows: 10 }} /> : (
                <div className={styles.sumWrapper}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.tag}>{text?.tag}</div>
                        <div className={styles.title}>{text?.title}</div>
                    </div>
                    {userStore.role == '管理员' ? <Button onClick={() => jump()}>修改</Button> : ''}
                </div>
            )}

            {/* 内容区域 */}
            {!isLoading && parsedContent && (
                <div style={{ fontSize: `${textFontSize}rem` }} className={styles.text}>
                    {parsedContent}
                </div>
            )}
        </>
    );
}