# EdgeKit 开发日志

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 0: 项目基线 | ✅ 完成 | Auth + Task CRUD + README |
| Phase 1: 数据库模型升级 | ✅ 完成 | 新增 workspace/project/issue 表，删除 tasks |
| Phase 2: Backend API 重构 | ✅ 完成 | 14 个 API 端点 + 模块化结构 + 权限检查 |
| Phase 3: RBAC 权限系统 | ⏳ 待开始 | 完整 RBAC + 前端权限控制 |
| Phase 4: React 架构升级 | ⏳ 待开始 | Feature-based 模块化 + UI 重建 |
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
- Drizzle Schema 升级：4 张新表 + relations
- 共享类型更新：Workspace/Project/Issue 及响应类型
- Migration 生成：0001_0001_add_workspaces_projects_issues.sql
- 代码清理：删除 task endpoint 和前端组件

**验收结果**：
- ✅ TypeScript 编译通过
- ✅ 认证系统未受影响

**Breaking Changes**：
- tasks 表删除，task API 和组件全部移除

---

## Phase 2：Backend API 重构

**日期**：2026-08-04

**目标**：
- 代码结构重组为模块化
- 实现 workspace/project/issue 完整 CRUD
- 添加 workspace 权限检查

**完成内容**：

### 1. 代码结构重组
```
apps/api/src/modules/
├── auth/          — 认证（register, login, logout, me）
├── workspace/     — 工作空间（create, list, get, members）
├── project/       — 项目（create, list, get, update, delete）
└── issue/         — 工单（create, list, get, update, delete）
```

### 2. API 端点（14 个）
- Workspace: 4 个（创建、列表、详情、成员）
- Project: 5 个（完整 CRUD）
- Issue: 5 个（完整 CRUD + 筛选 + 分页）

### 3. 权限系统
- `authMiddleware` — 验证 session token
- `requireWorkspaceRole()` — 路径参数中间件
- `checkWorkspaceMembership()` — 业务逻辑中验证
- 角色层级：OWNER(4) > ADMIN(3) > MEMBER(2) > VIEWER(1)
- 读操作：VIEWER+ | 写操作：MEMBER+

### 4. Issue 列表筛选
- 支持按 status、priority、assignee 筛选
- 支持分页（page、limit 参数）

**验收结果**：
- ✅ TypeScript 编译通过（零错误）
- ✅ Hono RPC 类型导出正常
- ✅ 所有 API 端点实现完成
- ✅ 权限检查逻辑正确

**备注**：
- 删除了旧的 endpoints/ 目录
- Issue 分页使用内存分页（D1 不支持复杂 JOIN 的 LIMIT/OFFSET）
- 所有 ID 参数在 Chanfana 中为 string，handler 中 parseInt 转换

---

## 下一阶段预告

**Phase 3: RBAC 权限系统**
- 完整的角色权限控制
- 前端权限感知 UI
- 权限管理界面

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。
