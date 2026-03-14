import { theme, type ThemeConfig } from "antd";
import useDarkStore from "../../store/darkMode";

/**
 * notebook 本地主题配置
 * 与 packages/antd_config/themeConfig.ts 保持一致的设计 token
 */
const getThemeConfig = () => {
    const isDark = useDarkStore.getState().isDark;

    let themeConfig: ThemeConfig = {
        token: {
            colorPrimary: '#2E7FF2',
            borderRadius: 10,
            fontSize: 16,
            colorBgSpotlight: "#868686ff",
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
                itemHoverColor: '#2E7FF2',
                itemActiveColor: '#2E7FF2',
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
    }
    return themeConfig;
}
export default getThemeConfig;
