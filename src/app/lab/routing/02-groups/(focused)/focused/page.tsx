export default function FocusedPage() {
  return (
    <div className="text-sm">
      <h3 className="text-base font-semibold">Focused mode</h3>
      <p className="mt-2 text-gray-600">
        The <code>(focused)</code> layout strips out the back link / coloured banner and shows just a
        white card. Useful for &ldquo;wizard&rdquo; or &ldquo;blocking&rdquo; UIs sharing the same URL parent as the chromed
        siblings.
      </p>
    </div>
  )
}
