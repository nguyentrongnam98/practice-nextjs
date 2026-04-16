import { ExerciseLayout } from '../_components/ExerciseLayout'
import { WindowSize } from './_components/WindowSize'

export default function ThirdPartyExercise() {
  return (
    <ExerciseLayout
      number="07"
      title="Wrap client-only libraries"
      concept="Libraries that use window, document, or other browser APIs must be wrapped in a 'use client' component. Use useEffect to defer browser API calls (they don't run during SSR). Handle the null initial state to avoid hydration mismatches."
      questions={[
        'How do you use a client-only library in a Server Component page?',
        'What is a hydration mismatch and how do you avoid it?',
        'Why do we check for null before rendering window data?',
      ]}
    >
      <div className="space-y-4">
        <WindowSize />

        <div className="rounded bg-gray-50 p-4 text-sm">
          <p className="font-semibold">The pattern:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-gray-700">
            <li>
              Mark file with <code className="bg-gray-200 px-1 rounded">&#39;use client&#39;</code>
            </li>
            <li>
              Use <code className="bg-gray-200 px-1 rounded">useState(null)</code> for initial state
            </li>
            <li>
              Call browser API inside <code className="bg-gray-200 px-1 rounded">useEffect</code> (not during SSR)
            </li>
            <li>
              Render loading placeholder when state is <code className="bg-gray-200 px-1 rounded">null</code>
            </li>
          </ol>

          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
            <p className="font-semibold text-red-700">Without useEffect (hydration mismatch):</p>
            <pre className="mt-1 text-xs text-red-600">
{`// ❌ DON'T do this:
const width = window.innerWidth  // crashes on server!

// ❌ Also bad:
const [w] = useState(window.innerWidth)  // different on server vs client`}
            </pre>
          </div>
        </div>
      </div>
    </ExerciseLayout>
  )
}
