const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

console.log('📊 ExpensiveData rendered on SERVER')

export async function ExpensiveData() {
  await sleep(1000)

  const data = [
    { id: 1, product: 'Widget A', revenue: 12400, units: 340 },
    { id: 2, product: 'Widget B', revenue: 8900, units: 210 },
    { id: 3, product: 'Widget C', revenue: 23100, units: 560 },
    { id: 4, product: 'Gadget X', revenue: 45200, units: 890 },
  ]

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
          SERVER
        </span>
        <span className="text-xs text-gray-500">
          This table was rendered on the server (check terminal for log)
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2">Product</th>
            <th className="pb-2">Revenue</th>
            <th className="pb-2">Units</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="py-2">{row.product}</td>
              <td className="py-2">${row.revenue.toLocaleString()}</td>
              <td className="py-2">{row.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
