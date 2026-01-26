import Sider from 'antd/es/layout/Sider';
import styles from './ChatPage.module.less';
import AiSiderMenu from './components/Menu/AiSiderMenu';
import ChatView from './components/ChatView/ChatView';
import { useState } from 'react';

export default function ChatPage() {
    const [collapsed, setCollapsed] = useState(false);

    return <>
        <div className={styles.twoColumn}>
            <div className={styles.left}>
                <Sider
                    style={{ height: "100%" }}
                    trigger={null}
                    collapsible
                    // collapsed={collapsed}
                    // 【核心代码】设置收起后的宽度为 0
                    collapsedWidth={0}
                    // 可选：设置 0 宽度的触发器样式，或者直接隐藏自带 trigger 使用自定义按钮
                    zeroWidthTriggerStyle={{ top: '10px' }}
                >
                    <AiSiderMenu collapsed={collapsed} ></AiSiderMenu>
                </Sider>

            </div>
            <div className={styles.right}>
                <ChatView />
            </div>
        </div>
    </>
}