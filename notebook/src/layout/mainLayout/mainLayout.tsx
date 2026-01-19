import styles from './mainLayout.module.less'
import Left from '../../components/layout/left/left'
import Right from '../../components/layout/right/right'
import { getAllText, setPinTextHttp, setUnPinTextHttp } from '../../api/http/api'
import { createContext, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import Basement from '../../components/basement/basement'
import { useQueryClient } from '@tanstack/react-query'


interface info {
    texts: Text[],
    setPinText: (id: number) => Promise<void>,
    setCancelPinText: (id: number) => Promise<void>
}

export const InfoContext = createContext<info>({} as info);

export default function MainLayout() {
    const [texts, setTexts] = useState<Text[]>([]);
    const queryClient = useQueryClient(); // 获取那个“缓存池”管理者

    useEffect(() => {
        const init = async () => {
            const unorderList = await getAllText();
            // const orderList = unorderList.sort((a: Text, b: Text) => b.id - a.id);这里会覆盖原数据，不要直接进行排序
            setTexts(unorderList);
        }
        init();
    }, []);

    const setPinText = async (id: number) => {
        try {
            await setPinTextHttp(id);
            setTexts(texts.map((i: Text) => {
                if (i.id == id) {
                    return {
                        ...i,
                        state: '快速访问',
                    }
                }
                return i;
            }))
            queryClient.invalidateQueries({ queryKey: ['allPinTexts'] });
        } catch {

        }
    }
    const setCancelPinText = async (id: number) => {
        try {
            await setUnPinTextHttp(id);
            setTexts(texts.map((i: Text) => {
                if (i.id == id) {
                    return {
                        ...i,
                        state: '',
                    }
                }
                return i;
            }))
            queryClient.invalidateQueries({ queryKey: ['allPinTexts'] });
        } catch {

        }
    }

    const value = useMemo(() => ({ texts, setPinText, setCancelPinText }), [texts]);//这里传过去的是排好序的

    return <>
        <div className={styles.base}>
            <Left text={texts}></Left>
            <Basement>

                <InfoContext.Provider value={value}>
                    <Outlet ></Outlet>
                </InfoContext.Provider>

            </Basement>
            <Right text={texts}>

            </Right>
        </div>
    </>
}