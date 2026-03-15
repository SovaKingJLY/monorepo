# AI 变更记录：修复AntD-Image预览布局抖动

- **日期**：2026-03-15
- **任务编号**：AI-001
- **执行者**：AI Assistant

## 📋 任务概述
在 `notebook` 项目中，使用 Ant Design 的 `Image` 组件进行大图预览时，由于引入了 CSS 属性 `scrollbar-gutter: stable`，触发了原生的滚动条占位保留效果。此时 Ant Design 的弹窗底层逻辑（`rc-util`）会强制隐藏滚动条并尝试修改 `body` 的 `width` 及 `padding-right` 以防止布局抖动。两者效果冲突导致图片预览及关闭时产生明显的向右再向左的布局抖动。
本次任务目标是提供解决方案并应用最优解，解决预览时的发生位移问题。

## 💡 解决方案说明

针对该问题，提出以下解决方案思路：

### 方案一：全局 CSS 拦截（当前采用的推荐方案）
项目已经启用 `html { scrollbar-gutter: stable; }`，浏览器本身就为我们保留了滚动条区域。我们只需用 `!important` 覆盖 Ant Design 注入的 `width: calc(100% - 15px)` 锁定样式即可。
- **优点**：一行 CSS 根治所有的类似弹窗组件（包括 `Modal`, `Drawer`, `Image` 等），逻辑简单干净。
- **做法**：在 `App.less` 中设置 `html body { width: 100% !important; padding-right: 0 !important; }`，并删除 `textShow.tsx` 里的手动操作 `scrollbarGutter` 逻辑。

### 方案二：通过 Ant Design 自带属性规避
可以设置 `Image` 的 `preview={{ getContainer: false }}` 或指向自定义包裹容器，但这只将锁定行为降维到组件级，某些依赖全局视口的交互行为仍受限且可能引发新的层级 z-index 遮挡问题。

## 📁 修改清单

| 文件路径 | 变更类型 | 说明 |
| --- | --- | --- |
| `app/notebook/src/App.less` | ✏️ 修改 | 新增 `html body` 重要级覆盖，禁止计算剔除滚动条宽度。 |
| `app/notebook/src/pages/text/textShow.tsx` | ✏️ 修改 | 移除 `Image` 的 `onVisibleChange` 动作，彻底避免 `auto` 造成的跳动冲突。 |

## 🔍 核心变动描述
1. **移除动态 Hack 代码**：由于 `onVisibleChange` 里的 `auto` 覆盖，反向破坏了 `stable` 的稳定占位特性，因此将其删除。
2. **增强 body 的样式控制**：在全局 `App.less` 中注入强制 `width: 100%`，无视 AntD 中的滚动条修正量。这样当滚动条消失时利用浏览器原生的 `scrollbar-gutter` 保留空白区，使得内容不会发作整体平移！

## 🔗 版本控制指令

- git add app/notebook/src/App.less app/notebook/src/pages/text/textShow.tsx ai_history/2026-03-15_修复AntD-Image预览布局抖动.md
- git commit -m "fix(notebook): [AI-001] 修复 Ant Design Image 弹出预览时由于 scrollbar-gutter 造成的布局位移抖动"
- git push origin HEAD
