import { theme } from "antd";

export function GlobalStyle() {
  const { token } = theme.useToken();
  const css = `
    :root {
      --color-bg-base: ${token.colorBgContainer};/*是这样的注释 这里是容器背景色*/
      --color-bg-layout:${token.colorBgLayout};/* 布局背景色，白色下是略带灰的 */
      --color-text: ${token.colorText};
      --color-primary: ${token.colorPrimary};
      --border-radius: ${token.borderRadius}px;
      --color-overlay-color:${token.colorBgSpotlight};
      --color-border:${token.colorBorderSecondary};
      --box-shadow:${token.boxShadowSecondary};
      --color-bg-elevated:${token.colorBgElevated};
      --color-text-quaternary:${token.colorTextQuaternary};
      --color-text-Tertiary:${token.colorTextTertiary};
    }
    html, body, #root {
      background-color: var(--color-bg-layout);
      color: var(--color-text);
      transition:
        background-color 0.1s linear,
        color 0.1s linear;
    }
    
  `;

  return <style>{css}</style>;
}
