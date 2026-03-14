# Monorepo Development Mandates

## Core Principles
- **Monorepo Architecture**: Adhere to the `app/*` (applications) and `packages/*` (shared libraries) structure. 
- **Workspace Packages**: Use `@repo/*` scope for internal packages. Always check if a utility or component exists in `packages/` before creating a new one.
- **Tech Stack**: 
  - Framework: React 19 (Functional Components with Hooks)
  - State: Zustand (Prefer small, focused stores)
  - Styles: Ant Design 5 (Theme-based) + Less (for specific layouts) + CSS-in-JS (@ant-design/cssinjs)
  - Data Fetching: TanStack Query (React Query) v5
  - Router: React Router v7

## Package Management
- **pnpm**: Use `pnpm` for all dependency operations. Never use `npm` or `yarn`.
- **Inter-package Deps**: Use `"@repo/package-name": "workspace:*"` for internal dependencies.

## Coding Standards
- **TypeScript**: Strict mode is mandatory. Use interfaces for props/data definitions. Avoid `any`.
- **Documentation & Comments**: Provide meaningful comments. Use JSDoc/TSDoc for all exported components, hooks, interfaces, and complex logic. Explain the "why" behind the code, not just the "what".
- **Components**: Use `sovaui` for shared UI. Export components from `index.ts` in each package.
- **Hooks**: Store reusable logic in `packages/@my-project-hooks`.
- **Styling**: Prefer AntD's `token` for colors. Use `classnames` for conditional classes.
- **AntD Customization**: Always refer to `packages/antd_config/themeConfig.ts` for theme constants.

## AI Instructions
1. **Analyze First**: Before coding, scan `pnpm-workspace.yaml` and the relevant `package.json`.
2. **Reuse over Recreate**: Prioritize using hooks from `@my-project-hooks` and components from `@repo/sovaui`.
3. **Micro-frontends**: Note that `vite-plugin-qiankun` is used; ensure components are lifecycle-aware if necessary.
4. **Validation**: After changes, verify with `pnpm lint` or `tsc -b` in the respective application directory.
