import styles from './textCard.module.less'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router';
import { CloseOutlined, PushpinOutlined, LoadingOutlined } from '@ant-design/icons';
import useUserStore from '../../store/user';

interface TextItemProps {
    item: Text;
    openState: boolean;
    jump: (id: number) => void;
    isPinLoading: boolean;
    isCancelPinLoading: boolean;
    setPin: (e: React.MouseEvent, id: number) => void;
    setCancelPin: (e: React.MouseEvent, id: number) => void;
    hasAccessToken: boolean;
}

/**
 * Memoized item component to avoid unnecessary re-renders when other items' loading state changes
 * or when the parent TextCard re-renders for unrelated reasons.
 */
const TextItem = React.memo(({ 
    item, 
    jump, 
    isPinLoading, 
    isCancelPinLoading, 
    setPin, 
    setCancelPin,
    hasAccessToken
}: Omit<TextItemProps, 'openState'>) => {
    return (
        <div className={styles.mainContent} onClick={() => jump(item.id)}>
            <div className={`${styles.textTitle} ${styles.mainContentOpen}`}>
                <div className={styles.mainTitle}>
                    <div>{item.title}</div>
                    {hasAccessToken && (
                        <span>
                            {item.state ? '' : (
                                isPinLoading ? 
                                <div className={styles.setPin}><LoadingOutlined /></div> : 
                                <PushpinOutlined onClick={(e) => setPin(e, item.id)} className={styles.setPin} />
                            )}
                            {item.state === '快速访问' ? (
                                isCancelPinLoading ? 
                                <div className={styles.setPin}><LoadingOutlined /></div> : 
                                <CloseOutlined onClick={(e) => setCancelPin(e, item.id)} className={styles.setCancelPin} />
                            ) : ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

interface Props {
    texts: Text[];
    tags: string;
    setPinText: (id: number) => Promise<void>;
    setCancelPinText: (id: number) => Promise<void>;
}

/**
 * TextCard component displays a chapter/tag and its associated texts.
 * Optimized to handle large numbers of texts by using conditional rendering and memoization.
 */
export default function TextCard(props: Props) {
    const nav = useNavigate();
    const jump = (id: number) => {
        nav(`/text/${id}`);
    }

    const [isPinLoading, setIsPinLoading] = useState<number[]>([]);
    const [isCancelPinLoading, setIsCancelPinLoading] = useState<number[]>([]);
    const userStore = useUserStore();

    const [openState, setOpenState] = useState(false);
    const toggleOpen = () => {
        setOpenState(!openState);
    }

    // Sort texts only when they change
    const sortedTexts = useMemo(() => {
        return [...props.texts].sort((a, b) => b.id - a.id);
    }, [props.texts]);

    const setPin = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setIsPinLoading((prev) => [...prev, id]);
        try {
            await props.setPinText(id);
        } finally {
            setIsPinLoading((state) => state.filter((item) => item !== id));
        }
    }

    const setCancelPin = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setIsCancelPinLoading((prev) => [...prev, id]);
        try {
            await props.setCancelPinText(id);
        } finally {
            setIsCancelPinLoading((state) => state.filter((item) => item !== id));
        }
    }

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.chapterTitle} onClick={toggleOpen}>
                {props.tags}
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '10px', opacity: 0.6 }}>
                    ({props.texts.length})
                </span>
            </div>
            
            {/* 
                CRITICAL OPTIMIZATION: 
                Only render the list when openState is true.
                This prevents thousands of hidden DOM nodes from being rendered and reconciled,
                which was the main cause of the lag during expansion and initial load.
            */}
            {openState && sortedTexts.map((item) => (
                <TextItem
                    key={item.id}
                    item={item}
                    jump={jump}
                    isPinLoading={isPinLoading.includes(item.id)}
                    isCancelPinLoading={isCancelPinLoading.includes(item.id)}
                    setPin={setPin}
                    setCancelPin={setCancelPin}
                    hasAccessToken={!!userStore.accessToken}
                />
            ))}
        </div>
    );
}
