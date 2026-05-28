export default function OriginalPage() {
  return (
    <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
      ✓ This is <code>/original</code>. If you arrived via <code>/rewrite</code>, the URL bar still says
      <code> /rewrite</code> — that&apos;s a Proxy rewrite in action.
    </div>
  )
}
