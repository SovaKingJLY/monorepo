import { Menu, Tooltip, type MenuProps } from "antd";
import styles from './AiSiderMenu.module.less'
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
// 引入图标以解决收起时不显示的问题
import { PlusOutlined, HistoryOutlined, MessageOutlined } from "@ant-design/icons";
import { getSessionHistory, getUserSessionList } from "@/api/session";
import { useNavigate } from "react-router";
import useAiChatStore from "@/store/aiChat";

type MenuItem = Required<MenuProps>['items'][number];

interface AiSiderMenuProp {
    collapsed: boolean;
}

export default function AiSiderMenu({ collapsed }: AiSiderMenuProp) {
    const [selectedKey, setSelectedKey] = useState<string>('1');
    const [openKeys, setOpenKeys] = useState<string[]>(['history-submenu']);
    const nav = useNavigate();
    const aiChatStore = useAiChatStore();
    // --- 数据获取逻辑修正 ---
    const { data: sessionList } = useQuery({
        queryKey: ['sessionList'],
        queryFn: () => getUserSessionList(),
        select: (res: any) => {
            console.log("原始接口返回:", res);

            // 【关键修复点 1】
            // 您的数据在 res.data 里面，而不是 res 本身
            // 必须先取出数组，并做一个空数组兜底，防止报错
            const list = res?.data || [];

            // 【关键修复点 2】
            // 现在 list 才是那个 Array(112)，可以调用 map 了
            return list.map((i: any) => ({
                sessionId: i.sessionId,
                title: i.title, // 例如: "鸡公煲经过我的胃"
                updatedAt: i.updatedAt?.slice(0, 10) || "未知日期", // 防止日期为空报错
            })).sort((a: any, b: any) => b.updatedAt.localeCompare(a.updatedAt));
        }
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

            const newItem = {
                key: item.sessionId,
                icon: <MessageOutlined />, // 加上图标，收起时才好看
                label: (
                    <Tooltip placement="left" title={item.title} zIndex={999}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                        </span>
                    </Tooltip>
                ),
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

    // 监听 collapsed 变化，收起时清空展开项
    useEffect(() => {
        if (collapsed) {
            setOpenKeys([]);
        } else {
            setOpenKeys(['history-submenu']);
        }
    }, [collapsed]);

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

    const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
        setOpenKeys(keys);
    };

    return (
        <Menu
            style={{ height: "100%", overflowY: "auto", borderRight: 0 }}
            className={styles.aiSiderMenu}
            mode="inline"
            inlineIndent={16}
            inlineCollapsed={collapsed}
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={menuItems}
            onClick={handleClick}
        />
    )
}