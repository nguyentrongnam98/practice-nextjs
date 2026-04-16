import 'server-only'

export function SecretDisplay() {
  const secret = process.env.SECRET_KEY ?? 'default-secret-123'
  const masked = '****' + secret.slice(-3)

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
          SERVER ONLY
        </span>
      </div>
      <p className="mt-3 text-sm">
        Secret value: <code className="rounded bg-green-100 px-2 py-0.5 font-mono">{masked}</code>
      </p>
      <p className="mt-2 text-xs text-green-600">
        This component imports <code>server-only</code>. If you try to import it into a
        Client Component, the build will fail with a clear error.
      </p>
    </div>
  )
}
