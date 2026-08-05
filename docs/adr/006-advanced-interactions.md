# ADR-006: Advanced Interactions (Phase 6)

**日期**：2026-08-05

**状态**：已采纳

## 背景

Phase 5 完成了 TanStack Query 的 server state 管理。Phase 6 需要在其基础上构建高级交互：Kanban 看板、Issue 详情面板、筛选系统、乐观更新。

## 决策

### 1. Kanban 拖拽 — dnd-kit

选择 @dnd-kit/core 而非 react-beautiful-dnd：

- dnd-kit 更轻量，维护活跃
- 支持自定义传感器（PointerSensor + distance constraint 防止误触）
- DragOverlay 提供拖拽预览
- useDroppable + useDraggable 模式简单直观

### 2. 滚动条 — CSS custom-scrollbar

放弃 shadcn ScrollArea（base-ui），改用纯 CSS 自定义滚动条：

- ScrollArea 有 JS 初始化延迟，初始渲染会闪原生滚动条
- CSS 方案零延迟，hover 才显示半透明细滚动条
- `.custom-scrollbar` class 统一管理

### 3. Issue 详情面板 — 右侧滑入

- 使用 motion 的 slide-in 动画（x: '100%' → 0）
- 遮罩 bg-black/30，点击关闭
- 宽度 480px（桌面端），移动端全屏
- 状态/优先级修改直接走 useUpdateIssue mutation

### 4. 筛选系统 — URL Search Params

使用 TanStack Router 的 validateSearch 将筛选条件同步到 URL：

- `?status=TODO&priority=HIGH&issueId=123`
- 可分享、可书签、浏览器前进后退自动恢复
- FilterBar 用 chips 显示活跃筛选 + 清除按钮

### 5. 路由体系

完整路由结构：

```
/auth/login + /auth/register → 独立认证页面
/workspace/$wid → layout route（sidebar + header + Outlet）
/workspace/$wid/ → project list（默认子路由）
/workspace/$wid/projects/$pid → kanban board
```

使用 beforeLoad 做认证检查（已移除，改由 AuthProvider 管理）。
window.location.href 做登录/登出跳转（确保 beforeLoad 重新执行）。

## 后果

**正面**：

- Kanban 拖拽体验接近 Linear
- URL 状态可分享、可恢复
- 乐观更新让操作感觉即时

**负面**：

- dnd-kit 拖拽在移动端支持有限（PointerSensor）
- CSS scrollbar 方案不支持自定义颜色主题
- motion 增加了 ~30KB bundle size
