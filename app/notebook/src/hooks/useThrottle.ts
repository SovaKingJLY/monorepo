import { useCallback, useRef } from "react";


//节流，在固定时间间隔内，函数最多只执行一次。
//返回一个函数，执行这个函数后先判断上一次执行是什么时候，大于间隔就再执行一次,
//每次调用这个函数就保存下时间戳，然后每次计算下到上一次的时间戳是什么时候。

export default function useThrottle<T extends (...args: any[]) => any>(fn: T, delay: number) {
    // 1. 使用 useRef 存储上一次执行的时间戳
    // 这样即使组件重新渲染，lastTime.current 的值也不会丢失
    const lastTime = useRef(0);

    // 2. 使用 useRef 存储最新的函数引用
    //避免多余的重新渲染
    //这里就是为了返回一个稳定的callback，防止因为传入函数的不确定而导致return出去的函数地址改变，从而导致组件重新渲染，即重新渲染时传入了一个新的函数，然后执行这个节流函数发现地址变了又重新刷新，导致一次不必要的渲染
    const fnRef = useRef(fn);
    fnRef.current = fn;

    return useCallback((...args: any[]) => {
        const now = Date.now();
        // 核心逻辑：判断当前时间与上次执行时间的差值
        if (now - lastTime.current > delay) {
            // 大于间隔，执行函数
            fnRef.current(...args);
            // 更新执行时间
            lastTime.current = now;
        }
    }, [delay]);



}