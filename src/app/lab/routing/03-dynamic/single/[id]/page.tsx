type Params = Promise<{ id: string }>

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '42' }]
}

export default async function SingleSegment({ params }: { params: Params }) {
  const { id } = await params
  const wasPrerendered = ['1', '2', '42'].includes(id)
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Segment value:</strong> <code>{id}</code>
      </p>
      <p className="text-sm text-gray-600">
        {wasPrerendered
          ? '✓ This id was in generateStaticParams — prerendered at build.'
          : '⚠ This id was NOT in generateStaticParams — rendered on demand.'}
      </p>
    </div>
  )
}
