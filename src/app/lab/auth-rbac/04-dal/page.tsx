import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { ProfileCard } from './_components/ProfileCard'

export default function DalExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Data Access Layer pattern"
      concept="A DAL is a 'server-only' module that owns all data reads and writes. It calls the DB, runs authorization, and returns DTOs — minimal safe shapes. Wrapping with React cache() shares the result across all callers in one request, eliminating the temptation to thread the session through props."
      questions={[
        'Why does a DTO exist instead of returning the raw row?',
        'What does React cache() actually do — memoize per request or globally?',
        'Why does Next.js docs recommend NOT mixing DAL and direct fetch in the same project?',
        'How does the import "server-only" help here, and what error appears if it leaks to a Client Component?',
        'How would you test a DAL function?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        The card below is rendered by a Server Component that calls{' '}
        <code>getProfileDTO()</code> from the DAL. Sign in as <code>admin</code> to see the secret;
        sign in as <code>user</code> to see it redacted.
      </p>
      <ProfileCard />
    </ExerciseLayout>
  )
}
