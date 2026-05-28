import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { HandlersDemo } from './_components/HandlersDemo'

export default function HandlersExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Route Handlers (API)"
      concept="A route.ts file exports HTTP-method functions (GET, POST, …) and returns a Response. Dynamic params come from the ctx.params Promise. Cannot coexist with page.tsx in the same segment."
      questions={[
        'Why does Next.js disallow route.ts and page.ts in the same folder?',
        'How do you make a Route Handler cacheable in the new Cache Components model?',
        'What is the difference between Request and NextRequest?',
        'How do you stream a response from a Route Handler?',
        'Why are params returned as a Promise in Next.js 16?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Click each button to call the corresponding Route Handler. Watch the output panel. The streaming
        endpoint updates the panel line-by-line as chunks arrive (~500 ms apart).
      </p>
      <HandlersDemo />
    </ExerciseLayout>
  )
}
