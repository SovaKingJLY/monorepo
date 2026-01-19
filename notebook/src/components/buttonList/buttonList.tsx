import type { ReactNode } from 'react'
import styles from './buttonList.module.less'
import { Link, useNavigate } from 'react-router'
import { Tooltip } from 'antd';


interface prop {
    path?: string,
    children: ReactNode,
    size?: string
    // onClick: () => void
}
export default function ButtonList(prop: prop): ReactNode {
    let nav = useNavigate();
    const jump = () => {
        if (prop.path)
            nav(prop.path)
    }
    return <>
        {!prop.path ?
            <div className={styles.innerWrapper} onClick={jump} style={{ fontSize: prop.size }}>
                {prop.children}
            </div>
            : <Link to={prop.path} className={styles.innerWrapper}>
                <Tooltip title={prop.children} placement="left">
                    <div style={{ fontSize: prop.size }} className={styles.content}>
                        {prop.children}
                    </div>
                </Tooltip>
            </Link>
        }

    </>
}