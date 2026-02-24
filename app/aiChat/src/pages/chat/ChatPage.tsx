import styles from './ChatPage.module.less';
import AiSiderMenu from './components/Menu/AiSiderMenu';
import ChatView from './components/ChatView/ChatView';
import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, OpenAIOutlined } from '@ant-design/icons';
import useDarkStore from '@/store/darkMode';
import { FloatTwoColumn } from '@repo/sovaui';
import { getGlobalState } from '../../main';

export default function ChatPage() {
    const { updateDarkWithGlobal } = useDarkStore();
    const [collapsed, setCollapsed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(window.innerWidth);
    const [notebookData, setNotebookData] = useState<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // 父容器宽度的 30%
    const siderWidth = containerWidth * 0.2;

    // 自适应内容宽度，防止在小窗口（如悬浮窗）中溢出
    const contentWidth = containerWidth > 800 ? 800 : containerWidth;

    useEffect(() => {
        if (containerWidth < 768) {
            setCollapsed(true);
        }
    }, [containerWidth]);

    // 监听全局状态变化
    useEffect(() => {
        const currentState = getGlobalState();
        if (currentState?.quoteMessage) {
            setNotebookData(currentState.quoteMessage);
        }

        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<any>;
            const state = customEvent?.detail;
            if (state?.quoteMessage) {
                setNotebookData(state.quoteMessage);
            }
        };

        window.addEventListener('aichat-global-state-change', handler as EventListener);
        return () => {
            window.removeEventListener('aichat-global-state-change', handler as EventListener);
        };
    }, []);

    const toDark = () => {
        updateDarkWithGlobal();
    }


    const left = <div className={styles.left}>
        <div className={styles.siderTop}>
            <div className={styles.logo}>
                <OpenAIOutlined style={{ fontSize: 24, marginRight: 8 }} />
                <span>AIGC</span>
            </div>
        </div>
        <div className={styles.menuWrapper}>
            <AiSiderMenu collapsed={collapsed} />
        </div>
    </div>



    const title = <div className={styles.collBtn}>
        <Button shape="circle" icon={<MoonOutlined />} onClick={toDark} />
        <Button shape="circle" onClick={() => { setCollapsed(!collapsed) }} style={{ marginBottom: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
    </div>

    const right = <ChatView quoteMessage={notebookData} />
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <FloatTwoColumn
            left={left}
            right={right}
            isCollapsed={collapsed}
            leftWidth={siderWidth}
            title={title}
            contentWidth={contentWidth} // 传入计算后的宽度
        >
        </FloatTwoColumn>

        {/* <div className={styles.twoColumn}>
            <Sider
                style={{ height: "100%" }}
                trigger={null}
                width={300}
                collapsible
                collapsed={collapsed}
                // 【核心代码】设置收起后的宽度为 0
                collapsedWidth={0}
                // 可选：设置 0 宽度的触发器样式，或者直接隐藏自带 trigger 使用自定义按钮
                zeroWidthTriggerStyle={{ top: '10px' }}
            >
                <div className={styles.siderTop}>
                    <div className={styles.logo}>
                        我是LOGO
                    </div>
                </div>
                <div className={styles.menuWrapper}>
                    <AiSiderMenu collapsed={collapsed} />
                </div>
            </Sider>
            <div className={styles.right}>
                <div className={styles.collBtn}>
                    <Tooltip title="search">
                        <Button type="primary" shape="circle" icon={<MoonOutlined />} onClick={toDark} />
                    </Tooltip>
                    <Tooltip title="search">
                        <Button shape="circle" icon={<SearchOutlined onClick={() => { setCollapsed(!collapsed) }} />} />
                    </Tooltip>
                </div>
                <ChatView />
            </div>
        </div> */}
    </div>
}