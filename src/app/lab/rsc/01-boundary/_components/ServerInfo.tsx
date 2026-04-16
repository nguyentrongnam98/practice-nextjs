console.log('🖥️ ServerInfo rendered on SERVER at', new Date().toISOString())

export function ServerInfo() {
  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
          SERVER
        </span>
        <h3 className="font-semibold text-green-900">I am a Server Component</h3>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-green-700">process.env.NODE_ENV:</dt>
          <dd className="font-mono">{process.env.NODE_ENV}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-green-700">typeof window:</dt>
          <dd className="font-mono">{typeof window}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-green-600">
        Check your <strong>terminal</strong> console for the log message.
      </p>
    </div>
  )
}
