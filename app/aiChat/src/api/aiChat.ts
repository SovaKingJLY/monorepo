// 定义回调数据的接口
export interface StreamUpdate {
    content: string;   // 最终回答的片段
    reasoning: string; // 思考过程的片段
}

/**
 * 核心流式请求函数
 * @param {Array} messages - 聊天上下文
 * @param {Function} onToken - 回调函数 (update: StreamUpdate) => void
 * @param {Function} onDone - 完成回调
 * @param {Function} onError - 错误回调
 */
// const getStreamData = async (
//     messages: any[],
//     onToken: (update: StreamUpdate) => void,
//     onDone: () => void,
//     onError: (error: Error) => void
// ) => {
//     // ⚠️ 安全警告：实际生产环境中，API Key 必须存储在后端，通过后端转发请求！
//     // 前端直接暴露 Key 极易导致额度被盗用。
//     const API_KEY = "sk-wstsseszxmaatoaufgueuaevvlaqwopaxsliruurquuiflap";
//     const URL = "https://api.siliconflow.cn/v1/chat/completions";
//     // DeepSeek R1 模型名称
//     const LLMType = 'deepseek-ai/DeepSeek-V3.2';
//     try {
//         const res = await fetch(URL, {
//             method: "post",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${API_KEY}`
//             },
//             body: JSON.stringify({
//                 model: LLMType,
//                 messages: messages,
//                 stream: true,
//                 temperature: 0.6 // 回复的随机性
//             })
//         });   
//         console.log(res);
//         if (!res.ok) {
//             const errorText = await res.text();
//             throw new Error(`HTTP Error ${res.status}: ${errorText}`);
//         }

//         if (!res.body) {
//             throw new Error("Response body is empty");
//         }

//         const reader = res.body.getReader();
//         const decoder = new TextDecoder("utf-8");
//         let buffer = "";

//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;

//             const chunk = decoder.decode(value, { stream: true });
//             buffer += chunk;

//             const lines = buffer.split("\n");
//             // 保留最后一行可能是残缺的数据
//             buffer = lines.pop() || '';

//             for (const line of lines) {
//                 const trimmedLine = line.trim();
//                 if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

//                 const jsonStr = trimmedLine.replace("data: ", "");

//                 if (jsonStr === "[DONE]") {
//                     if (onDone) onDone();
//                     return;
//                 }

//                 try {
//                     const data = JSON.parse(jsonStr);
//                     const delta = data.choices[0]?.delta;

//                     if (delta) {
//                         // 1. 获取普通内容
//                         const contentVal = delta.content || "";
//                         // 2. 获取推理内容 (DeepSeek R1 核心部分)
//                         const reasoningVal = delta.reasoning_content || "";

//                         // 只有当有内容或有推理时才回调
//                         if (contentVal || reasoningVal) {
//                             onToken({
//                                 content: contentVal,
//                                 reasoning: reasoningVal
//                             });
//                         }
//                     }
//                 } catch (e) {
//                     console.warn("JSON解析跳过:", e);
//                 }
//             }
//         }
//     } catch (error) {
//         if (onError) onError(error as Error);
//     }
// }

// export default getStreamData;


// 前端 getStreamData.ts

// const getStreamData = async (
//     messages: any[],
//     onToken: (update: StreamUpdate) => void,
//     onDone: () => void,
//     onError: (error: string) => void,
//     signal?: AbortSignal
// ) => {
//     // 指向你自己的 Spring Boot 后端
//     // 假设后端运行在 localhost:8080
//     const URL = `${import.meta.env.VITE_BASE_URL}/api/chat/stream`;
//     const accessTokentoken = useUserStore.getState().accessToken;
//     try {
//         const res = await fetch(URL, {
//             method: "post",
//             headers: {
//                 "Content-Type": "application/json",
//                 // 这里如果你的后端有JWT鉴权，可以在这里加 token
//                 "Authorization": `Bearer ${accessTokentoken}`
//             },
//             body: JSON.stringify({
//                 messages: messages // 直接发给后端
//             }),
//             signal
//         });
//         if (!res.ok) {
//             throw new Error(`HTTP Error ${res.status}`);
//         }

//         if (!res.body) throw new Error("Response body is empty");
//         console.log("这里");
//         const reader = res.body.getReader();
//         const decoder = new TextDecoder("utf-8");
//         let buffer = "";

