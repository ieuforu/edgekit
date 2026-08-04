# EdgeKit 开发日志

## 当前进度

| Phase                     | 状态      | 说明                                           |
| ------------------------- | --------- | ---------------------------------------------- |
| Phase 0: 项目基线         | ✅ 完成   | Auth + Task CRUD + README                      |
| Phase 1: 数据库模型升级   | ✅ 完成   | 新增 workspace/project/issue 表                |
| Phase 2: Backend API 重构 | ✅ 完成   | 14 个 API 端点 + 模块化结构                    |
| Phase 3: RBAC 权限系统    | ✅ 完成   | can() 抽象 + 中间件 + 成员管理 + 前端 Can 组件 |
| Phase 4: React 架构升级   | ⏳ 待开始 | Feature-based 模块化 + shadcn/ui               |
| Phase 5: TanStack Query   | ⏳ 待开始 |                                                |
| Phase 6: 高级交互         | ⏳ 待开始 |                                                |
| Phase 7: React 性能优化   | ⏳ 待开始 |                                                |
| Phase 8: 工程化           | ⏳ 待开始 |                                                |
| Phase 9: 生产部署         | ⏳ 待开始 |                                                |

---

## Phase 0：项目基线

**日期**：2026-08-04

Auth + Task CRUD + README + Local D1 初始化。

---

## Phase 1：数据库模型升级

**日期**：2026-08-04

新增 workspaces, workspace_members, projects, issues 表，删除 tasks 表。

---

## Phase 2：Backend API 重构

**日期**：2026-08-04

模块化代码结构（modules/auth, workspace, project, issue），14 个 API 端点。

---

## Phase 3：RBAC 权限系统

**日期**：2026-08-04

**目标**：

- 实现完整 SaaS 权限模型
- 四个角色：OWNER > ADMIN > MEMBER > VIEWER
- 权限抽象层 + 后端中间件 + 前端 Can 组件

**完成内容**：

### 1. 共享权限抽象层

- `packages/shared/src/permissions.ts` — 新文件
- `RoleHierarchy`: OWNER(4) > ADMIN(3) > MEMBER(2) > VIEWER(1)
- `Permissions` 矩阵：12 个权限（workspace/member/project/issue）
- `can(role, permission)` → boolean 函数

### 2. 后端 Permission Middleware

- `apps/api/src/modules/auth/permissions.ts` — 新文件
- `requirePermission(permission)` — 中间件工厂
- `requirePermissionForMethod(method, permission)` — 按 HTTP 方法区分权限
- 自动从 URL 参数或 body 中解析 workspaceId

### 3. 成员管理端点（3 个新端点）

- `POST /workspaces/:workspaceId/members` — 邀请成员（需 member:invite）
- `DELETE /workspaces/:workspaceId/members/:userId` — 移除成员（需 member:remove）
- `PATCH /workspaces/:workspaceId/members/:userId` — 更新角色（需 member:update-role）

### 4. 路由权限更新

- workspace PATCH/DELETE → workspace:update / workspace:delete
- project CRUD → project:create / project:update / project:delete
- issue CRUD → issue:create / issue:update / issue:delete

### 5. 前端组件

- `apps/web/src/context/RoleContext.tsx` — 角色 Context Provider
- `apps/web/src/components/Can.tsx` — `<Can permission="project:create">` 条件渲染

**验收结果**：

- ✅ TypeScript 编译通过（零错误）
- ✅ can() 函数权限矩阵正确
- ✅ 中间件自动解析 workspaceId
- ✅ 成员管理端点完整（邀请/移除/改角色）
- ✅ 前端 Can 组件可用
- ✅ OWNER 角色不可被降级或移除

**技术亮点**：

- `requirePermissionForMethod` 解决了 Hono 同路径不同方法需要不同权限的问题
- 中间件在 handler 之前注册（Hono 执行顺序要求）
- Body 克隆避免重复消费请求体
- 现有 `checkWorkspaceMembership` 调用保留作为纵深防御

---

## 下一阶段预告

**Phase 4: React 架构升级**

- Feature-based 模块化结构
- shadcn/ui 组件库接入
- 前端 UI 完整重建

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。

---

