'use client'

import { useTransition } from 'react'
import { setRoleAction } from '@/features/auth/actions/setRole'
import type { Role } from '@/features/auth/helpers/role'

interface RoleSwitcherProps {
  current: Role
}

const ROLES: Role[] = ['user', 'admin']

export function RoleSwitcher({ current }: RoleSwitcherProps) {
  const [pending, start] = useTransition()
  return (
    <div className="ml-auto flex items-center gap-2 text-sm">
      <span className="text-gray-500">Role:</span>
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          disabled={pending || current === r}
          onClick={() => start(() => setRoleAction(r))}
          className={
            current === r
              ? 'font-bold underline text-blue-600'
              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
          }
        >
          {r}
        </button>
      ))}
    </div>
  )
}
