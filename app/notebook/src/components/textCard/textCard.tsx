import styles from './textCard.module.less'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { CloseOutlined, PushpinOutlined, LoadingOutlined } from '@ant-design/icons';
import useUserStore from '../../store/user';

interface props {
    texts: Text[],
    tags: string,
    setPinText: (id: number) => Promise<void>,
    setCancelPinText: (id: number) => Promise<void>
};
export default function TextCard(props: props) {
    const singleItem = props;
    const nav = useNavigate();// 获取那个“缓存池”管理者
    const jump = (id: number) => {
        nav(`/text/${id}`)
    }
    const [isPinLoading, setIsPinLoading] = useState<number[]>([]);
    const [isCancelPinLoading, setIsCancelPinLoading] = useState<number[]>([]);
    const userStore = useUserStore();


    let [openState, setopenState] = useState(false);
    const open = () => {
        setopenState(!openState);
    }
    useEffect(() => {
        singleItem.texts.sort((a, b) => { return b.id - a.id })
    }, [singleItem.texts])


    const setPin = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // 阻止事件冒泡到父级 div
        setIsPinLoading([...isPinLoading, id]);
        await props.setPinText(id);
        setIsPinLoading((state) => state.filter((item) => item != id));
    }
    const setCancelPin = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // 阻止事件冒泡到父级 div
        setIsCancelPinLoading([...isCancelPinLoading, id]);
        await props.setCancelPinText(id);
        setIsCancelPinLoading((state) => state.filter((item) => item != id));
    }
    return <>
        <div>
            <div className={styles.chapterTitle} onClick={() => { open() }}>{singleItem.tags}</div>
            <div>

            </div>
            {(props.texts || []).map((item) => {
                return <div className={`${styles.mainContent} `} key={item.id} onClick={() => { jump(item.id) }}>
                    <div className={`${styles.textTitle} ${openState ? styles.mainContentOpen : ''}`}>
                        <div className={styles.mainTitle}>
                            <div>{item.title}
                            </div>
                            {userStore.accessToken ? <span>
                                {item.state ? '' : (isPinLoading.includes(item.id) ? <div className={styles.setPin}><LoadingOutlined /></div> : <PushpinOutlined onClick={(e) => setPin(e, item.id)} className={styles.setPin} />)}
                                {item.state == '快速访问' ? (isCancelPinLoading.includes(item.id) ? <div className={styles.setPin}><LoadingOutlined /></div> : <CloseOutlined onClick={(e) => setCancelPin(e, item.id)} className={styles.setCancelPin} />) : ''}
                            </span> : ''}
                        </div>
                    </div>
                </div>
            })}
        </div>

    </>
}