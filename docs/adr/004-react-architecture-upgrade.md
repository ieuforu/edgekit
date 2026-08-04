# ADR-004: React 架构升级

**日期**：2026-08-04

**状态**：已采纳

## 背景

Phase 0-3 完成了后端架构（D1 数据库、Hono API、RBAC 权限系统），但前端仍是 demo 级别的扁平结构：

- `pages/` 包含所有页面，耦合严重
- `components/` 混放 UI 组件和业务组件
- `context/` 状态边界不清晰
- 手工 HTML 表单，无统一组件库

随着 Workspace / Project / Issue 业务增加，这种结构会快速退化。

## 决策

### 1. Feature-based 目录结构

按业务模块组织前端代码，每个 feature 自包含：

```
features/<module>/
├── api.ts          # API 调用函数
├── hooks.ts        # React hooks
├── types.ts        # 类型定义
└── components/     # 模块专属组件
```

**理由**：

- 模块边界清晰，修改一个 feature 不会意外影响其他模块
- 新人可以快速定位代码（"workspace 相关的代码在哪？"→ `features/workspace/`）
- 便于后续按 feature 做代码分割（code splitting）

### 2. shadcn/ui 作为组件库

选择 shadcn/ui 而非 Headless UI / Radix 直接使用 / Base UI + 全自定义。

**理由**：

- 项目管理工具需要大量复杂 UI 组件（Dialog、DropdownMenu、DataTable 等），全自定义成本过高
- shadcn 代码拷入项目，完全 owned，无黑盒依赖
- 基于 Base UI primitives，无障碍支持完善
- Tailwind CSS 变量系统与项目设计系统兼容

### 3. 状态分层架构

| 层级         | 负责                                    | 方案            | Phase   |
| ------------ | --------------------------------------- | --------------- | ------- |
| Server State | 工作区/项目/Issue 数据                  | TanStack Query  | Phase 5 |
| Client State | UI 状态（sidebar、modal、theme）        | Zustand / Jotai | Phase 6 |
| URL State    | 可分享的页面状态（filters、pagination） | TanStack Router | Phase 5 |

**理由**：

- 防止 UI 状态和服务器数据混淆
- URL State 让筛选条件可分享、可恢复
- Server State 自动管理 cache / refetch / optimistic update

### 4. 中央 Hono RPC 客户端

保留 `lib/api.ts` 作为单一 RPC 类型定义入口，各 feature 的 `api.ts` 通过 `fetch()` 调用。

**理由**：

- Hono RPC 的类型推断需要完整的路由定义，集中维护更可靠
- 各 feature 的 api.ts 只是 fetch wrapper，关注业务逻辑而非传输层
- Phase 5 接入 TanStack Query 后，mutation/query 结构会进一步统一

## 后果

**正面**：

- 前端代码结构可扩展到 20+ feature 模块
- shadcn 组件库覆盖 90% 常见 UI 需求
- 状态分层为后续 TanStack Query / Router 接入铺平道路

**负面**：

- shadcn 组件需要手动维护升级（但代码 owned，风险可控）
- Feature 模块间共享组件需要约定（目前放在 `components/layout/` 或 `components/ui/`）
- 初始文件数量增加，但每个文件职责更单一
