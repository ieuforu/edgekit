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

---

## Phase 5: TanStack Query 接入

**日期**：2026-08-04

**目标**：将手动 useState + fetch 模式替换为 TanStack Query，统一 Server State 管理。

### 1. 依赖安装

- `@tanstack/react-query ^5.101.4`

### 2. QueryClientProvider

- `main.tsx` 中添加 `QueryClientProvider`，包裹在 `AuthProvider` 外层
- 默认配置：5 分钟 staleTime、1 次 retry、关闭 refetchOnWindowFocus

### 3. Workspace Hooks 重写

**query key factory**：

```ts
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: number) => ['workspaces', id] as const,
}
```

**useWorkspaces** — `useQuery`，queryKey `['workspaces']`

- 返回 `{ data, isLoading, error, refetch }`
- 自动 cache，组件切换后回来不重复请求

**useWorkspace(id)** — `useQuery` + `enabled` flag

- 仅在 id 不为 null 时触发
- 单个工作区详情查询

**useCreateWorkspace** — `useMutation`

- 返回 `{ mutate, isPending, error }`
- 成功后自动 `invalidateQueries({ queryKey: workspaceKeys.all })`
- 列表自动刷新，无需手动 refetch

### 4. 组件适配

- **App.tsx** — `data` 代替 `workspaces`，`isLoading` 代替 `loading`，移除手动 refetch 回调
- **CreateWorkspaceDialog** — `mutate()` 代替 `await create()`，`isPending` 代替 `loading`

### 5. 未修改

- Auth hooks — 保持 React Context 模式（认证状态是全局 UI 状态，不是 server state）
- 后端代码
- UI 行为完全不变

**验收结果**：

- ✅ TypeScript 编译通过（零错误）
- ✅ QueryClientProvider 正确包裹
- ✅ useWorkspaces 使用 useQuery
- ✅ useCreateWorkspace 使用 useMutation + cache invalidation
- ✅ 创建 workspace 后列表自动刷新
- ✅ 组件切换回来时数据从 cache 读取，不重复请求

**技术亮点**：

- query key factory 模式为后续 feature 的 query 管理提供统一规范
- staleTime 5 分钟避免频繁请求，同时保证数据新鲜度
- TanStack Query 的 `isPending` 区分"首次加载"和"后台刷新"（区别于 isLoading）

---

## 下一阶段预告

**Phase 6: 高级交互**

- Project / Issue CRUD UI
- 乐观更新（Optimistic Update）
- 拖拽排序
- 键盘快捷键

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。

---

## Phase 6: Motion 动效 + Project CRUD

**日期**：2026-08-04

**目标**：UI 动效打磨 + Project 创建/列表/删除功能 + 乐观更新。

### 1. Motion 动效

- 安装 `motion` 包（替代 framer-motion）
- Dialog overlay + popup 动画（CSS transitions，Base UI 兼容）
- App.tsx 页面过渡（AnimatePresence）
- WorkspaceSidebar 弹簧滑入动画
- IssuePage 卡片 hover 效果
- 按钮按压反馈（whileTap scale）
- WorkspaceSelector 下拉项交错入场

### 2. Project CRUD UI

#### API 层

- `features/project/api.ts` — fetchProjects / createProject / updateProject / deleteProject

#### Hooks（TanStack Query + 乐观更新）

- `useProjects(workspaceId)` — useQuery 列表查询
- `useCreateProject(workspaceId)` — useMutation，onMutate 乐观插入，onError 回滚，onSettled invalidate
- `useDeleteProject(workspaceId)` — useMutation，onMutate 乐观移除，onError 回滚

#### 组件

- **CreateProjectDialog** — shadcn Dialog + Input + Textarea，创建后自动关闭
- **ProjectList** — 响应式双列卡片网格，status badge，删除确认 AlertDialog
- **IssuePage** — 集成 ProjectList，"New Project" 按钮

#### shadcn 组件新增

- AlertDialog（删除确认）
- Badge（状态标签）
- Textarea（项目描述输入）

### 3. 权限中间件修复

`resolveWorkspaceId` 新增两种解析方式：

- `?workspaceId` query param — 支持 GET 请求（如 `/api/projects?workspaceId=1`）
- `body.workspaceId` — 支持 POST 请求（如创建项目）

