import { ExerciseLayout } from '../_components/ExerciseLayout'
import { InteractiveWrapper } from './_components/InteractiveWrapper'
import { ExpensiveData } from './_components/ExpensiveData'

export default function ChildrenExercise() {
  return (
    <ExerciseLayout
      number="03"
      title="Children (donut) pattern"
      concept="A Client Component can receive Server Components as children. The key: the Server Component is passed as JSX from a Server parent — not imported directly inside the Client Component. This keeps the Server Component on the server even though its wrapper is a Client Component."
      questions={[
        'How can a Server Component be a child of a Client Component?',
        "What's the \"donut\" pattern and why is it useful?",
        'What happens if you import a Server Component directly inside a Client Component?',
      ]}
    >
      <div className="space-y-4">
        <InteractiveWrapper title="Toggle Server Data (click to expand)">
          <ExpensiveData />
        </InteractiveWrapper>

        <div className="rounded bg-gray-50 p-4 text-sm">
          <p className="font-semibold text-green-700">✅ Children pattern (what we do above):</p>
          <p className="mt-1 font-mono text-xs text-gray-600">
            Page (Server) → InteractiveWrapper (Client) → children = ExpensiveData (Server!)
          </p>
          <p className="mt-3 font-semibold text-red-700">❌ Direct import (what NOT to do):</p>
          <p className="mt-1 font-mono text-xs text-gray-600">
            InteractiveWrapper (Client) → import ExpensiveData → ExpensiveData becomes Client!
          </p>
        </div>
      </div>
    </ExerciseLayout>
  )
}
