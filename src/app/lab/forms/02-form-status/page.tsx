import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { SubscribeForm } from './_components/SubscribeForm'

export default function FormStatusExercise() {
  return (
    <ExerciseLayout
      number="02"
      title="useFormStatus for pending UI"
      concept="useFormStatus is a hook from react-dom that reads the submission state of the parent <form>. Unlike useActionState, it works from inside any child Client Component without prop drilling, but it requires being nested inside a <form>."
      questions={[
        'Where must useFormStatus be called for it to return real values?',
        'Why is useFormStatus from react-dom, not react?',
        'When would you choose useFormStatus over useActionState pending?',
        'What other keys are on the useFormStatus return value in React 19?',
        'Can two components in the same form both call useFormStatus?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        The form takes 1.5s to &ldquo;subscribe&rdquo;. Note: the form itself is a Server Component — only the submit
        button is a Client Component. Open the server terminal to see the logged email.
      </p>
      <SubscribeForm />
    </ExerciseLayout>
  )
}
