import { theme, type ThemeConfig } from "antd";

/** 主题配置入参接口 */
interface themeConfigProp {
    isDark: boolean,
}

/**
 * 生成 AntD 主题配置
 * borderRadius 增大至 10px 以实现更现代的圆润视觉
 * 增加了组件级别的微调以保证整体一致性
 */
const getThemeConfig = (themeConfigProp: themeConfigProp) => {

    let themeConfig: ThemeConfig = {
        token: {
            colorPrimary: '#2E7FF2',
            borderRadius: 10,
            fontSize: 16,
            colorBgSpotlight: "#868686ff",
            // 微调线框和边框的圆角
            borderRadiusLG: 12,
            borderRadiusSM: 6,
        },
        components: {
            Input: {
                borderRadius: 8,
            },
            Button: {
                borderRadius: 8,
            },
            Card: {
                borderRadiusLG: 12,
            },
            Tabs: {
                // tab 切换更柔和
                itemHoverColor: '#2E7FF2',
                itemActiveColor: '#2E7FF2',
            },
            FloatButton: {
                colorPrimary: "#f5f5f5",
                "algorithm": true,
            },
        }
    };
    if (themeConfigProp.isDark) {
        themeConfig = {
            algorithm: theme.darkAlgorithm,
            ...themeConfig,
        }
    }
    return themeConfig;
}
export default getThemeConfig;


