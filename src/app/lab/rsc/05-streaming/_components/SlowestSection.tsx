import { connection } from 'next/server'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function SlowestSection() {
  await connection()
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const start = Date.now()
  await sleep(3000)
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const elapsed = Date.now() - start

  console.log(`🐌 SlowestSection resolved in ${elapsed}ms`)

  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-red-900">Slow Section</h3>
        <span className="text-xs text-red-600">~3000ms</span>
      </div>
      <p className="mt-2 text-sm text-red-700">
        Loaded in {elapsed}ms. I appeared last.
      </p>
    </div>
  )
}
