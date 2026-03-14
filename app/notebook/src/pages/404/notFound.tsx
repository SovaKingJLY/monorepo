import styles from './notFound.module.less'
import { Button } from 'antd'
import { useNavigate } from 'react-router'

/**
 * 404 页面 — 访问不存在的路由时展示
 * 提供视觉反馈和返回首页的操作入口
 */
export default function NotFound() {
    const nav = useNavigate();

    return (
        <div className={styles.main}>
            <div className={styles.errorCode}>404</div>
            <div className={styles.message}>
                访问的页面可能已被删除、更名或暂时不可用
            </div>
            <Button
                type="primary"
                size="large"
                onClick={() => nav('/')}
                className={styles.backBtn}
            >
                返回首页
            </Button>
        </div>
    )
}