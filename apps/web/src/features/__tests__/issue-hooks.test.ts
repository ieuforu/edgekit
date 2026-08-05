import { describe, it, expect } from 'vitest'
import { issueKeys } from '../issue/hooks'

describe('Issue query keys', () => {
  it('all returns base key', () => {
    expect(issueKeys.all).toEqual(['issues'])
  })

  it('list returns key with filters', () => {
    const filters = { projectId: 1, status: 'TODO' }
    expect(issueKeys.list(filters)).toEqual(['issues', filters])
  })

  it('detail returns key with id', () => {
    expect(issueKeys.detail(42)).toEqual(['issues', 42])
  })

  it('list key is stable for same filters', () => {
    const filters = { projectId: 1 }
    const key1 = issueKeys.list(filters)
    const key2 = issueKeys.list(filters)
    expect(key1).toEqual(key2)
  })

  it('different filters produce different keys', () => {
    const key1 = issueKeys.list({ projectId: 1 })
    const key2 = issueKeys.list({ projectId: 2 })
    expect(key1).not.toEqual(key2)
  })
})
