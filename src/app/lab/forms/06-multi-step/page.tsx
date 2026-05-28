import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { getStateForRender } from './_actions'
import { Wizard } from './_components/Wizard'

type SearchParams = Promise<{ step?: string }>

export default async function MultiStepExercise({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { step = '1' } = await searchParams
  const state = await getStateForRender()

  return (
    <ExerciseLayout
      number="06"
      title="Multi-step (wizard) form"
      concept="Partial state persists in an httpOnly cookie keyed to this exercise. Current step lives in the URL search param so it is bookmarkable. Each step validates only its own fields; the final submit re-validates the merged shape and clears the cookie."
      questions={[
        'Why use a cookie instead of useState to persist wizard state?',
        'What goes wrong if you put all 3 steps in one Zod schema and validate on each step?',
        'How would you handle a user who closes the tab on step 2?',
        'How does redirect() work inside a Server Action — does the rest of the action run?',
        'When would server-driven multi-step beat a client-side React state machine?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Fill step 1 → 2 → 3 → submit. Try refreshing mid-way: state survives. Submit empty values to see
        per-step validation. The final URL <code>?step=done</code> shows success.
      </p>
      <Wizard step={step} state={state} />
    </ExerciseLayout>
  )
}
