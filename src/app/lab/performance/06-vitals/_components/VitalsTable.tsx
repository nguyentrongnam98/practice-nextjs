'use client'

import { useVitals, type VitalMetric } from './VitalsReporter'

const RATING_COLOR: Record<VitalMetric['rating'], string> = {
  good: 'text-green-700 bg-green-50',
  'needs-improvement': 'text-amber-700 bg-amber-50',
  poor: 'text-red-700 bg-red-50',
}

export function VitalsTable() {
  const metrics = useVitals()
  if (metrics.length === 0) {
    return <p className="text-sm text-gray-500 italic">Waiting for vitals to be reported…</p>
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs text-gray-500">
          <th className="py-1">Name</th>
          <th>Value</th>
          <th>Rating</th>
          <th>Nav</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((m) => (
          <tr key={m.id} className="border-b last:border-0">
            <td className="py-1 font-mono">{m.name}</td>
            <td>{m.value.toFixed(2)} ms</td>
            <td>
              <span className={`rounded px-2 py-0.5 text-xs ${RATING_COLOR[m.rating]}`}>{m.rating}</span>
            </td>
            <td className="text-xs text-gray-500">{m.navigationType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
