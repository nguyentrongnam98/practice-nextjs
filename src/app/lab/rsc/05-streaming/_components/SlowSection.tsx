import { connection } from 'next/server'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function SlowSection() {
  await connection()
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const start = Date.now()
  await sleep(500)
  // eslint-disable-next-line react-hooks/purity -- intentional: measuring streaming timing for demo
  const elapsed = Date.now() - start

  console.log(`⚡ SlowSection resolved in ${elapsed}ms`)

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-900">Fast Section</h3>
        <span className="text-xs text-green-600">~500ms</span>
      </div>
      <p className="mt-2 text-sm text-green-700">
        Loaded in {elapsed}ms. I appeared first!
      </p>
    </div>
  )
}
