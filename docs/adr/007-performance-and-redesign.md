# ADR-007: React Performance + Migma UI Redesign

**日期**：2026-08-05

**状态**：已采纳

## 背景

Phase 6 完成了高级交互功能。Phase 7 需要优化性能（大列表处理）并统一 UI 风格。

## 决策

### 1. 虚拟化 — TanStack Virtual

选择 @tanstack/react-virtual：
- 与 TanStack 生态一致（Router + Query + Virtual）
- Headless 设计，7.2KB gzip
- useVirtualizer hook 简单直观
- useInfiniteQuery + useVirtualizer 组合实现无限滚动

**Kanban 列**：虚拟化只在列内垂直滚动，避免 dnd-kit 与虚拟化的冲突
**Users 页面**：独立的无限滚动列表，10 万用户数据，每页 50 条

### 2. 渲染优化

- `React.memo` 包裹高频渲染组件（IssueCard、KanbanColumn、ProjectCard）
- `useMemo` 缓存计算密集型操作（issuesByStatus 分组）
- `useCallback` 稳定所有传入子组件的函数引用

**原则**：先测量再优化，不为优化而优化

### 3. UI 风格 — Migma 极简主义

参考 Migma 设置页的设计风格：
- **零阴影**：全靠边框区分层级
- **灰色系**：active/hover 用灰色，indigo 只用在主按钮
- **点状指示器**：状态用小圆点代替彩色 badge
- **白色卡片**：浅灰背景上的纯白卡片
- **文字优先**：按钮以文字为主，最小化背景色
- **大量留白**：呼吸感，不压迫

## 后果

**正面**：
- 10 万用户列表流畅滚动（虚拟化只渲染 ~15 行）
- 组件渲染次数减少（memo + useMemo + useCallback）
- UI 风格统一，专业感提升

**负面**：
- Mock 数据占内存（10 万对象 ~50MB）
- 虚拟化需要固定行高（estimateSize），动态高度需额外处理
- 全局零阴影在深色模式下可能不够（未实现暗色模式）
