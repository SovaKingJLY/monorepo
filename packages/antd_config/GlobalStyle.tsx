import { theme } from "antd";

export function GlobalStyle() {
  const { token } = theme.useToken();
  //定义全局css变量
  //这里的${token.colorBgContainer}是CSS-in-JS 的写法（直接写在 .tsx 文件里），而不能直接写在 .css 或 .less 文件里。
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
    .fontColor {
    color: var(--color-text);
    }

    .containerBgColor {
        background-color: var(--color-bg-base);
        color: var(--color-text);
    }

    .containerShadow {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
  `;

  return <style>{css}</style>;
}
