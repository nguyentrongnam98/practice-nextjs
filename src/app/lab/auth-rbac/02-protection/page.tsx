import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { getSession } from '../_dal/session'

export default async function ProtectionIntro() {
  const session = await getSession()

  return (
    <ExerciseLayout
      number="02"
      title="Route protection (3 layers)"
      concept="Three places to enforce auth: proxy.ts (fast, limited API), layout.tsx (renders once per layout, can use DAL), and page-level guards. Per the Next.js Data Security guide, the page/layout/DAL is the real security boundary — proxy is an optimistic shortcut."
      questions={[
        'Why does the Next.js team recommend NOT relying on proxy alone for authorization?',
        'What runs more often: layout.tsx or page.tsx?',
        'How does cache() in the DAL help when the layout and the page both call getSession()?',
        'What happens to in-flight Server Actions if you redirect from a layout?',
        'When would you choose a layout guard vs a page guard for the same protected segment?',
      ]}
    >
      <p className="mb-3 text-sm text-gray-600">
        Current session state: <strong>{session ? `signed in as ${session.user.role}` : 'no session'}</strong>.
        {!session && (
          <>
            {' '}
            <Link href="/lab/auth-rbac/01-session" className="text-blue-600 hover:underline">
              Start a session first
            </Link>
            .
          </>
        )}
      </p>

      <ol className="space-y-3 text-sm">
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">1. Layout-guarded</h3>
          <p className="mt-1 text-xs text-gray-600">
            The layout calls <code>requireUser()</code>. The check protects the page and any future
            sibling routes that share the layout.
          </p>
          <Link
            href="/lab/auth-rbac/02-protection/layout-guarded"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Visit layout-guarded →
          </Link>
        </li>
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">2. Page-guarded</h3>
          <p className="mt-1 text-xs text-gray-600">
            The page itself calls <code>requireUser()</code>. Easy and explicit, but you must remember to
            do this on every protected page.
          </p>
          <Link
            href="/lab/auth-rbac/02-protection/page-guarded"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Visit page-guarded →
          </Link>
        </li>
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">3. Proxy-guarded (not wired here)</h3>
          <p className="mt-1 text-xs text-gray-600">
            Documented for completeness. Would live in <code>src/proxy.ts</code> with{' '}
            <code>matcher</code> covering the route. The existing project proxy demonstrates this for{' '}
            <code>/dashboard</code> already.
          </p>
        </li>
      </ol>
    </ExerciseLayout>
  )
}
