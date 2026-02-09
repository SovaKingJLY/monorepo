import { Button, Layout } from 'antd';
import styles from './floatTwoColumn.module.less';
import { useState, type ReactElement, type ReactNode } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface floatTwoColumnProp {
    leftWidth: number;
    left: ReactElement;
    right?: ReactElement;
    // 新增 title 属性，类型为 ReactNode 这样既传字符串也可以传组件
    title?: ReactNode;
    isCollapsed: boolean,
}

const FloatTwoColumn = (props: floatTwoColumnProp) => {
    // 使用内部状态控制折叠，保证组件开箱即用
    // const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <Layout className={styles.layoutWrapper}>
            {/* 左侧侧边栏 */}
            <Sider
                trigger={null}
                collapsible
                collapsed={props.isCollapsed}
                width={props.leftWidth}
                collapsedWidth={0}
                theme="light"
                className={styles.sider}
                style={{
                    borderRight: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}
            >
                <div style={{ width: props.leftWidth, padding: '10px' }}>
                    {props.left}
                </div>
            </Sider>

            {/* 右侧主内容区 */}
            <div className={styles.rightContainer}>
                {/* 顶部 Header：包含折叠按钮 和 Title */}
                <div className={styles.headerBar}>
                    {/* <Button
                        type="text"
                        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={styles.triggerButton}
                    /> */}

                    {/* 标题区域
                    {props.title && (
                        <div className={styles.headerTitle}>
                            {props.title}
                        </div>
                    )} */}
                    {props.title}
                </div>

                {/* 核心内容区域：独立滚动 */}
                <div className={styles.contentScrollArea}>
                    <div className={styles.contentWrapper}>
                        {props.right}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FloatTwoColumn;