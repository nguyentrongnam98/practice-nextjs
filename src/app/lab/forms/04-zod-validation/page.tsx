import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { SignupForm } from './_components/SignupForm'

export default function ZodValidationExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Server-side Zod validation"
      concept="Zod's safeParse returns a discriminated result. On failure, error.flatten().fieldErrors gives a per-field map of error messages. Combined with useActionState, you can return these errors and render them next to each input — all server-validated."
      questions={[
        'Why validate on the server even when the form is also validated on the client?',
        'What does error.flatten() do compared to error.format()?',
        'How do you make a "passwords match" check in Zod (a cross-field rule)?',
        'Why use z.coerce.number() instead of z.number() for FormData input?',
        'How would you internationalize Zod error messages?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Try invalid inputs: short password, mismatched confirm, age &lt; 18, missing @ in email. Each
        field shows its own error. Successful signup replaces the form with a confirmation.
      </p>
      <SignupForm />
    </ExerciseLayout>
  )
}
