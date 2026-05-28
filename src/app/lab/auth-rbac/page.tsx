import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-session',
    title: 'Session management',
    desc: 'Create a session in an httpOnly cookie; read it server-side; sign out.',
  },
  {
    num: '02',
    slug: '02-protection',
    title: 'Route protection (3 layers)',
    desc: 'Compare proxy.ts guard vs layout.tsx guard vs page-level guard.',
  },
  {
    num: '03',
    slug: '03-rbac',
    title: 'Role-based access control',
    desc: 'Hide UI by role and prove client-only hiding is insecure with a server check.',
  },
  {
    num: '04',
    slug: '04-dal',
    title: 'Data Access Layer pattern',
    desc: 'Wrap getSession in React cache(); return safe DTOs; centralise authorization.',
  },
]

export default function AuthRbacIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Auth & RBAC Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        4 exercises on session, route guards, role checks, and the DAL pattern
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/auth-rbac/${ex.slug}`}
            className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-mono text-gray-400">{ex.num}</span>
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{ex.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
