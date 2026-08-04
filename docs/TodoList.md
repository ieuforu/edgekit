# EdgeKit Linear Mini Development Roadmap

目标：

将 EdgeKit 从简单任务管理应用升级为 Linear Mini 风格的多租户 SaaS 项目管理系统。

---

# Phase 0：项目基线

目标：保持当前版本稳定。

## 任务

- Auth
  - register
  - login
  - logout
  - session

- Task CRUD

- README 完善

- local D1 初始化流程

- 稳定版本提交

## 验收

- 新 clone 可以运行
- 注册登录正常
- 创建任务正常

---

# Phase 1：数据库模型升级

目标：

从：

User

↓

Task

升级为：

User

↓

WorkspaceMember

↓

Workspace

↓

Project

↓

Issue

---

## 1.1 Workspace

新增表：

workspaces

字段：

- id
- name
- slug
- owner_id
- created_at
- updated_at

规则：

- 一个用户可以创建多个 workspace
- 创建 workspace 后自动成为 OWNER

---

## 1.2 Workspace Member

新增表：

workspace_members

字段：

- id
- workspace_id
- user_id
- role
- created_at

角色：

- OWNER
- ADMIN
- MEMBER
- VIEWER

约束：

- 一个用户在同一个 workspace 只能有一个 membership

---

## 1.3 Project

新增表：

projects

字段：

- id
- workspace_id
- name
- description
- status
- created_at
- updated_at

状态：

- ACTIVE
- ARCHIVED

---

## 1.4 Issue

替换当前 Task。

新增表：

issues

字段：

- id
- project_id
- title
- description
- status
- priority
- assignee_id
- creator_id
- created_at
- updated_at

状态：

- BACKLOG
- TODO
- IN_PROGRESS
- DONE
- CANCELLED

优先级：

- NO_PRIORITY
- LOW
- MEDIUM
- HIGH
- URGENT

---

# Phase 2：Backend API 重构

目标：

按照业务模块组织后端。

当前：

endpoints/

调整为：

modules/

├── auth/
├── workspace/
├── project/
└── issue/

---

## 2.1 Workspace API

实现：

POST /workspaces

创建 Workspace。

GET /workspaces

获取当前用户加入的 Workspace 列表。

GET /workspaces/:id

获取 Workspace 详情。

GET /workspaces/:id/members

获取成员列表。

---

## 2.2 Project API

CRUD：

GET /projects

POST /projects

PATCH /projects/:id

DELETE /projects/:id

要求：

所有请求必须验证 workspace 权限。

---

## 2.3 Issue API

CRUD：

GET /issues

POST /issues

PATCH /issues/:id

DELETE /issues/:id

支持查询：

?page=1

&status=TODO

&priority=HIGH

&assignee=userId

---

# Phase 3：RBAC 权限系统

目标：

实现真实 SaaS 权限模型。

---

## 角色设计

### OWNER

拥有全部权限。

### ADMIN

权限：

- 管理成员
- 管理项目
- 管理 Issue

### MEMBER

权限：

- 创建 Issue
- 修改自己的 Issue
- 查看项目

### VIEWER

权限：

- 只读访问

---

## 权限抽象

实现：

can(user, action, resource)

例如：

workspace:update

workspace:delete

member:invite

issue:create

issue:update

issue:delete

---

## Backend Middleware

新增：

permission middleware

流程：

Request

↓

Auth Middleware

↓

获取当前用户

↓

查询 workspace membership

↓

Permission Check

↓

Controller

---

## 前端权限控制

实现：

PermissionGuard

例如：

```tsx
<Can permission="issue:create">
  <CreateIssueButton />
</Can>
```

# Phase 4：React 架构升级

目标：

从 demo 项目结构升级为大型应用结构。

---

## 当前结构

src/

├── components/

├── hooks/

├── pages/

└── context/

问题：

随着业务增加：

- components 会越来越混乱
- hooks 会耦合业务
- page 变成巨型组件
- 状态边界不清晰

---

## 目标结构

src/

├── features/

│
├── auth/

│
├── workspace/

│
├── project/

│
└── issue/

├── components/

│
├── ui/

│
└── layout/

└── lib/

    ├── api/

    └── utils/

---

# Feature 设计

## Auth Feature

目录：

features/auth/

职责：

负责用户认证相关逻辑。

包含：

- login
- register
- logout
- session
- user state

