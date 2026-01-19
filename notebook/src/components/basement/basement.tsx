
import type { ReactNode } from 'react'
import styles from './basement.module.less'

interface prop {
    children: ReactNode,
}
export default function Basement(prop: prop) {
    return <>
        <div className={styles.wrapper}>
            <div className={styles.singleText}>
                {prop.children}
            </div>
        </div>
    </>
}