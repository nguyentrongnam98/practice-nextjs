import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { Button } from '@/shared/components/ui'
import { getSession } from '../_dal/session'
import { endSession } from './_actions'
import { SessionPanel } from './_components/SessionPanel'

export default async function SessionExercise() {
  const session = await getSession()

  return (
    <ExerciseLayout
      number="01"
      title="Session management"
      concept="A session lives in an httpOnly, sameSite, secure-in-production cookie. The body is opaque to the client (signed JWT or random id resolved server-side). The lab uses JSON encoding for simplicity, but real apps MUST sign or encrypt to prevent tampering."
      questions={[
        'Why does the session cookie have to be httpOnly?',
        'What is the difference between sameSite=lax and sameSite=strict?',
        'Why must session integrity be verified server-side, not by trusting the cookie body?',
        'When would you use a session store (DB / Redis) vs a self-contained JWT?',
        'Where should you put the secure flag, and how does it interact with localhost dev?',
      ]}
    >
      <SessionPanel active={!!session} />

      {session && (
        <section className="mt-6 space-y-3">
          <div className="rounded-md border bg-gray-50 p-3 text-sm">
            <p>
              <strong>User:</strong> {session.user.name} ({session.user.email})
            </p>
            <p>
              <strong>Role:</strong> {session.user.role}
            </p>
            <p>
              <strong>Issued at:</strong> {session.issuedAt}
            </p>
          </div>
          <form action={endSession}>
            <Button type="submit">Sign out</Button>
          </form>
        </section>
      )}

      <p className="mt-6 rounded-md bg-yellow-50 p-3 text-xs text-yellow-800">
        <strong>Security note:</strong> This demo stores the session as JSON. A real app would sign
        the cookie (HMAC) or encrypt it (JWE) so a client can&apos;t forge the role field. The session
        is also path-scoped to <code>/lab/auth-rbac</code> so it doesn&apos;t leak to other routes.
      </p>
    </ExerciseLayout>
  )
}
