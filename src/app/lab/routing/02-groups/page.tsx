import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function GroupsIntro() {
  return (
    <ExerciseLayout
      number="02"
      title="Route Groups with separate layouts"
      concept="A folder named (name) is a route group — it does not appear in the URL. Each group can have its own layout.tsx, so siblings under the same parent can have completely different chrome."
      questions={[
        'Do route groups affect URL structure?',
        'When would you use a route group instead of a regular folder?',
        'Can two route groups at the same level both contain a page.tsx with the same name?',
        'What happens to the global root layout when a group has its own layout?',
        'How do route groups interact with parallel routes?',
      ]}
    >
      <p className="mb-3 text-sm text-gray-600">
        Three pages, three layouts, no extra URL segments. Open each and notice the layout change.
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/narrow">
            /lab/routing/02-groups/narrow
          </Link>{' '}
          → narrow column from `(narrow)` group
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/wide">
            /lab/routing/02-groups/wide
          </Link>{' '}
          → full-width from `(wide)` group
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/focused">
            /lab/routing/02-groups/focused
          </Link>{' '}
          → no chrome from `(focused)` group
        </li>
      </ul>
    </ExerciseLayout>
  )
}
