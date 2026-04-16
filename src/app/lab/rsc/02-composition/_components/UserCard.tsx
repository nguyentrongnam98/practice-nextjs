'use client'

import { useState } from 'react'

interface User {
  name: string
  email: string
  bio: string
  joinedAt: string
}

export function UserCard({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
          Client Component
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-400">Joined: {user.joinedAt}</p>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        {expanded ? 'Hide' : 'Show'} bio
      </button>

      {expanded && (
        <p className="mt-2 rounded bg-gray-50 p-3 text-sm text-gray-700">{user.bio}</p>
      )}

      <p className="mt-3 rounded bg-green-50 p-2 text-xs text-green-700">
        Data fetched on <strong>server</strong> (no useEffect, no loading state).
        Interactivity (toggle) runs on <strong>client</strong>.
      </p>
    </div>
  )
}
