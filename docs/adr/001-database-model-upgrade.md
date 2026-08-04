# ADR-001: 数据库模型升级

**日期**：2026-08-04

**状态**：已批准

## 背景

当前项目是一个简单的任务管理应用，只有 users、sessions、tasks 三张表。为了演进为 Linear Mini 风格的多租户 SaaS 项目管理系统，需要升级数据模型。

## 决策

采用层级化数据模型：

```
User → Workspace → Project → Issue
```

### 新增表

1. **workspaces** - 工作空间
   - 支持多租户，一个用户可以创建多个 workspace
   - 字段：id, name, slug, owner_id, created_at, updated_at

2. **workspace_members** - 工作空间成员
   - 支持 RBAC 权限系统
   - 字段：id, workspace_id, user_id, role, created_at
   - 角色：OWNER, ADMIN, MEMBER, VIEWER

3. **projects** - 项目
   - 项目属于 workspace
   - 字段：id, workspace_id, name, description, status, created_at, updated_at
   - 状态：ACTIVE, ARCHIVED

4. **issues** - 工单（替代 tasks）
   - Issue 属于 project
   - 字段：id, project_id, title, description, status, priority, assignee_id, creator_id, created_at, updated_at
   - 状态：BACKLOG, TODO, IN_PROGRESS, DONE, CANCELLED
   - 优先级：NO_PRIORITY, LOW, MEDIUM, HIGH, URGENT

### 删除表

- **tasks** - 由 issues 表替代

## 替代方案

### 方案 A：保持 tasks 表，添加关联字段
- 优点：改动最小
- 缺点：无法支持 workspace/project 层级，不利于后续扩展

### 方案 B：使用 JSON 字段存储层级关系
- 优点：灵活
- 缺点：查询复杂，无法利用关系型数据库优势

### 方案 C：层级化关系表（采用）
- 优点：清晰的层级关系，支持复杂查询，利于后续 RBAC 实现
- 缺点：迁移工作量较大

## 影响

- 需要修改 Drizzle schema
- 需要生成新的 migration
- 需要更新共享类型定义
- 需要重构后端 API（Phase 2）
- 需要更新前端组件（Phase 4）

## 后续步骤

1. 修改 `apps/api/src/db/schema.ts` 添加新表
2. 修改 `packages/shared/src/index.ts` 添加新类型
3. 生成并应用 migration
4. 测试数据库迁移