//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;
//             const chunk = decoder.decode(value, { stream: true });
//             buffer += chunk;
//             // Spring WebFlux SSE 默认格式也是 "data: {...}\n\n"
//             const lines = buffer.split("\n");
//             buffer = lines.pop() || '';

//             for (const line of lines) {
//                 const trimmedLine = line.trim();
//                 if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

//                 const jsonStr = trimmedLine.replace("data:", "").trim();
//                 if (!jsonStr) continue;

//                 try {
//                     // 后端返回的是 StreamUpdateDTO，直接解析即可
//                     const data = JSON.parse(jsonStr);

//                     // 注意：这里的 data 结构已经是 { content: "...", reasoning: "..." }
//                     // 不需要再像之前那样去 choices[0].delta 里找了
//                     if (data.content || data.reasoning) {
//                         onToken({
//                             content: data.content || "",
//                             reasoning: data.reasoning || ""
//                         });
//                     }
//                 } catch (e) {
//                     console.warn("JSON解析跳过:", e);
//                 }
//             }
//         }

//         // 循环结束即完成
//         if (onDone) onDone();

//     } catch (error: any) {
//         if (error.name === 'AbortError') {
//             if (onDone) onDone();
//             return;
//         }
//         console.log(error);
//         if (onError) onError("错误");
//     }
// }

// export default getStreamData;

/**
 * 定义流式更新的数据结构
 */
export interface StreamUpdate {
    content: string;
    reasoning: string;
}

/**
 * 带缓冲区的流式数据获取函数
 * 每隔 50ms 批量输出一次，减轻前端渲染压力
 */
const getStreamData = async (
    messages: any[],
    onToken: (update: StreamUpdate) => void,
    onDone: () => void,
    onError: (error: string) => void,
    signal?: AbortSignal
) => {
    const URL = `${import.meta.env.VITE_BASE_URL}/api/chat/stream`;
    const accessToken = (window as any).useUserStore?.getState()?.accessToken || "";

    // --- 缓冲区状态 ---
    let pendingContent = "";
    let pendingReasoning = "";

    // 定时器：每 50ms 检查并推送一次数据
    const flushInterval = 50;
    const intervalId = setInterval(() => {
        if (pendingContent || pendingReasoning) {
            onToken({
                content: pendingContent,
                reasoning: pendingReasoning
            });
            // 推送后清空缓冲区
            pendingContent = "";
            pendingReasoning = "";
        }
    }, flushInterval);

    // 清理函数的封装，确保定时器被销毁
    const cleanup = () => {
        clearInterval(intervalId);
    };

    try {
        const res = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "satoken": accessToken
            },
            body: JSON.stringify({ messages }),
            signal
        });

        if (!res.ok) {
            throw new Error(`HTTP 错误 ${res.status}`);
        }

        if (!res.body) throw new Error("响应体为空");

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let rawBuffer = ""; // 用于处理不完整的 JSON 行

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 解码当前分块并累加到原始文本缓冲区
            rawBuffer += decoder.decode(value, { stream: true });

            // 按行分割 SSE 数据
            const lines = rawBuffer.split("\n");
            // 最后一行可能不完整，保留到下次处理
            rawBuffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

                const jsonStr = trimmedLine.replace("data:", "").trim();
                if (jsonStr === "[DONE]") break;

                try {
                    const data = JSON.parse(jsonStr);
                    // 将新内容追加到待发送缓冲区，而不是立即触发回调
                    if (data.content) pendingContent += data.content;
                    if (data.reasoning) pendingReasoning += data.reasoning;
                } catch (e) {
                    console.warn("解析 SSE JSON 失败:", e);
                }
            }
        }

        // --- 正常结束逻辑 ---
        cleanup();

        // 最后一波“冲刷”：确保缓冲区中残留的最后一点数据被发出
        if (pendingContent || pendingReasoning) {
            onToken({
                content: pendingContent,
                reasoning: pendingReasoning
            });
        }

        if (onDone) onDone();

    } catch (error: any) {
        cleanup();
        if (error.name === 'AbortError') {
            // 如果是用户主动取消，执行完成回调
            if (onDone) onDone();
            return;
        }
        console.error("流传输错误:", error);
        if (onError) onError(error.message || "请求失败");
    }
};

export default getStreamData;