## Phase 4: React 架构升级 + Workspace UI

**日期**：2026-08-04

**目标**：从 demo 项目结构升级为大型应用结构，接入 shadcn/ui，实现 Workspace 创建/选择 UI。

### 1. Feature-based 目录重构

从扁平结构迁移为按业务模块组织：

```
src/
├── features/
│   ├── auth/          # 认证（api / hooks / components）
│   ├── workspace/     # 工作区（api / hooks / context / components）
│   ├── project/       # 项目（骨架）
│   └── issue/         # Issue（骨架）
├── components/
│   ├── ui/            # shadcn/ui 组件
│   └── layout/        # 共享布局组件
└── lib/
    ├── api.ts         # Hono RPC 客户端
    └── utils.ts       # cn() 工具函数
```

### 2. shadcn/ui 接入

- 安装 shadcn/ui（base-nova 风格，lucide icons，CSS variables）
- 新增组件：Button、Input、Dialog、DropdownMenu、Avatar、Separator
- Auth 页面（LoginPage / RegisterPage）的 raw HTML input/button 替换为 shadcn 组件

### 3. 路径别名

- `tsconfig.app.json`：`@/*` → `./src/*`
- `vite.config.ts`：`resolve.alias` 映射 `@` → `src/`
- `package.json` imports：`#components/*`、`#lib/*`、`#hooks/*`

### 4. Workspace UI

#### 4.1 API 层

- `features/workspace/api.ts` — fetchWorkspaces / fetchWorkspace / createWorkspace / fetchWorkspaceMembers

#### 4.2 Hooks

- `useWorkspaces()` — 工作区列表（useState + useCallback）
- `useCurrentWorkspace()` — 当前选中工作区
- `useCreateWorkspace()` — 创建工作区

#### 4.3 组件

- **CreateWorkspaceDialog** — shadcn Dialog，输入名称自动生成 slug，409 冲突提示
- **WorkspaceLayout** — 完整页面布局（侧边栏 + 顶部栏 + 内容区）
- **WorkspaceSidebar** — 240px 左侧导航栏（Projects / Members）
- **WorkspaceSelector** — 顶部下拉切换工作区，显示角色

#### 4.4 App.tsx 流程更新

```
登录 → 加载工作区列表
  ├─ 无工作区 → "Create your first workspace" 页面
  └─ 有工作区 → WorkspaceLayout + IssuePage
```

### 5. D1 Schema 修复

- `schema.sql` 缺少 workspace 相关表（仅 users / sessions / tasks）
- 合并 `drizzle/0001_add_workspaces_projects_issues.sql` 到 schema.sql
- 最终 7 张表：users, sessions, tasks, workspaces, workspace_members, projects, issues
- 重新 apply 到本地 D1

### 6. base-ui 组件修复

- Dialog import 路径：`@base-ui-components/react/dialog` → `@base-ui/react/dialog`
- base-ui 命名差异：Overlay → Backdrop, Content → Popup
- DropdownMenuLabel 需要 DropdownMenuGroup 包裹
- WorkspaceSelector default/named export 修复

**验收结果**：

- ✅ TypeScript 编译通过（零错误）
- ✅ Vite build 成功
- ✅ 登录后显示工作区创建页面
- ✅ 创建工作区 Dialog 正常（slug 自动生成、409 错误提示）
- ✅ 创建后自动选中新工作区
- ✅ Workspace 布局（侧边栏 + 顶部栏 + 内容区）
- ✅ Workspace 下拉切换器正常
- ✅ 所有 API 请求 200
- ✅ 旧文件清理完毕（pages/、context/、散落的 components）

**技术亮点**：

- Feature-based 架构让每个业务模块自包含（api / hooks / types / components）
- shadcn/ui 的 Dialog 基于 Base UI，需要 `data-open` / `data-closed` 属性驱动动画
- Workspace 选择状态暂存 React state，Phase 5 将迁移到 URL State（TanStack Router）
- Schema 合并时保留了 legacy tasks 表，避免破坏现有数据

---

## 下一阶段预告

**Phase 5: TanStack Query 接入**

- Server State 统一管理
- 自动 cache / refetch / loading / error handling
- 替换当前手动 useState + fetch 模式

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。
