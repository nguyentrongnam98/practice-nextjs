'use client'

interface Product {
  id: number
  title: string
  price: number
  category: string
}

interface ProductListProps {
  products: Product[]
  cachedAt: string
  label: string
}

export function ProductList({ products, cachedAt, label }: ProductListProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.title}</span>
            <span className="text-gray-500">${p.price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-green-600">
        Refresh the page — if timestamp stays the same, data is served from cache.
      </p>
    </div>
  )
}
