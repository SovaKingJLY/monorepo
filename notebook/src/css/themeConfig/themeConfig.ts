import { theme, type ThemeConfig } from "antd";
import useDarkStore from "../../store/darkMode";



const getThemeConfig = () => {
    const isDark = useDarkStore.getState().isDark;

    let themeConfig: ThemeConfig = {
        // algorithm: theme.darkAlgorithm,//算法部分，通过指定某个算法，能够计算出最终的颜色
        token: {//token 负责全局公共样式
            colorPrimary: '#2E7FF2',
            borderRadius: 5,
            fontSize: 16,
            colorBgSpotlight: "#868686ff"
        },
        components: {//对某个组件单独设置
            Input: {

            },
            Button: {

            },
            FloatButton: {
                colorPrimary: "#f5f5f5",
                "algorithm": true,
            }
        }
    };
    if (isDark) {
        themeConfig = {
            algorithm: theme.darkAlgorithm,
            ...themeConfig,
        }
    } else {

    }
    return themeConfig;
}
export default getThemeConfig;


