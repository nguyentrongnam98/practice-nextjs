type Params = Promise<{ path?: string[] }>

export default async function OptionalCatchAll({ params }: { params: Params }) {
  const { path } = await params
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Path segments:</strong> {path ? `[${path.join(', ')}]` : '(none)'}
      </p>
      <p className="text-sm text-gray-600">
        {!path && 'Zero segments → renders parent URL /docs.'}
        {path && `Captured ${path.length} segments.`}
      </p>
    </div>
  )
}
