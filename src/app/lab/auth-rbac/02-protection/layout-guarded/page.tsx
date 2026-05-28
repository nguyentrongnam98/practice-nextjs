import { getSession } from '../../_dal/session'

export default async function LayoutGuardedPage() {
  const session = await getSession()
  return (
    <div className="text-sm">
      <p>
        ✓ You see this only because the layout guard let you in. Hello,{' '}
        <strong>{session!.user.name}</strong>.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Note: the layout already called <code>getSession()</code>; this page calls it again. Thanks to{' '}
        <code>cache()</code>, both calls share the same result within this request.
      </p>
    </div>
  )
}
