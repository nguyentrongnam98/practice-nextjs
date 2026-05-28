'use client'

// Pseudo-heavy: a long word list and helpers that simulate a large dependency.
const HEAVY = Array.from({ length: 200 }, (_, i) => `item-${i}-${'x'.repeat(20)}`)

function compute() {
  return HEAVY.map((v) => v.length).reduce((a, b) => a + b, 0)
}

export default function HeavyChart() {
  return (
    <div className="rounded-md border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      ✓ Heavy module loaded. Computed sum of lengths: <strong>{compute()}</strong>
      <p className="mt-1 text-xs text-amber-700">
        In a real app, this would be a charting library or PDF renderer ~hundreds of KB. Bundled in a
        separate chunk thanks to the dynamic import on the parent page.
      </p>
    </div>
  )
}
