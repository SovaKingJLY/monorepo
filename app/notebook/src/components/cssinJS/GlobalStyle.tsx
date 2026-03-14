import { theme } from "antd";

/**
 * 全局样式注入组件（notebook 本地版本）
 * 将 AntD 的 CSS-in-JS token 值转化为 CSS 自定义属性
 */
export function GlobalStyle() {
  const { token } = theme.useToken();

  const css = `
    :root {
      /* 基础颜色 */
      --color-bg-base: ${token.colorBgContainer};
      --color-bg-layout: ${token.colorBgLayout};
      --color-text: ${token.colorText};
      --color-primary: ${token.colorPrimary};
      --color-overlay-color: ${token.colorBgSpotlight};
      --color-border: ${token.colorBorderSecondary};
      --color-bg-elevated: ${token.colorBgElevated};
      --color-text-quaternary: ${token.colorTextQuaternary};
      --color-text-Tertiary: ${token.colorTextTertiary};

      /* 圆角 */
      --border-radius: ${token.borderRadius}px;
      --border-radius-lg: ${token.borderRadiusLG}px;
      --border-radius-sm: ${token.borderRadiusSM}px;

      /* 过渡动画 */
      --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      /* 卡片阴影 */
      --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
      --shadow-card-hover: 0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);

      /* 原有阴影保留 */
      --box-shadow: ${token.boxShadowSecondary};
    }
    html, body, #root {
      background-color: var(--color-bg-layout);
      color: var(--color-text);
      transition:
        background-color 0.25s ease,
        color 0.25s ease;
    }
  `;

  return <style>{css}</style>;
}
