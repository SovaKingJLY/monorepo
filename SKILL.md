# Monorepo Development Skill

This skill is designed to guide AI agents through complex development tasks in a React 19 Monorepo. 

## Skill: Monorepo Architect & Developer

### 1. Context Recognition Skill
- **Objective**: Identify which app or package you are modifying and its role in the workspace.
- **Action**: Check the current directory and the closest `package.json` to understand the local tech stack and dependencies.

### 2. Dependency Management Skill
- **Objective**: Maintain workspace integrity during dependency updates or additions.
- **Action**:
  - Check `pnpm-workspace.yaml` for shared dependencies.
  - Use `pnpm add -w` for workspace-level packages.
  - Use `pnpm add` within a package directory for local dependencies.
  - Always use `workspace:*` for inter-package links.

### 3. Component Extraction & Reuse Skill
- **Objective**: Minimize code duplication across apps.
- **Action**:
  - When writing a UI component in `app/*/src/components`, evaluate if it should be moved to `packages/sovaui`.
  - When writing a hook in `app/*/src/hooks`, evaluate if it should be moved to `packages/@my-project-hooks`.

### 4. Cross-Package Refactoring Skill
- **Objective**: Safely refactor code that spans multiple packages.
- **Action**:
  - Always run `tsc -b` at the root or in affected packages to catch breaking changes in downstream dependencies.
  - Use `grep_search` to find all usages of a symbol across the entire `app/` and `packages/` directories.

### 5. AI Reasoning Protocol
- **Research**: Scan `DOCS_FOR_AI.md` and related package configs.
- **Strategy**: Propose a plan that respects Monorepo boundaries.
- **Execution**: Apply changes surgically.
- **Validation**: Verify each affected package independently.

---
**Use this skill when you are asked to add a new feature, refactor existing code, or fix bugs that involve multiple parts of the monorepo.**
