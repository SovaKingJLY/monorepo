import { Button, Layout, theme } from 'antd';
import styles from './floatTwoColumn.module.less';
import { useState, type ReactElement, type ReactNode, type CSSProperties } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface floatTwoColumnProp {
    leftWidth: number;
    left: ReactElement;
    right?: ReactElement;
    // 新增 title 属性，类型为 ReactNode 这样既传字符串也可以传组件
    title?: ReactNode;
    isCollapsed: boolean,
    contentWidth?: number,
}

const FloatTwoColumn = ({ contentWidth = 800, ...props }: floatTwoColumnProp) => {
    const { token } = theme.useToken();

    // 定义组件局部的 CSS 变量，使得本组件不依赖全局 GlobalStyle，实现自包含
    const cssVarStyle = {
        '--color-bg-base': token.colorBgContainer,
        '--color-text': token.colorText,
        '--color-border': token.colorBorderSecondary, // 假设 less 里未来可能会用到边框
        // 如果有其他用到的变量，可以在这里继续补充映射
    } as CSSProperties;

    return (
        <Layout className={styles.layoutWrapper} style={cssVarStyle}>
            {/* 左侧侧边栏 */}
            <Sider
                trigger={null}
                collapsible
                collapsed={props.isCollapsed}
                width={props.leftWidth}
                collapsedWidth={0}
                // theme="light"
                className={styles.sider}
                style={{
                    overflow: 'hidden',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}
            >
                {props.left}
            </Sider>

            {/* 右侧主内容区 */}
            <div className={styles.rightContainer}>
                <div className={styles.headerBar}>
                    {props.title}
                </div>
                <div className={styles.contentScrollArea}>
                    <div className={styles.contentWrapper} style={{ padding: `0 calc((100% - ${contentWidth}px) / 2)` }}>
                        {props.right}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FloatTwoColumn;