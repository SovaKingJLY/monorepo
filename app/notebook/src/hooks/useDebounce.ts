import { useCallback, useEffect, useRef } from "react";


//防抖，当持续触发事件时，一定时间内没有再触发事件，事件处理函数才会执行一次。 如果设定的时间内又触发了事件，就重新开始计时。
//这里的话会传的是一个uesCallback？
export default function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {

    const timerRef = useRef<number | null>(null);
    const fnRef = useRef(fn);//useRef不会触发组件重新渲染
    timerRef.current = setTimeout(() => {
        fn();
    }, delay);

    useEffect(() => {// 始终保持对最新 fn 的引用，避免闭包问题
        fnRef.current = fn;
    }, [fn]);

    const debouncedFn = useCallback((...args: Parameters<T>) => {//创建一个新的函数，把调用的参数传给他
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            fnRef.current(...args);
        }, delay);
    }, [delay]);

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        }
    }, []);
    return debouncedFn;
}