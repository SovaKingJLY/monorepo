
export const textKeyList = (texts: Text[]): Map<string, Text[]> => {
    //.sort是会修改原数组的
    //将数组映射成一个对象，或map
    let ans = new Map<string, Text[]>;
    texts.forEach((item) => {
        let list = ans.get(item.tag);
        if (list)
            list.push(item);
        else {
            list = [item];
            ans.set(item.tag, list);
        }
    });
    return ans;
}