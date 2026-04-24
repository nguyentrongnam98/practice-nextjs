const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function FreshSection() {
  await sleep(1500)
  const res = await fetch('https://dummyjson.com/products/2')
  const product = await res.json()

  return (
    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-orange-900">Fresh (uncached)</h3>
        <span className="text-xs text-orange-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm">{product.title} — ${product.price}</p>
      <p className="mt-2 rounded bg-orange-100 p-1 text-xs text-orange-700">
        No &apos;use cache&apos;. Fetches every request. Streamed via Suspense. Timestamp changes every refresh.
      </p>
    </div>
  )
}
