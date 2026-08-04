# ADR-003: RBAC 权限系统

**日期**：2026-08-04

**状态**：已批准

## 背景

Phase 2 实现了基础的 workspace 成员检查（OWNER/ADMIN/MEMBER/VIEWER），但权限逻辑分散在各 handler 中，没有统一的抽象层。

## 决策

### 1. 权限抽象

采用 `can(role, permission)` 函数式抽象：

- 12 个细粒度权限（workspace/member/project/issue）
- 角色层级数值化（OWNER=4, ADMIN=3, MEMBER=2, VIEWER=1）
- 前后端共享同一套权限逻辑

### 2. 中间件模式

`requirePermission(permission)` 工厂函数：

- 自动从 URL 参数解析 workspaceId（支持 :workspaceId、:projectId、:issueId 链式查找）
- 支持按 HTTP 方法区分权限（`requirePermissionForMethod`）
- Body 克隆避免消费请求流

### 3. 前端权限

`<Can>` 组件 + `RoleContext`：

- 与后端共享 `can()` 函数，保证一致性
- 支持 fallback 渲染

## 权限矩阵

| 权限               | OWNER | ADMIN | MEMBER | VIEWER |
| ------------------ | ----- | ----- | ------ | ------ |
| workspace:update   | ✅    | ✅    | ❌     | ❌     |
| workspace:delete   | ✅    | ❌    | ❌     | ❌     |
| member:invite      | ✅    | ✅    | ❌     | ❌     |
| member:remove      | ✅    | ✅    | ❌     | ❌     |
| member:update-role | ✅    | ❌    | ❌     | ❌     |
| project:create     | ✅    | ✅    | ✅     | ❌     |
| project:update     | ✅    | ✅    | ✅     | ❌     |
| project:delete     | ✅    | ✅    | ✅     | ❌     |
| issue:create       | ✅    | ✅    | ✅     | ❌     |
| issue:update       | ✅    | ✅    | ✅*    | ❌     |
| issue:delete       | ✅    | ✅    | ✅     | ❌     |
| issue:assign       | ✅    | ✅    | ❌     | ❌     |

*MEMBER 只能 update 自己创建的 issue
