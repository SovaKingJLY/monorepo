
import { Layout } from 'antd';
import styles from './floatTwoColumn.module.less'
const { Sider } = Layout;

interface floatTwoColumnProp {
    leftWidth: number,
    isCollapsed: boolean,
}
const floatTwoColumn = () => {
    return <>
        <div className={styles.twoColumn}>
            <Sider
                style={{ height: "100%" }}
                trigger={null}
                width={300}
                collapsible
                // collapsed={collapsed}
                // 【核心代码】设置收起后的宽度为 0
                collapsedWidth={0}
                // 可选：设置 0 宽度的触发器样式，或者直接隐藏自带 trigger 使用自定义按钮
                zeroWidthTriggerStyle={{ top: '10px' }}
            >

            </Sider>
            <div className={styles.right}>

            </div>
        </div>
    </>
}
export default floatTwoColumn;