**验收结果**：

- ✅ TypeScript 编译通过（零错误）
- ✅ 创建项目乐观更新瞬间显示
- ✅ 删除项目乐观移除 + 确认弹窗
- ✅ 创建/删除后自动 refetch 最新数据
- ✅ 卡片 hover 动效
- ✅ 权限中间件正确解析 workspaceId

**技术亮点**：

- 乐观更新的 cache 格式必须与 queryFn 返回值一致（数组 vs 对象），否则 .map 会报错
- Base UI 的 Dialog 不支持 AnimatePresence 控制 portal 生命周期，改用 CSS transitions
- 权限中间件需要 clone request body 来读取 workspaceId，避免消费原始 body

---

## 下一阶段预告

**Phase 6 继续**: Issue CRUD + Kanban Board + Issue Detail Panel + Filtering

---

## 重大决策记录

详见 `docs/adr/` 目录下的 ADR 文档。

---

## Phase 6 续: Kanban + Issue Detail + Filtering + Router

**日期**：2026-08-04（续）

**状态**：基本功能完成，存在已知 bug 待修复。

### 完成的功能

1. **Kanban 看板** — dnd-kit 拖拽，5 列状态分组，乐观更新
2. **Issue Detail Panel** — 右侧滑入面板，可编辑标题/描述/状态/优先级
3. **Filtering System** — Status + Priority 筛选，URL search params 持久化
4. **TanStack Router** — 文件路由，loader-based 重定向
5. **权限中间件修复** — 支持 body.workspaceId 和 query param
6. **ProjectCard 删除按钮** — 事件传播修复

### 已知问题（待修复）

1. **TanStack Router 导航** — URL 切换不稳定，loader 重定向有时不触发
2. **AlertDialog 事件冒泡** — ProjectCard 的 AlertDialog 按钮仍可能触发卡片导航
3. **Issue 创建后列表刷新** — 偶发不显示新创建的 issue

### 技术笔记

- TanStack Router v1 的 `loader` 是做重定向的正确方式，不要在 render body 里调 `router.navigate()`
- `throw redirect()` 只能在 `loader` 或事件处理器里用
- Base UI 的 Dialog/AlertDialog 渲染在 portal 里，事件冒泡需要特殊处理
- 乐观更新的 cache 格式必须与 queryFn 返回值完全一致

---

## 下一步

- 修复上述已知问题
- 完善 URL State 集成（workspaceId + projectId + filters 全部走 URL）
- Phase 7: React 性能优化

---

## Phase 6 续: 路由重构 + UI 打磨 + Bug 修复

**日期**：2026-08-05

### 路由重构

完整路由结构：

```
/auth/login          → LoginPage
/auth/register       → RegisterPage
/                    → beforeLoad 重定向
/workspace/$wid      → Layout (sidebar + header + Outlet)
/workspace/$wid/     → ProjectList (默认)
/workspace/$wid/projects/$pid → KanbanBoard
Issue 详情 → search params ?issueId=123
```

关键修复：

- `throw redirect()` 在 catch 块里被吞 → 用 `isRedirect()` 函数正确检测
- `loader` 改为 `beforeLoad` 做认证检查（后来又移除了 beforeLoad 的 auth 检查）
- 登录/登出后用 `window.location.href = '/'` 强刷触发路由重匹配
- `_index` 文件名改为 `index` 生成正确的子路由路径

### UI 打磨

- Inter 字体接入
- CSS 变量全面更新（indigo 主色、浅色侧边栏）
- Sidebar: 浅色背景 + lucide 图标 + indigo active 高亮
- Project 卡片: hover 微上浮、删除按钮重新定位
- Kanban 列: tinted 背景色、空列提示
- Issue Detail Panel: 状态/优先级颜色指示器
- 登录/注册: 居中卡片设计

### 性能优化

- QueryClient: `refetchOnMount: false`, `gcTime: 30分钟`
- 移除 `beforeLoad` 里的 raw fetch `/api/workspaces/:id`
- Workspace 数据全走 React Query cache

### 已知问题（仍待修复）

- Issue 创建后列表刷新偶发失败
- AlertDialog 事件冒泡（ProjectCard）
- 部分 UI 细节仍需打磨

---

## Phase 6: 完整交付总结

