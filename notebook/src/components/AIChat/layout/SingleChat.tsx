import { App, Button, Collapse, Tooltip, } from 'antd'
import styles from './SingleChat.module.less'
import { CopyOutlined, DownOutlined, LoadingOutlined, RedoOutlined, UpOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface prop {
    chatData: chatData,
    isEnd: boolean,
    onFinish: (obj: { [key: string]: any }) => void
}
export default function SingleChat(prop: prop) {//这个组件只渲染一个对话
    const { message } = App.useApp();
    const collapseItem = [{
        key: '1',
        label: `展开思考`, // 引用 useState 变量
        children: <div>{prop.chatData.reasoningContent}</div>,
    }];

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(prop.chatData.content);
            message.success("复制成功");
            // 2秒后重置状态
        } catch (err) {
            console.error('复制失败:', err);
        }
    };
    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(prop.chatData.content);
            message.success("复制成功");
            // 2秒后重置状态
        } catch (err) {
            console.error('复制失败:', err);
        }
    };


    return <>
        <div className={styles.center}>
            {(prop.chatData.content && prop.chatData.role == 'user') && <>
                <div className={styles.prompt}>{prop.chatData.content}</div>
                <div className={styles.promptBtn}>
                    <Tooltip title="copy" zIndex={999999} placement="bottom">
                        <Button shape="circle" icon={<CopyOutlined />} onClick={copyPrompt} />
                    </Tooltip>
                </div>
            </>
            }
            {
                (prop.chatData.role == 'assistant') && <>
                    <div className={styles.thinking}>
                        {prop.chatData.reasoningContent ? <Collapse className={styles.collapseCustom} items={collapseItem} ghost expandIcon={({ isActive }) => prop.isEnd ? (isActive ? <DownOutlined /> : <UpOutlined />) : <LoadingOutlined />} /> : ''}
                    </div>
                    <div className={styles.content}>
                        <ReactMarkdown
                            // 使用插件支持表格等 GFM 语法
                            remarkPlugins={[remarkGfm]}
                            // 自定义渲染组件
                            components={{
                                // 2. 这里给 props 加上类型，通常用 any 处理第三方库复杂的类型推导是比较稳妥的做法
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
                            {prop.chatData.content}
                        </ReactMarkdown>
                    </div>
                </>

            }
            {
                (prop.chatData.role == 'assistant' && prop.isEnd && prop.chatData.content) &&
                <div className={styles.endBtn}>
                    <Tooltip title="redo" zIndex={999999} placement="bottom">
                        <Button shape="circle" icon={<RedoOutlined />} />
                    </Tooltip>
                    <Tooltip title="copy" zIndex={999999} placement="bottom">
                        <Button shape="circle" icon={<CopyOutlined />} onClick={copy} />
                    </Tooltip>
                </div>
            }
        </div>
    </>
}