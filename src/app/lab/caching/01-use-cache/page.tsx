import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { cacheLife } from 'next/cache'
import { ProductList } from './_components/ProductList'
import { CachedProducts } from './_components/CachedProducts'

async function getProducts() {
  'use cache'
  cacheLife('minutes')
  const res = await fetch('https://dummyjson.com/products?limit=3')
  const { products } = await res.json()
  return {
    products: products.map((p: { id: number; title: string; price: number; category: string }) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
    })),
    cachedAt: new Date().toISOString(),
  }
}

export default async function UseCacheExercise() {
  const { products, cachedAt } = await getProducts()

  return (
    <ExerciseLayout
      number="01"
      title="'use cache' directive"
      concept="The 'use cache' directive marks a function or component as cacheable. Data-level: cache a function's return value. UI-level: cache an entire component's rendered output. fetch() is NOT cached by default in Next.js 16 — you must opt in with 'use cache'."
      questions={[
        "What does the 'use cache' directive do?",
        "What's the difference between data-level and UI-level caching?",
        'Are fetch requests cached by default in Next.js 16?',
      ]}
    >
      <div className="space-y-4">
        <ProductList products={products} cachedAt={cachedAt} label="Data-level cache" />
        <CachedProducts />
      </div>
    </ExerciseLayout>
  )
}
