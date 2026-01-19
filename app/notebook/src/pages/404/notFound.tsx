import styles from './notFound.module.less'
export default function NotFound() {

    return <>
        <div className={styles.main}>
            访问的页面可能已被删除、更名或暂时不可用。
        </div>
    </>
}