import styles from './home.module.less';
import { useContext, useEffect } from 'react';
import { InfoContext } from '../../layout/mainLayout/mainLayout';
import TextCard from '../../components/textCard/textCard';
import { textKeyList } from '../../utils/textKeyList';
import { useLocation } from 'react-router';
import { Skeleton } from 'antd';

export default function Home() {
    const context = useContext(InfoContext);
    const keyMap = textKeyList(context.texts);
    const location = useLocation();
    useEffect(() => {
        if (location.pathname == '/')
            document.title = "JLYBLOG";
    }, [location])
    return <>
        <div className={styles.wrapper}>
            <div className={styles.singleText}>
                {
                    keyMap.size == 0 ? <Skeleton paragraph={{ rows: 10 }} />
                        : Array.from(keyMap).map(([tag, item]) => {
                            return <div key={tag}>
                                <TextCard tags={tag} texts={item} setPinText={context?.setPinText} setCancelPinText={context?.setCancelPinText}></TextCard>
                            </div>
                        })
                }
                {/* {Object.keys(keyList).length != 0 ? Object.keys(keyList).map((item) => {
                    return <div key={item}>
                        <TextCard tags={item} texts={keyList[item]} setPinText={context?.setPinText} setCancelPinText={context?.setCancelPinText}></TextCard>
                    </div>
                }) : <Skeleton paragraph={{ rows: 10 }} />} */}
            </div>
        </div>
    </>
}