import React, { useRef, useState } from 'react'
import styles from './AiChat.module.less'
import { Button, FloatButton, } from 'antd';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Icon from '../icon/Icon';
import Sider from 'antd/es/layout/Sider';
import ChatLayout from './layout/AIChatMain/ChatLayout';
import { useAiChatStore } from '../../store/aiChatStore';
import AiSiderMenu from './layout/menu/AiSiderMenu';
import useThrottle from '../../hooks/useThrottle';

interface Pos {
    nowX: number,
    nowY: number,
}

interface Size {
    width: number,
    height: number,
}
export default function AiChat() {
    const aiChatStore = useAiChatStore();

    // 1. 位置状态
    let [pos, setPos] = useState<Pos>({ nowX: window.innerWidth - 800, nowY: 200 });
    // 2. 【新增】尺寸状态 (默认 300x400)
    let [size, setSize] = useState<Size>({ width: 800, height: 600 });

    let [isShow, setIsShow] = useState(false);
    const [transformOrigin, setTransformOrigin] = useState({ x: 0, y: 0 });

    const [collapsed, setCollapsed] = useState(false);

    const [chatDatas, setChatDatas] = useState<chatData[]>([]);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMove = useThrottle((e: MouseEvent) => {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        setPos({ nowX: newX, nowY: newY });
    }, 16);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        e.stopPropagation(); // 防止冒泡
        dragOffset.current = {
            x: e.clientX - pos.nowX,
            y: e.clientY - pos.nowY
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // --- 【新增】调整大小逻辑 (Resize) ---
    const resizeStart = useRef({ x: 0, y: 0, startW: 0, startH: 0 });

    const handleResizeMove = useThrottle((e: MouseEvent) => {
        // 计算移动距离
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;

        // 更新宽高，同时设置最小宽高防止窗口消失 (例如 min 200px)
        setSize({
            width: Math.max(300, resizeStart.current.startW + dx),
            height: Math.max(300, resizeStart.current.startH + dy)
        });
    }, 16)

    const handleResizeMouseUp = () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
    }

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // 关键：防止触发父级的拖拽移动事件
        e.preventDefault();  // 防止选中文字

        // 记录按下时的 鼠标位置 和 初始宽高
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            startW: size.width,
            startH: size.height
        };

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeMouseUp);
    }

    // --- 显隐逻辑 ---
    const toggleShow = (e: React.MouseEvent<HTMLElement>) => {
        if (!isShow) {
            const originX = e.clientX - pos.nowX;
            const originY = e.clientY - pos.nowY;
            setTransformOrigin({ x: originX, y: originY });
            aiChatStore.init();
        }
        setIsShow(!isShow);
    }

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const getHistory = (chatDatas: chatData[]) => {
        setChatDatas(chatDatas);
    };

    return <>
        <FloatButton
            type="primary"
            style={{ right: 24, top: 24 }}
            icon={isShow ? <CloseOutlined style={{ color: 'black' }} /> : <Icon type='icon-deepseek'></Icon>}
            onClick={toggleShow}
        />
        <div
            className={` ${isShow ? styles.show : ''} aiChatWrapper`}
            style={{
                top: pos.nowY,
                left: pos.nowX,
                // 【新增】应用动态宽高
                width: size.width,
                height: size.height,
                visibility: isShow ? 'visible' : "hidden",
                '--origin-x': `${transformOrigin.x}px`,
                '--origin-y': `${transformOrigin.y}px`,
            } as React.CSSProperties}
        >
            <div className={styles.twoColumn}>
                <div className={styles.left}>
                    <Sider
                        style={{ height: "100%" }}
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        // 【核心代码】设置收起后的宽度为 0
                        collapsedWidth={0}
                        // 可选：设置 0 宽度的触发器样式，或者直接隐藏自带 trigger 使用自定义按钮
                        zeroWidthTriggerStyle={{ top: '10px' }}
                    >
                        <AiSiderMenu collapsed={collapsed} getHistory={getHistory}></AiSiderMenu>
                    </Sider>

                </div>
                <div className={styles.right}>
                    <div className={styles.title} onMouseDown={handleMouseDown} >
                        <Button type="primary" onClick={toggleCollapsed}>
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </Button>AI 助手
                    </div>
                    <div className={styles.content}>
                        <ChatLayout chatDatas={chatDatas}></ChatLayout>
                    </div>

                    <div className={styles.footer}>
                        <span
                            className={styles.resize}
                            onMouseDown={handleResizeMouseDown}
                        >
                            ⤡
                        </span>
                    </div>
                </div>
            </div>


        </div>
    </>
}