推荐结构：

features/auth/

├── api.ts

├── hooks.ts

├── types.ts

└── components/

---

## Workspace Feature

目录：

features/workspace/

职责：

负责工作空间管理。

包含：

- workspace selector
- workspace settings
- member management
- permission

推荐结构：

features/workspace/

├── api.ts

├── hooks.ts

├── components/

└── types.ts

---

## Project Feature

目录：

features/project/

职责：

负责项目管理。

包含：

- project list
- project detail
- project settings

推荐结构：

features/project/

├── api.ts

├── hooks.ts

├── components/

└── types.ts

---

## Issue Feature

目录：

features/issue/

职责：

负责任务系统核心。

包含：

- issue list
- issue detail
- issue editor
- filters
- status update

推荐结构：

features/issue/

├── api.ts

├── hooks.ts

├── components/

├── schemas/

└── types.ts

---

# React 状态分层

大型 React 应用需要区分三类状态。

---

## Server State

使用：

TanStack Query

负责：

- projects
- issues
- members
- users
- permissions

特点：

数据来源服务器。

需要：

- cache
- refetch
- loading
- error handling

---

## Client State

使用：

Zustand / Jotai

负责：

客户端 UI 状态。

例如：

- sidebar 展开状态
- modal 状态
- theme
- 页面级 UI 状态

不要存：

- projects
- issues

这些属于服务器数据。

---

## URL State

使用：

TanStack Router

负责：

可分享、可恢复的页面状态。

例如：

workspaceId

projectId

filters

pagination

search params

例如：

/workspace/acme/issues?status=TODO&page=2

---

# 最终数据流

用户操作

↓

React Component

↓

Feature Hook

↓

TanStack Query

↓

API

↓

Hono Worker

↓

Drizzle

↓

D1

UI 状态：

Component

↓

Zustand/Jotai

页面状态：

Router

↓

URL

---

# Phase 5：TanStack Query 接入

目标：

统一 Server State 管理。

替换：

useEffect + fetch

使用：

- useQuery
- useMutation
- Query Cache
- invalidateQueries

实现：

- loading 状态
- error 状态
- cache 更新
- mutation 管理

---

# Phase 6：高级交互

目标：

实现接近 Linear 的交互体验。

---

# 6.1 Optimistic Update

目标：

用户操作后立即更新 UI。

例如：

Issue 状态修改：

TODO

↓

DONE

流程：

用户拖动 Issue

↓

立即更新本地 Cache

↓

发送 API 请求

↓

成功：

保持状态

失败：

Rollback

技术：

TanStack Query mutation

使用：

- onMutate
- onError
- onSettled

---

# 6.2 Kanban Board

目标：

实现类似 Linear / Jira 的看板。

状态：

BACKLOG

TODO

IN_PROGRESS

DONE

功能：

- 拖拽 Issue
- 修改状态
- 排序
- 保存位置

技术：

dnd-kit

数据：

issues 根据 status 分组。

例如：

BACKLOG:

Issue A

Issue B

TODO:

Issue C

IN_PROGRESS:

Issue D

---

# 6.3 Issue Detail Panel

实现右侧详情面板。

包含：

- title
- description
- status
- priority
- assignee
- comments
- activity log

结构：

IssueList

↓

点击 Issue

↓

IssueDetail

---

# 6.4 Filtering System

支持：

状态筛选：

- TODO
- IN_PROGRESS
- DONE

优先级筛选：

- HIGH
- MEDIUM
- LOW

负责人筛选：

- assignee

时间筛选：

- created time

状态保存：

使用 URL Search Params。

例如：

/issues?status=TODO&priority=HIGH

---

# Phase 7：React 性能优化

目标：

结合 Fiber 理解 React 性能。

---

# 7.1 大列表优化

场景：

10000 个 Issue。

问题：

一次渲染大量 DOM。

解决：

Virtualization。

技术：

TanStack Virtual

目标：

只渲染可见区域。

例如：

10000 条数据

实际 DOM：

20-50 个节点

---

# 7.2 Render 优化

检查：

组件是否重复渲染。

工具：

React DevTools Profiler

优化：

- memo
- useMemo
- useCallback

原则：

不要为了优化而优化。

先发现瓶颈。

---

# 7.3 状态拆分优化

错误：

一个全局 store：

```text
{
 users,
 projects,
 issues,
 sidebar,
 modal
}
```

