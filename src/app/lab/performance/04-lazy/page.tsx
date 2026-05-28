import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { DynamicChart } from './_components/DynamicChart'
import { IntersectionLoader } from './_components/IntersectionLoader'

export default function LazyExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Lazy loading Client Components"
      concept="next/dynamic defers a Client Component to a separate JS chunk. Pair with ssr: false when the component needs window or document. Use an IntersectionObserver to delay the load further — only mount when the element scrolls near the viewport."
      questions={[
        'When is ssr: false strictly required, and when is it just an optimisation?',
        'What does the loading prop on next/dynamic render before the chunk arrives?',
        'How is next/dynamic different from a regular ES dynamic import()?',
        'Why is ssr: false illegal inside a Server Component file?',
        'When would you combine IntersectionObserver lazy mount with next/dynamic?',
      ]}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">next/dynamic with ssr:false</h3>
        <DynamicChart />
        <p className="text-xs text-gray-500">
          Mounts only after hydration — no server HTML. Look in DevTools Sources for a separate chunk.
        </p>
      </section>

      <div className="my-8 h-[400px] rounded-md bg-gray-100 p-3 text-xs text-gray-500">
        ← Spacer to scroll past. Scroll down to trigger the IntersectionObserver…
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">IntersectionObserver-deferred mount</h3>
        <IntersectionLoader>
          <DynamicChart />
        </IntersectionLoader>
      </section>
    </ExerciseLayout>
  )
}
