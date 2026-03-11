import { useState, useEffect, useCallback } from 'react';

export function useRequest<T>(service: () => Promise<T>, options = { manual: false }) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    // 使用 useCallback 保证 refresh 函数的稳定性
    const run = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resultData = await service();

            setData(resultData);
            return resultData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    // 如果不是手动触发，则组件挂载时自动执行
    useEffect(() => {
        if (!options.manual) {
            run();
        }
    }, [run, options.manual]);

    return { data, isLoading, error, refresh: run };
}