**日期**：2026-08-05

### 6.1 Optimistic Update

- Issue/Project 的 create/update/delete 全部使用 TanStack Query mutation
- onMutate → cancelQueries + snapshot + optimistic update
- onError → rollback
- onSettled → invalidateQueries

### 6.2 Kanban Board

- dnd-kit 拖拽（PointerSensor，8px 激活距离）
- 5 列状态：BACKLOG / TODO / IN_PROGRESS / DONE / CANCELLED
- 拖拽到新列自动改 status（乐观更新）
- 列内 tinted 背景色（蓝/黄/绿/红/灰）
- ScrollArea 用于列内垂直滚动 + 看板水平滚动
- CSS custom-scrollbar：hover 才显示滚动条

### 6.3 Issue Detail Panel

- 右侧滑入面板（motion 动画）
- 可编辑标题（inline）
- 描述文本区（blur 自动保存）
- Status / Priority 下拉切换
- 元数据展示（创建时间、创建者）
- AlertDialog 确认删除

### 6.4 Filtering System

- Status + Priority 筛选
- URL search params 持久化（`?status=TODO&priority=HIGH`）
- IssueFilterBar：筛选 chips + 清除按钮

### 路由体系

```
/auth/login          → LoginPage
/auth/register       → RegisterPage
/                    → beforeLoad 重定向
/workspace/$wid      → Layout (sidebar + header + Outlet)
/workspace/$wid/     → ProjectList
/workspace/$wid/projects/$pid → KanbanBoard
Issue 详情 → ?issueId=123
```

### UI 打磨

- Inter 字体 + CSS 变量设计系统
- 浅色侧边栏（lucide 图标、indigo active 高亮）
- Project 卡片（hover 微上浮、删除按钮定位修复）
- Login/Register 居中卡片设计
- ScrollArea / CSS custom-scrollbar
- AlertDialog 事件冒泡修复

### Bug 修复

- beforeLoad redirect 被 catch 吞掉 → isRedirect() 函数
- 登录/登出不跳转 → window.location.href 强刷
- _index 路由路径错误 → 改为 index.tsx
- Issue 创建后列表不刷新 → refetchQueries + useMemo
- 删除按钮冒泡 → e.stopPropagation()
- 重复 /api/auth/me 请求 → 移除 beforeLoad 中的 raw fetch

### 未完成（可选后续）

- Kanban 列内排序
- Issue 指派人选择
- Issue 评论 / 活动日志
- 按指派人 / 时间筛选
- 暗色模式
- 响应式移动端适配

---

## Phase 7: React 性能优化 + Migma 风格 UI 重设计

**日期**：2026-08-05

### 7.1 大列表虚拟化

- `@tanstack/react-virtual` 接入 Kanban 列内垂直滚动
- Mock 数据生成器（10 万条 Issue）
- Users 页面：`useInfiniteQuery` + `useVirtualizer` 无限滚动
  - 每页 50 条，搜索防抖 250ms
  - 10 万用户数据，只渲染可见区域
- 用户详情页：profile card + info rows

### 7.2 渲染优化

- `React.memo` 包裹：IssueCard、KanbanColumn、ProjectCard
- `useMemo` 缓存：issuesByStatus 分组
- `useCallback` 稳定：所有事件处理器

### 7.3 状态拆分

- `StateViews.tsx` — 通用 LoadingView / ErrorView / EmptyView
- ProjectList 已迁移到 StateViews

### Migma 风格 UI 重设计

- 设计系统全面更新：`#f8f9fa` 背景、白色卡片、`#e9ecef` 边框
- 零阴影原则：全靠边框区分层级
- 灰色系 active/hover：indigo 只用在主按钮
- 点状状态指示器：取代彩色 badge pill
- 白色侧边栏 + 分组导航
- 极简 header：纯文字用户信息
- 文字优先按钮设计
- 大量留白 + 干净排版

### 路由新增

```
/workspace/$wid/users         → Users 列表（无限滚动虚拟化）
/workspace/$wid/users/$userId → User 详情页
```

### 修改的文件（18+）

设计系统、侧边栏、Header、Project 卡片、Kanban 列、Issue 卡片、
Detail Panel、Filter Bar、登录/注册、Users 页面、所有 shadcn 组件
