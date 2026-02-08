
import { Layout } from 'antd';
import styles from './floatTwoColumn.module.less'
import type { ReactElement } from 'react';
const { Sider } = Layout;

interface floatTwoColumnProp {
    leftWidth: number,
    isCollapsed: boolean,
    left: ReactElement,
    right: ReactElement,
}
const FloatTwoColumn = (props: floatTwoColumnProp) => {
    return <>
        <div className={styles.twoColumn}>
            <Sider
                style={{ height: "100%", position: "sticky", top: "0px" }}
                trigger={null}
                width={props.leftWidth}
                theme="light"
                collapsible
                collapsed={props.isCollapsed}
                // 【核心代码】设置收起后的宽度为 0
                collapsedWidth={0}
                // 可选：设置 0 宽度的触发器样式，或者直接隐藏自带 trigger 使用自定义按钮
                zeroWidthTriggerStyle={{ top: '10px' }}
            >
                {props.left}
            </Sider>
            <div className={styles.rightContainer}>
                {props.right}
            </div>

        </div>
    </>
}
export default FloatTwoColumn;