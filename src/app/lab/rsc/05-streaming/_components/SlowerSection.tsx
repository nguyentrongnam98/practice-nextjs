import { connection } from 'next/server'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function SlowerSection() {
  await connection()
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const start = Date.now()
  await sleep(1500)
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const elapsed = Date.now() - start

  console.log(`🐢 SlowerSection resolved in ${elapsed}ms`)

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900">Medium Section</h3>
        <span className="text-xs text-amber-600">~1500ms</span>
      </div>
      <p className="mt-2 text-sm text-amber-700">
        Loaded in {elapsed}ms. I appeared second.
      </p>
    </div>
  )
}
