type Params = Promise<{ slug: string[] }>

export default async function CatchAll({ params }: { params: Params }) {
  const { slug } = await params
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Segments captured:</strong>
      </p>
      <ol className="ml-6 list-decimal text-sm">
        {slug.map((s, i) => (
          <li key={i}>
            <code>{s}</code>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-gray-500">
        Try removing trailing segments from the URL — note: <code>/tag</code> alone will 404 because
        catch-all requires at least one segment.
      </p>
    </div>
  )
}
