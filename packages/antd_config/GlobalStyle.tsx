import { theme } from "antd";

/** GlobalStyle 组件入参 */
interface GlobalStyleProps {
  /** CSS 选择器作用域，默认 ":root" */
  scopeSelector?: string;
}

/**
 * 全局样式注入组件
 * 将 AntD 的 CSS-in-JS token 值转化为 CSS 自定义属性，
 * 让 Less/CSS 模块文件中也能使用主题变量
 */
export function GlobalStyle({ scopeSelector = ":root" }: GlobalStyleProps) {
  const { token } = theme.useToken();

  const css = `
    ${scopeSelector} {
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

      /* 过渡动画 — 统一使用此变量保证全站一致 */
      --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      /* 卡片阴影 — 静止态与悬浮态 */
      --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
      --shadow-card-hover: 0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);

      /* 原有阴影保留 */
      --box-shadow: ${token.boxShadowSecondary};
    }

    ${scopeSelector} {
      background-color: var(--color-bg-layout);
      color: var(--color-text);
      transition:
        background-color 0.25s ease,
        color 0.25s ease;
    }

    /* ---- 全局公用 class（供 Less mixins 引用） ---- */
    .fontColor {
      color: var(--color-text);
    }

    .containerBgColor {
      background-color: var(--color-bg-base);
      color: var(--color-text);
      border-radius: var(--border-radius-lg);
      transition: var(--transition-base);
    }

    .containerShadow {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);
    }
  `;

  return <style>{css}</style>;
}
