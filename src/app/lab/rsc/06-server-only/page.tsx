import { ExerciseLayout } from '../_components/ExerciseLayout'
import { SecretDisplay } from './_components/SecretDisplay'
import { BrowserOnly } from './_components/BrowserOnly'

export default function ServerOnlyExercise() {
  return (
    <ExerciseLayout
      number="06"
      title="Guard imports (server-only / client-only)"
      concept="The 'server-only' package causes a build error if the importing file ends up in the client bundle. Use it to protect server secrets, database queries, and API keys. The 'client-only' package does the reverse — it ensures code that uses browser APIs never runs on the server."
      questions={[
        "What does import 'server-only' do?",
        "When would you use 'client-only'?",
        'How do you prevent accidentally leaking server secrets to the client bundle?',
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SecretDisplay />
        <BrowserOnly />
      </div>

      <div className="mt-4 rounded bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="font-semibold">Try it yourself:</p>
        <p className="mt-1">
          Create a new Client Component that imports <code>SecretDisplay</code>.
          The build will fail with: <code>server-only module cannot be imported from a Client Component</code>.
        </p>
      </div>
    </ExerciseLayout>
  )
}
