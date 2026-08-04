import { createContext, useContext, type ReactNode } from 'react'
import type { RoleName } from '@edgekit/shared'

interface RoleState {
  /** Current user's role in the active workspace, or null if unknown */
  role: RoleName | null
}

const RoleContext = createContext<RoleState>({ role: null })

/**
 * Provides the current user's workspace role to descendant components.
 * Typically mounted at the workspace level once the membership is known.
 */
export function RoleProvider({ role, children }: { role: RoleName | null; children: ReactNode }) {
  return <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>
}

/**
 * Hook to access the current user's workspace role.
 * Returns `null` when the role is unknown (e.g. outside a workspace context).
 */
export function useRole(): RoleName | null {
  return useContext(RoleContext).role
}
