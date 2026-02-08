import { Menu, Tooltip, type MenuProps } from "antd";
import styles from './AiSiderMenu.module.less'
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { PlusOutlined, HistoryOutlined, MessageOutlined } from "@ant-design/icons";
import { getUserSessionList } from "@/api/session";
import { useNavigate } from "react-router";
import useAiChatStore from "@/store/aiChat";

type MenuItem = Required<MenuProps>['items'][number];

interface AiSiderMenuProp {
    collapsed: boolean;
}


const transformSessionData = (res: any) => {
    const list = res?.data || [];
    // 强烈建议：这里限制数量，比如只取前 50 条，否则 Antd 渲染压力太大
    return list
        .map((i: any) => ({
            sessionId: i.sessionId,
            title: i.title,
            updatedAt: i.updatedAt?.slice(0, 10) || "未知日期",
        }))
        .sort((a: any, b: any) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 50); // 🚀 性能优化：只渲染最近 50 条，防止 DOM 爆炸
};

export default function AiSiderMenu({ collapsed }: AiSiderMenuProp) {
    const [selectedKey, setSelectedKey] = useState<string>('1');
    const nav = useNavigate();
    const aiChatStore = useAiChatStore();
    // --- 数据获取逻辑修正 ---

    useEffect(() => {
        console.log("折叠/展开");
    }, [collapsed])
    const { data: sessionList } = useQuery({
        queryKey: ['sessionList'],
        queryFn: () => getUserSessionList(),
        select: transformSessionData,
    });

    // --- 菜单组装逻辑 ---
    const menuItems = useMemo(() => {
        // 如果数据还没回来，或者为空
        if (!sessionList || sessionList.length === 0) {
            return [{
                key: '1',
                label: '新对话',
                icon: <PlusOutlined />
            }];
        }

        const map = new Map<string, MenuItem[]>();

        sessionList.forEach((item: any) => {
            const currentList = map.get(item.updatedAt) || [];
            const titleNode = (
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                </span>
            );
            const newItem = {
                key: item.sessionId,
                icon: <MessageOutlined />, // 加上图标，收起时才好看
                label: (
                    item.title.length >= 20 ? (
                        <Tooltip placement="left" title={item.title} zIndex={999}>
                            {titleNode}
                        </Tooltip>
                    ) : (
                        titleNode // 长度不够，直接用 span，不渲染 Tooltip 组件
                    )
                )
            };
            map.set(item.updatedAt, [...currentList, newItem]);
        });

        const historyGroups: MenuItem[] = [];
        map.forEach((items, dateKey) => {
            historyGroups.push({
                key: dateKey,
                type: 'group' as const,
                label: dateKey,
                children: items
            });
        });

        return [
            {
                key: '1',
                label: '新对话',
                icon: <PlusOutlined />
            },
            {
                key: 'history-submenu',
                label: '历史对话',
                icon: <HistoryOutlined />,
                children: historyGroups
            }
        ];
    }, [sessionList]);


    const handleClick: MenuProps['onClick'] = async ({ key }) => {
        setSelectedKey(key);
        if (key === '1') {
            nav('/chat');
            aiChatStore.resetSession();
        } else {
            nav(`/chat/${key}`);
            aiChatStore.getChatDatas(key);
        }
    }
    return (
        <Menu
            style={{ height: "100%", overflowY: "auto", borderRight: 0 }}
            className={styles.aiSiderMenu}
            mode="inline"
            inlineIndent={16}
            inlineCollapsed={collapsed}
            selectedKeys={[selectedKey]}
            defaultOpenKeys={['history-submenu']}
            items={menuItems}
            onClick={handleClick}
        />
    )
}