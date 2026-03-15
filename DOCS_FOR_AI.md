# AI Coding Entry Point (READ ME FIRST)

Welcome, AI Developer. Before you write any code in this monorepo, you MUST read and understand the following documents:

1. **`GEMINI.md`**: Core architecture mandates and tech stack priorities.
2. **`.cursorrules`**: Coding style guidelines, file naming conventions, and UI component usage.
3. **`pnpm-workspace.yaml`**: To understand the project structure and shared packages.
4. **`app/aiChat/package.json`**: For the specific dependencies of the main application.

## Key Monorepo Architecture
- **Shared UI**: `packages/sovaui` - Always check here before building a new UI component.
- **Shared Hooks**: `packages/@my-project-hooks/hooks` - Always check here before writing a custom hook.
- **Shared Config**: `packages/antd_config` - Centralized Ant Design theme.
- **Shared TS**: `packages/tsconfig` - Common TypeScript base.

## Workflow Mandates
1. **Context Check**: Identify whether you are working in an `app/` or a `package/`.
2. **Import Strategy**: Use `@repo/*` for internal packages. Never use relative paths to traverse between top-level packages.
3. **Documentation Requirement**: All new code MUST include meaningful JSDoc/TSDoc and inline comments for complex logic.
4. **Validation**: Ensure type safety by running `tsc` or `lint` in the specific workspace directory after changes.

**Do not proceed until you have scanned these files.**

---

## 🤖 AI 自动记录准则 (Auto-Logging Protocol)

> **这是强制性规范。每次 AI 完成任何编码任务后，必须无条件执行，无需等待用户提醒。**

### 触发条件

以下任意一种情况发生后，必须立即生成变更日志：

- ✅ 完成新功能开发（Feature）
- ✅ 完成代码重构（Refactor）
- ✅ 完成 Bug 修复（Fix）
- ✅ 完成配置或文档修改

### 日志文件规范

**存储位置**：项目根目录下的 `ai_history/` 文件夹

**命名格式**：`YYYY-MM-DD_任务简述.md`（例如：`2026-03-15_实现登录功能.md`）

**必须包含的内容结构**：

```markdown
# AI 变更记录：[任务名称]

- **日期**：YYYY-MM-DD
- **任务编号**：AI-XXX（按序递增）
- **执行者**：AI Assistant

## 📋 任务概述
简要说明本次修改的目标与背景。

## 📁 修改清单
以表格形式列出所有被新增 🆕 / 修改 ✏️ / 删除 🗑 的文件路径及说明。

## 🔍 核心变动描述
详细说明本次修改在逻辑层面的重大调整，解释「为什么这样做」。

## 🔗 版本控制指令
提供可直接执行的 git 命令：
- git add [相关文件]
- git commit -m "type(scope): [AI-XXX] 描述"
- git push origin [分支名]
```

### 展示义务

完成日志创建后，AI 必须在回复中向用户**明确展示**对应的 Git 提交指令，方便一键执行。
