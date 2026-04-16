import { ExerciseLayout } from '../_components/ExerciseLayout'
import { ServerInfo } from './_components/ServerInfo'
import { ClientInfo } from './_components/ClientInfo'

export default function BoundaryExercise() {
  return (
    <ExerciseLayout
      number="01"
      title="'use client' boundary"
      concept="By default, every component in the App Router is a Server Component. Adding 'use client' at the top of a file marks it — and everything it imports — as a Client Component. The boundary is at the file level, not the component level."
      questions={[
        "What happens when you add 'use client' to a file?",
        'Can a Client Component import a Server Component?',
        'What is the default rendering mode in Next.js App Router?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Open your <strong>terminal</strong> AND <strong>browser DevTools console</strong> to
        see where each component logs.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServerInfo />
        <ClientInfo />
      </div>
    </ExerciseLayout>
  )
}
