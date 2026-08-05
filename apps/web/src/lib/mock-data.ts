import type { IssueType } from '@edgekit/shared'

const STATUSES: IssueType['status'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']
const PRIORITIES: IssueType['priority'][] = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']
const TITLES = [
  'Fix login page crash on mobile',
  'Update API documentation',
  'Refactor auth middleware',
  'Add dark mode support',
  'Implement webhook notifications',
  'Optimize database queries',
  'Fix timezone handling bug',
  'Add export CSV feature',
  'Update dependencies',
  'Write unit tests for API',
  'Design system color tokens',
  'Migrate to React 19',
  'Add i18n support',
  'Fix memory leak in WebSocket',
  'Implement rate limiting',
  'Add file upload validation',
  'Create CI/CD pipeline',
  'Fix broken pagination',
  'Add audit logging',
  'Refactor error boundaries',
  'Implement SSO integration',
  'Add CSV import feature',
  'Fix CSS grid layout on Safari',
  'Add keyboard shortcuts',
  'Implement batch operations',
  'Add GraphQL subscriptions',
  'Fix race condition in form',
  'Add session management',
  'Implement search indexing',
  'Add performance monitoring',
]

export function generateMockIssues(count: number, projectId: number = 1): IssueType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    projectId,
    title: `${TITLES[i % TITLES.length]} #${i + 1}`,
    description: i % 3 === 0 ? `Description for issue ${i + 1}. This is a detailed description of the task.` : null,
    status: STATUSES[i % STATUSES.length],
    priority: PRIORITIES[i % PRIORITIES.length],
    assigneeId: i % 5 === 0 ? 1 : null,
    creatorId: 1,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
  }))
}