---

# Phase 8：工程化

目标：

接近生产项目。

---

# 8.1 Shared Package

目标：

建立 monorepo 共享层。

目录：

packages/shared/

结构：

packages/shared/

├── types/

├── schemas/

└── constants/

---

## Types

共享实体类型：

- User
- Workspace
- WorkspaceMember
- Project
- Issue

例如：

```ts
export interface Issue {
  id: string
  title: string
  status: IssueStatus
}
```

# 8.2 API 类型共享

目标：

实现前后端类型一致。

避免：

前端重复定义 API 类型。

## 架构流程

packages/shared

↓

Hono RPC

↓

React Client

## 共享内容

### Request Type

例如：

- CreateIssueRequest
- UpdateProjectRequest

### Response Type

例如：

- IssueResponse
- ProjectResponse

### Error Type

例如：

- ApiError

## 最终效果

后端修改类型：

Issue

↓

shared 更新

↓

React 自动获得类型提示

解决：

- 类型重复
- API 不一致
- 手写 interface

---

# 8.3 Testing

目标：

提高项目可靠性。

## Frontend

技术：

- Vitest
- React Testing Library

测试内容：

### Component

例如：

- Button
- Modal
- Form

### Hooks

例如：

- useAuth
- useIssues

### User Interaction

例如：

- 登录流程
- 创建 Issue
- 修改状态

## Backend

测试：

### API Route

例如：

- workspace API
- project API
- issue API

### Authentication

测试：

- 登录
- Session
- Token

### Permission

测试：

- OWNER
- ADMIN
- MEMBER
- VIEWER

### Database

测试：

- CRUD
- 数据隔离

---

# 8.4 CI

目标：

自动化检查，保证代码质量。

使用：

GitHub Actions

流程：

代码提交

↓

Install Dependencies

↓

Lint

↓

Type Check

↓

Test

↓

Build

↓

Deploy

检查：

- 代码格式
- 类型错误
- 单元测试
- 构建失败

---

# 8.5 Error Tracking

目标：

生产环境快速定位问题。

使用：

Sentry

捕获：

Frontend：

- React Runtime Error
- Component Error Boundary
- Network Error

Backend：

- Worker Exception
- API Error
- Database Error

---

# 8.6 Type Safety

目标：

保持大型项目类型可靠。

包含：

- TypeScript strict mode
- shared package 类型检查
- API 类型检查
- CI 自动检查

目标：

修改后端类型：

↓

shared 更新

↓

前端自动发现错误

---

# 8.7 Design System

目标：

建立统一 UI 层。

目录：

packages/ui/

组件：

- Button
- Input
- Dialog
- Table
- Form
- DataGrid

技术：

- shadcn/ui
- Radix primitives
- Tailwind CSS tokens

目标：

避免业务中重复编写 UI。

---

# Phase 9：部署

目标：

完整 Cloud SaaS 部署流程。

---

# Frontend Deployment

平台：

Cloudflare Pages

流程：

Git Push

↓

CI

↓

Build

↓

Deploy

---

# Backend Deployment

平台：

Cloudflare Workers

部署：

```bash
wrangler deploy
```

# Database Deployment

平台：

Cloudflare D1

环境：

Local D1

↓

Remote D1

迁移：

Drizzle Migration

流程：

Schema 修改

↓

Generate Migration

↓

Apply Remote

---

# 最终项目能力覆盖

## React 能力

掌握：

- Fiber 渲染模型
- Hooks 生命周期
- Server State 管理
- Component Architecture
- Performance Optimization

---

## 前端架构能力

掌握：

- Feature Architecture
- Design System
- Monorepo
- State Architecture
- API Contract Design

---

## 全栈工程能力

掌握：

- Authentication
- RBAC
- Database Modeling
- API Design
- Deployment

---

# EdgeKit Final Stack

技术栈：

React 19

-

TanStack Router

-

TanStack Query

-

Zustand / Jotai

-

shadcn/ui

-

Hono

-

Drizzle ORM

-

Cloudflare Workers

-

Cloudflare D1

---

# 最终目标

一个完整现代 SaaS 项目架构案例。

它不仅展示：

"会写 React"

而是展示：

- 能设计前端架构
- 能管理复杂状态
- 能设计权限系统
- 能建模业务数据
- 能完成前后端协作
- 能部署生产环境
