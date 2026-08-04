# EdgeKit 开发日志

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 0: 项目基线 | ✅ 完成 | Auth + Task CRUD + README |
| Phase 1: 数据库模型升级 | ✅ 完成 | 新增 workspace/project/issue 表 |
| Phase 2: Backend API 重构 | ✅ 完成 | 14 个 API 端点 + 模块化结构 |
| Phase 3: RBAC 权限系统 | ✅ 完成 | can() 抽象 + 中间件 + 成员管理 + 前端 Can 组件 |
| Phase 4: React 架构升级 | ⏳ 待开始 | Feature-based 模块化 + shadcn/ui |
| Phase 5: TanStack Query | ⏳ 待开始 | |
| Phase 6: 高级交互 | ⏳ 待开始 | |
| Phase 7: React 性能优化 | ⏳ 待开始 | |
| Phase 8: 工程化 | ⏳ 待开始 | |
| Phase 9: 生产部署 | ⏳ 待开始 | |

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
