import { http } from '@/api/http/api';

// 假设你有一个 types 文件定义了 Text 接口，如果没有，请确保 Text 不会和 DOM 的 Text 类型冲突
// import type { Text } from '@/types/article'; 

// 1. 获取所有文章
export const getAllText = async (): Promise<Text[]> => {
    return await http.post('/article/getAllText/');
};

// 2. 设置置顶 (使用 JSON body 传 id)
export const setPinTextHttp = async (id: number): Promise<Text[]> => {
    console.log(id);
    return await http.post('/article/setQuickAccess/', { id });
}

// 3. 取消置顶
export const setUnPinTextHttp = async (id: number): Promise<Text[]> => {
    return await http.post('/article/removeQuickAccess/', { id });
}

// 4. 获取所有置顶文章
export const getAllPinText = async (): Promise<Text[]> => {
    return await http.post('/article/getQuickAccess/');
}

// 5. 获取单篇文章详情
export const getText = async (id: number): Promise<Text> => {
    return await http.post('/articleGet/getArticle/', { id });
}

// 6. 搜索文章
export const searchTextByKeyword = async (keyword: string): Promise<Text[]> => {
    // 这里将 keyword, page, sizes 打包成一个 JSON 对象发送
    return await http.post('/articleGet/searchArticle/', {
        keyword,
        page: 1,
        sizes: 10
    });
}