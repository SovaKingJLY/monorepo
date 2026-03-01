import { useState, useEffect, useCallback } from 'react';

// T 是返回的数据类型
type RequestResult<T> = ApiResponse<T> | T;

export function useRequest<T>(service: () => Promise<RequestResult<T>>, options = { manual: false }) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    // 使用 useCallback 保证 refresh 函数的稳定性
    const run = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await service();
            const resultData =
                res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)
                    ? (res as ApiResponse<T>).data
                    : (res as T);

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