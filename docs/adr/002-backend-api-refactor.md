# ADR-002: Backend API 重构

**日期**：2026-08-04

**状态**：已批准

## 背景

Phase 1 完成了数据库模型升级，但后端只有 auth API。需要为新增的 workspace/project/issue 表添加完整的 CRUD API，并按业务模块组织代码。

## 决策

### 1. 代码结构

采用模块化目录结构，每个业务模块独立目录：

```
modules/
├── auth/
├── workspace/
├── project/
└── issue/
```

**替代方案**：
- A: 保持 endpoints/ 扁平结构 — 简单但难以维护
- B: 按功能分（routes/handlers/models）— 过度抽象
- C: 按业务模块分（采用）— 清晰的职责边界

### 2. 权限检查方式

在业务逻辑中检查 workspace 成员身份，而非路径中间件。

**原因**：
- Workspace ID 在 project/issue 操作中来自 body/query/project 查找
- 不同端点的权限要求不同（读 vs 写）
- 需要链式查找（issue → project → workspace）

**实现**：
- `requireWorkspaceRole()` — 用于 URL 路径包含 workspaceId 的路由
- `checkWorkspaceMembership()` — 用于需要动态查找 workspace 的场景

### 3. 分页实现

Issue 列表使用内存分页。

**原因**：
- D1 (SQLite) 对复杂 JOIN 查询的 LIMIT/OFFSET 支持有限
- 数据量预期不会太大（单个 workspace 的 issue 数量）
- 实现简单，性能可接受

**替代方案**：
- 游标分页 — 实现复杂，当前需求不需要

## 影响

- 新增 14 个 API 端点
- 删除旧 endpoints/ 目录
- 权限检查逻辑集中管理
- 前端需要适配新 API（Phase 4）

## 后续步骤

1. Phase 3: 完整 RBAC 权限系统
2. Phase 4: 前端 UI 重建
