import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { ProxyDemo } from './_components/ProxyDemo'

type SearchParams = Promise<{ reason?: string }>

export default async function ProxyIntro({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reason } = await searchParams
  return (
    <ExerciseLayout
      number="05"
      title="Proxy (formerly Middleware)"
      concept="Next.js 16 renamed Middleware to Proxy. The file is proxy.ts at project root or src/. The exported proxy function runs before the response and can rewrite, redirect, or inject headers. matcher in config scopes which paths trigger it."
      questions={[
        'What is the difference between rewrite and redirect?',
        'Why was Middleware renamed to Proxy in Next.js 16? Did the API change?',
        'How does the matcher config affect performance?',
        'Can you read or write cookies from inside proxy.ts?',
        'Why is proxy.ts not a good place for full session/authorization logic?',
      ]}
    >
      {reason === 'login-required' && (
        <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          ⚠ You were redirected here because the protected page needs the <code>lab-auth=1</code> cookie.
        </div>
      )}
      <ProxyDemo />
    </ExerciseLayout>
  )
}
