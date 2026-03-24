/**
 * Next-Buckler NextAuth Integration
 * Optional helpers for NextAuth.js integration
 * 
 * This file is tree-shakeable - only imported if you use NextAuth
 * 
 * @requires next-auth (peer dependency)
 */

/**
 * NextAuth session type (minimal interface)
 * Extend this in your project with your actual session type
 */
export interface BucklerSession {
  user?: {
    [key: string]: any
  }
  roles?: string[]
  [key: string]: any
}

/**
 * Configuration for session processing
 */
export interface SessionProcessorOptions {
  /**
   * Default role for unauthenticated users
   * @default 'anonymous'
   */
  anonymousRole?: string

  /**
   * Default role for authenticated users without specific roles
   * @default 'user'
   */
  defaultRole?: string

  /**
   * Role prefix for normalization
   * @example 'app-role-' → 'admin' becomes 'app-role-admin'
   */
  rolePrefix?: string

  /**
   * Filter function to validate roles
   * @example (role) => role.startsWith('app-role-')
   */
  roleFilter?: (role: string) => boolean

  /**
   * Minimum number of valid roles required
   * If user has fewer valid roles, defaultRole is used
   */
  minValidRoles?: number
}

const DEFAULT_SESSION_OPTIONS: Required<SessionProcessorOptions> = {
  anonymousRole: 'anonymous',
  defaultRole: 'user',
  rolePrefix: '',
  roleFilter: () => true,
  minValidRoles: 1,
}

/**
 * Processes NextAuth session to extract and normalize roles
 * Handles edge cases like missing roles, invalid roles, etc.
 * 
 * **Security features:**
 * - Validates role format
 * - Filters invalid roles
 * - Provides fallbacks for edge cases
 * - Returns consistent array format
 * 
 * @param session - NextAuth session object (or null if not authenticated)
 * @param options - Processing options
 * @returns Array of normalized role strings
 * 
 * @example
 * ```ts
 * import { useSession } from 'next-auth/react'
 * import { processSessionRoles } from 'next-buckler/integrations/next-auth'
 * 
 * const { data: session } = useSession()
 * const roles = processSessionRoles(session, {
 *   rolePrefix: 'app-role-',
 *   roleFilter: (role) => role.startsWith('app-role-'),
 * })
 * ```
 */
export function processSessionRoles(
  session: BucklerSession | null | undefined,
  options?: SessionProcessorOptions
): string[] {
  const opts = { ...DEFAULT_SESSION_OPTIONS, ...options }

  // Not authenticated - return anonymous role
  if (!session || !session.user) {
    return [opts.anonymousRole]
  }

  // Extract roles from session
  let roles: string[] = []
  
  if (Array.isArray(session.roles)) {
    roles = session.roles
  } else if (session.user && Array.isArray(session.user.roles)) {
    roles = session.user.roles
  } else if (session.user && typeof session.user.role === 'string') {
    roles = [session.user.role]
  }

  // Filter and normalize roles
  let validRoles = roles
    .filter((role): role is string => typeof role === 'string' && role.length > 0)
    .filter(opts.roleFilter)
    .map(role => {
      // Add prefix if not present
      if (opts.rolePrefix && !role.startsWith(opts.rolePrefix)) {
        return `${opts.rolePrefix}${role}`
      }
      return role
    })

  // If no valid roles found, use default
  if (validRoles.length < opts.minValidRoles) {
    return [opts.defaultRole]
  }

  return validRoles
}

/**
 * Hook version of processSessionRoles (if using Next-Auth hooks)
 * Note: Requires next-auth to be installed
 * 
 * @param session - NextAuth session object
 * @param options - Processing options
 * @returns Object with Buckler-compatible properties
 * 
 * @example
 * ```ts
 * import { useSession } from 'next-auth/react'
 * import { useBucklerSession } from 'next-buckler/integrations/next-auth'
 * 
 * function MyApp({ Component, pageProps }) {
 *   const { data: session, status } = useSession()
 *   const bucklerSession = useBucklerSession(session, status)
 *   
 *   return (
 *     <Buckler
 *       isAuth={bucklerSession.isAuthenticated}
 *       isLoading={bucklerSession.isLoading}
 *       userRoles={bucklerSession.roles}
 *       // ... other props
 *     >
 *       <Component {...pageProps} />
 *     </Buckler>
 *   )
 * }
 * ```
 */
export function useBucklerSession(
  session: BucklerSession | null | undefined,
  status: 'loading' | 'authenticated' | 'unauthenticated',
  options?: SessionProcessorOptions
) {
  const roles = processSessionRoles(session, options)
  
  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    roles,
    session,
  }
}

/**
 * Creates a role handler function based on business logic
 * Useful for complex role validation scenarios
 * 
 * @param validationRules - Custom validation rules
 * @returns Function that processes session roles
 * 
 * @example
 * ```ts
 * const handleRoles = createRoleHandler({
 *   requirePrefix: 'app-role-',
 *   allowMultiple: true,
 *   priority: ['admin', 'editor', 'user'], // First matching role wins
 * })
 * 
 * const roles = handleRoles(session)
 * ```
 */
export function createRoleHandler(validationRules: {
  requirePrefix?: string
  allowMultiple?: boolean
  priority?: string[]
  fallback?: string
}) {
  return (session: BucklerSession | null | undefined): string[] => {
    const roles = processSessionRoles(session, {
      rolePrefix: validationRules.requirePrefix,
    })

    // If single role required, return highest priority
    if (!validationRules.allowMultiple && validationRules.priority) {
      for (const priorityRole of validationRules.priority) {
        const fullRole = validationRules.requirePrefix 
          ? `${validationRules.requirePrefix}${priorityRole}`
          : priorityRole
        
        if (roles.includes(fullRole)) {
          return [fullRole]
        }
      }
    }

    return roles.length > 0 ? roles : [validationRules.fallback || 'user']
  }
}
