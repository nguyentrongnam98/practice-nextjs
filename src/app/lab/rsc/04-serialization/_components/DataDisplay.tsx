'use client'

interface DataDisplayProps {
  stringVal: string
  numberVal: number
  boolVal: boolean
  dateVal: string
  objVal: Record<string, unknown>
  arrayVal: number[]
  jsxVal: React.ReactNode
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-bold ${
        ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {ok ? 'PASS' : 'FAIL'}
    </span>
  )
}

export function DataDisplay({
  stringVal,
  numberVal,
  boolVal,
  dateVal,
  objVal,
  arrayVal,
  jsxVal,
}: DataDisplayProps) {
  const rows = [
    { name: 'string', value: stringVal, type: typeof stringVal, ok: typeof stringVal === 'string' },
    { name: 'number', value: String(numberVal), type: typeof numberVal, ok: typeof numberVal === 'number' },
    { name: 'boolean', value: String(boolVal), type: typeof boolVal, ok: typeof boolVal === 'boolean' },
    {
      name: 'Date (as string)',
      value: dateVal,
      type: typeof dateVal,
      ok: typeof dateVal === 'string',
      note: 'Date is serialized to ISO string — not a Date instance!',
    },
    { name: 'object', value: JSON.stringify(objVal), type: typeof objVal, ok: typeof objVal === 'object' },
    { name: 'array', value: JSON.stringify(arrayVal), type: typeof arrayVal, ok: Array.isArray(arrayVal) },
  ]

  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2">Prop</th>
            <th className="pb-2">Received typeof</th>
            <th className="pb-2">Value</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b last:border-0">
              <td className="py-2 font-mono text-xs">{row.name}</td>
              <td className="py-2 font-mono text-xs">{row.type}</td>
              <td className="py-2 font-mono text-xs max-w-xs truncate">{row.value}</td>
              <td className="py-2">
                <StatusBadge ok={row.ok} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.filter((r) => r.note).map((r) => (
        <p key={r.name} className="rounded bg-yellow-50 p-2 text-xs text-yellow-800">
          ⚠️ <strong>{r.name}:</strong> {r.note}
        </p>
      ))}

      <div className="rounded border p-3">
        <p className="text-xs text-gray-500 mb-2">JSX (React.ReactNode) — renders correctly:</p>
        <div>{jsxVal}</div>
      </div>
    </div>
  )
}
