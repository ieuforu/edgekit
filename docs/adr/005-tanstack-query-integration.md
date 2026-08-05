# ADR-005: TanStack Query 接入

**日期**：2026-08-04

**状态**：已采纳

## 背景

Phase 4 完成了 feature-based 架构和 workspace UI，但所有数据获取使用手动 `useState + fetch + useCallback + useEffect` 模式：

- 每个 hook 手动管理 loading / error / data 状态
- 没有缓存机制，组件切换后重新请求
- 没有统一的 refetch / invalidation 策略
- 为乐观更新（Phase 6）做准备需要 mutation 管理能力

## 决策

采用 TanStack Query v5 作为 Server State 管理方案。

### 替换范围

| 功能     | 之前                             | 之后                      |
| -------- | -------------------------------- | ------------------------- |
| 数据获取 | `useState + fetch + useEffect`   | `useQuery`                |
| 数据变更 | `useState + fetch + useCallback` | `useMutation`             |
| 缓存     | 无                               | 自动 query cache          |
| 刷新     | 手动 refetch                     | `invalidateQueries`       |
| 加载状态 | `loading: boolean`               | `isLoading` / `isPending` |

### 保留不动

- **Auth hooks** — 认证状态是全局 UI 上下文，用 React Context 更合适。登录/登出是"一次性动作"，不需要 cache。
- **useCurrentWorkspace** — 纯派生逻辑，从列表中选取当前工作区，不涉及网络请求。

### 配置决策

- **staleTime: 5 分钟** — 工作区列表不会频繁变化，5 分钟内组件切换不重新请求
- **retry: 1** — 一次重试，避免无限重试浪费资源
- **refetchOnWindowFocus: false** — 开发阶段频繁切换窗口会导致无意义请求

### Query Key Factory

```ts
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: number) => ['workspaces', id] as const,
}
```

集中管理 query key，为后续 Project / Issue feature 提供统一模式。

## 后果

**正面**：

- 数据获取逻辑大幅简化，每个 hook 从 20+ 行减少到 5-10 行
- 自动 cache 和 stale 管理，用户体验提升
- 为 Phase 6 的乐观更新（optimistic update）提供基础设施
- 统一的 error / loading 状态处理

**负面**：

- 引入 TanStack Query 依赖（但这是 React Server State 管理的事实标准）
- 需要学习 useQuery / useMutation / invalidateQueries 的 API 模式
