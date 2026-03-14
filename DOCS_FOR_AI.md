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
