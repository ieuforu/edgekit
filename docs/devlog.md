# EdgeKit 开发日志

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 0: 项目基线 | ✅ 完成 | Auth + Task CRUD + README |
| Phase 1: 数据库模型升级 | ✅ 完成 | 新增 workspace/project/issue 表，删除 tasks |
| Phase 2: Backend API 重构 | ⏳ 待开始 | 给新表加 CRUD API |
| Phase 3: RBAC 权限系统 | ⏳ 待开始 | |
| Phase 4: React 架构升级 | ⏳ 待开始 | 前端 UI 重建 |
| Phase 5: TanStack Query | ⏳ 待开始 | |
| Phase 6: 高级交互 | ⏳ 待开始 | |
| Phase 7: React 性能优化 | ⏳ 待开始 | |
| Phase 8: 工程化 | ⏳ 待开始 | |
| Phase 9: 生产部署 | ⏳ 待开始 | |

---

## Phase 0：项目基线

**日期**：2026-08-04

**完成内容**：
- Auth 系统：register, login, logout, session
- Task CRUD：创建、读取、更新、删除
- README 文档完善
- Local D1 初始化流程

**验收结果**：
- ✅ 新 clone 可以运行
- ✅ 注册登录正常
- ✅ 创建任务正常

---

## Phase 1：数据库模型升级

**日期**：2026-08-04

**目标**：
- 新增 workspaces, workspace_members, projects, issues 表
- 替换 tasks 表为 issues 表
- 建立用户 → 工作空间 → 项目 → issue 层级关系

**完成内容**：

### 1. Drizzle Schema 升级
- 新增 `workspaces` 表：id, name, slug, owner_id, created_at, updated_at
- 新增 `workspace_members` 表：id, workspace_id, user_id, role, created_at
- 新增 `projects` 表：id, workspace_id, name, description, status, created_at, updated_at
- 新增 `issues` 表：id, project_id, title, description, status, priority, assignee_id, creator_id, created_at, updated_at
- 删除 `tasks` 表
- 添加 Drizzle relations 定义

### 2. 共享类型更新
- 新增 Workspace, WorkspaceMember, Project, Issue 类型
- 新增枚举类型：WorkspaceRole, ProjectStatus, IssueStatus, IssuePriority
- 新增所有 CRUD 响应类型
- 删除所有 Task 相关类型

### 3. Migration 生成
- 生成 `0001_0001_add_workspaces_projects_issues.sql`
- 更新 `_journal.json`

### 4. 代码清理
- 删除 5 个 task endpoint 文件（taskCreate, taskList, taskFetch, taskUpdate, taskDelete）
- 删除 5 个前端组件文件（useTasks, TaskCard, CreateTaskModal, EditTaskModal, DeleteConfirmDialog）
- 更新 API 入口：移除 task 路由
- TaskPage 改为占位 UI

**验收结果**：
- ✅ TypeScript 编译通过（零错误）
- ✅ 无残留 Task 引用
- ✅ 认证系统未受影响
- ✅ Migration 文件生成正确

**⚠️ Breaking Changes**：
- `tasks` 表已删除，旧数据不可恢复
- 所有 task API 端点已删除
- 前端 task 相关组件已删除
- 登录后无内容显示（等待 Phase 2 + Phase 4 恢复）

**备注**：
- 数据模型升级为层级化结构：User → Workspace → Project → Issue
- 为后续 RBAC 权限系统（Phase 3）奠定基础
- 中间状态：需要 Phase 2（API）和 Phase 4（前端）才能恢复完整功能

---

## 下一阶段预告

**Phase 2: Backend API 重构**
- 给 workspace, project, issue 表添加完整 CRUD API
- 按模块组织代码
- 完善错误处理和验证

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。
