
import ButtonList from '../../buttonList/buttonList';
import styles from './right.module.less'
import { ClockCircleOutlined, PushpinOutlined } from '@ant-design/icons';
import { getAllPinText } from '../../../api/http/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from 'antd';
import useUserStore from '../../../store/user';

interface rightProp {
    text: Text[];
}
export default function Right(prop: rightProp) {
    const UserStore = useUserStore();
    const { data: pinText } = useQuery({
        queryKey: ['allPinTexts'], // 频道
        queryFn: () => getAllPinText(), // 传入你的 API 函数，不用await
        initialData: [], // 初始值
    });
    return <>
        <div className={styles.wrapper}>
            <Skeleton loading={UserStore.isLoading} paragraph={{ rows: 10 }}>
                <div>
                    <span><ClockCircleOutlined /> 最新</span>
                    {prop.text.slice(0, 5)?.map((item) => {
                        return <div key={item.id}>
                            <ButtonList path={`/text/${item.id}`} size='1rem'>
                                {item.tag}&nbsp;&nbsp;{item.title}
                            </ButtonList>
                        </div>
                    })}
                </div>
                <div>
                    <span><PushpinOutlined /> 固定访问</span>
                    {pinText.map((item) => {
                        return <div key={item.id}>
                            <ButtonList path={`/text/${item.id}`} size='1rem'>
                                {item.title}
                            </ButtonList>
                        </div>
                    })}
                </div>
            </Skeleton>

        </div>
    </>
}