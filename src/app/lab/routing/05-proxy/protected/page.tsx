export default function ProtectedPage() {
  return (
    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
      ✓ Welcome to the protected page. The proxy let you through because the <code>lab-auth=1</code> cookie
      is set.
    </div>
  )
}
