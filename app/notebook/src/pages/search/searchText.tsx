import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router'
import { textKeyList } from '../../utils';
import TextCard from '../../components/textCard/textCard';
import { useQueryClient } from '@tanstack/react-query';
import styles from './searchText.module.less'
import { App } from 'antd';
import { searchTextByKeyword, setPinTextHttp, setUnPinTextHttp } from '@/api/http/text/textRequest';

export default function SearchText() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword");
    const [texts, setTexts] = useState<Text[]>([]);
    const queryClient = useQueryClient();
    const { message } = App.useApp();

    const [loading, setLoading] = useState(true);

    const keyList = useMemo(() => {
        return textKeyList(texts);
    }, [texts]);

    useEffect(() => {
        const init = async () => {
            try {
                if (keyword) {
                    setLoading(true);
                    const res = await searchTextByKeyword(keyword);
                    setTexts(res);
                    setLoading(false);
                } else {
                    setLoading(false);
                    setTexts([]);
                }
            } catch {
                message.error("搜索错误");
                setLoading(false);
            }
        }
        init();
    }, [keyword]);

    const setPinText = async (id: number) => {
        try {
            await setPinTextHttp(id);
            setTexts((prevTexts) => prevTexts.map((i: Text) => {
                if (i.id == id) {
                    return { ...i, state: '快速访问' }
                }
                return i;
            }));
            queryClient.invalidateQueries({ queryKey: ['allPinTexts'] });
        } catch {
            message.error("设置快速访问失败");
        }
    }

    const setCancelPinText = async (id: number) => {
        try {
            await setUnPinTextHttp(id);
            setTexts((prevTexts) => prevTexts.map((i: Text) => {
                if (i.id == id) {
                    return { ...i, state: '' }
                }
                return i;
            }));
            queryClient.invalidateQueries({ queryKey: ['allPinTexts'] });
        } catch {
            message.error("取消快速访问失败");
        }
    }

    return <>
        <div className={styles.wrapper}>
            <div className={styles.singleText}>
                {keyList.size !== 0 ? Array.from(keyList.keys()).map((item) => {
                    return <div key={item}>
                        <TextCard tags={item} texts={keyList.get(item) || []} setPinText={setPinText} setCancelPinText={setCancelPinText}></TextCard>
                    </div>
                }) : (loading ? '加载中' : "没有数据")}
            </div>
        </div>
    </>
}
