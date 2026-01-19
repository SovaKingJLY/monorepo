import { Badge, Menu, Tooltip, type MenuProps } from "antd";
import styles from './AiSiderMenu.module.less'
import { getSessionHistory, getUserSessionList } from "../../../../api/http/api";
import { useAiChatStore } from "../../../../store/aiChatStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react"; // 引入 useMemo

type MenuItem = Required<MenuProps>['items'][number];

interface AiSiderMenuProp {
    collapsed: boolean,
    getHistory: (chatDatas: chatData[]) => void
}

export default function AiSiderMenu(prop: AiSiderMenuProp) {
    const AiChatStore = useAiChatStore();

    // 1. useQuery 只负责拿原始数据，不负责生成 UI
    // 这里的 select 仅用于简单的数据清洗/排序，不依赖 Store
    const { data: rawSessionList } = useQuery({
        queryKey: ['sessionList'],
        queryFn: () => getUserSessionList(),
        select: (data) => {
            return data.map((i) => ({
                sessionId: i.sessionId,
                title: i.title,
                updatedAt: i.updatedAt.slice(0, 10),
            })).sort((a: any, b: any) => b.updatedAt.localeCompare(a.updatedAt));
        }
    });

    // 2. 使用 useMemo 动态生成菜单项
    // 这里是关键：将 "API数据" + "Store状态" 结合
    const menuItems = useMemo(() => {
        // 如果没有数据，返回默认结构
        if (!rawSessionList) {
            return [{
                key: 'grp',
                type: 'group' as const,
                children: [{ key: '1', label: '新对话' }],
            }];
        }

        const map = new Map<string, MenuItem[]>();

        // 遍历处理数据
        rawSessionList.forEach((item: any) => {
            const currentList = map.get(item.updatedAt) || [];

            // --- 动态逻辑在这里 ---
            // 因为在 useMemo 中，只要依赖项变了，这里就会重新计算
            const isProcessing = AiChatStore.processingList.includes(item.sessionId);
            const isSuccess = AiChatStore.successList.includes(item.sessionId);

            const newItem = {
                key: item.sessionId,
                label: (() => {
                    // 逻辑保持不变
                    let statusValue = undefined;
                    if (isProcessing) statusValue = 'processing' as const;
                    if (isSuccess) statusValue = 'success' as const;
                    let isShow = statusValue ? true : false;
                    return (
                        <Badge status={statusValue} dot={isShow} offset={[10, 10]} >
                            <Tooltip placement="left" title={item.title} zIndex={9999999}>
                                {item.title}
                            </Tooltip>
                        </Badge>
                    );
                })(),
            };

            map.set(item.updatedAt, [...currentList, newItem]);
        });

        // 组装分组
        const groupResult: MenuItem[] = [];
        map.forEach((items, dateKey) => {
            groupResult.push({
                key: dateKey,
                type: 'group' as const,
                label: dateKey,
                children: items
            });
        });

        // 返回最终结构
        return [
            {
                key: 'grp',
                type: 'group' as const,
                children: [
                    { key: '1', label: '新对话' },
                ],
            },
            {
                key: 'history-submenu', // 唯一的 key
                label: '历史对话',      // 你的标题

                children: groupResult   // 2. 将之前的日期分组全部放入这个 children 中
            }
            // ...groupResult
        ];

        // 3. 依赖数组：任何一个变了，菜单都会重新计算
    }, [rawSessionList, AiChatStore.processingList.length, AiChatStore.successList.length]);

    const cilckSession: MenuProps['onClick'] = async ({ key }) => {
        try {
            if (key == '1') {
                AiChatStore.init();
                prop.getHistory([]);
            }
            else {
                const res = await getSessionHistory(key);
                AiChatStore.setSessionId(key);
                prop.getHistory(res);
            }
        } catch { }
    }

    return (
        <Menu
            style={{ height: "100%", overflow: "hidden", overflowY: "auto", userSelect: 'none' }}
            className={styles.aiSiderMenu}
            inlineIndent={20}
            selectedKeys={[AiChatStore.sessionId]}
            mode="inline"
            items={menuItems} // 使用计算出来的 items
            inlineCollapsed={prop.collapsed}
            onClick={cilckSession}
        />
    )
}