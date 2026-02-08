import Sider from 'antd/es/layout/Sider';
import styles from './ChatPage.module.less';
import AiSiderMenu from './components/Menu/AiSiderMenu';
import ChatView from './components/ChatView/ChatView';
import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MoonOutlined, SearchOutlined } from '@ant-design/icons';
import useDarkStore from '@/store/darkMode';
import { FloatTwoColumn } from '@repo/sovaui';

export default function ChatPage() {
    const { isDark, setDark } = useDarkStore();
    const [collapsed, setCollapsed] = useState(false);

    const toDark = () => {
        setDark(!isDark);
    }


    const left = <div className={styles.left}>
        <div className={styles.siderTop}>
            <div className={styles.logo}>
                LOGO
            </div>
        </div>
        <div className={styles.menuWrapper}>
            <AiSiderMenu collapsed={collapsed} />
        </div>
    </div>
    const right = <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <div className={styles.collBtn}>
            <Tooltip title="search">
                <Button type="primary" shape="circle" icon={<MoonOutlined />} onClick={toDark} />
            </Tooltip>
            <Tooltip title="search">
                <Button shape="circle" icon={<SearchOutlined />} onClick={() => { setCollapsed(!collapsed) }} />
            </Tooltip>
        </div>
        <div className={styles.content}>
            <ChatView />
        </div>

    </div>
    return <>
        <FloatTwoColumn left={left} right={right} isCollapsed={collapsed} leftWidth={300}>
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
    </>
}