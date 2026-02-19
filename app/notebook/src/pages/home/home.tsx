import styles from './home.module.less';
import { useContext, useEffect } from 'react';
import { InfoContext } from '../../layout/mainLayout/mainLayout';
import TextCard from '../../components/textCard/textCard';
import { textKeyList } from '../../utils/textKeyList';
import { useLocation } from 'react-router';
import { Skeleton, Button } from 'antd';
import { getGlobalActions } from '../../main';

export default function Home() {
    const context = useContext(InfoContext);
    const keyMap = textKeyList(context.texts);
    const location = useLocation();
    useEffect(() => {
        if (location.pathname == '/')
            document.title = "JLYBLOG";
    }, [location])

    // 向 aiChat 发送示例数据
    const sendDataToAiChat = () => {
        const actions = getGlobalActions();
        if (actions && actions.setGlobalState) {
            actions.setGlobalState({
                quoteMessage: '这是来自 notebook 的引用文本内容'
            });
            console.log('已发送数据到 aiChat');
        } else {
            console.warn('未在 qiankun 环境中运行，无法发送数据');
        }
    };

    return <>
        <div className={styles.wrapper}>
            <div style={{ marginBottom: '20px' }}>
                <Button type="primary" onClick={sendDataToAiChat}>
                    向 aiChat 发送示例数据
                </Button>
            </div>
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