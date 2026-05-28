import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { ContactForm } from './_components/ContactForm'

export default function ActionStateExercise() {
  return (
    <ExerciseLayout
      number="01"
      title="useActionState basics"
      concept="useActionState wraps a Server Action and returns [state, formAction, pending]. The action receives (prevState, formData) and returns the next state. The form's action prop is bound to formAction, not the original action."
      questions={[
        'Why does useActionState change the Server Action signature to (prevState, formData)?',
        'What is the difference between the action you pass in and the formAction you receive back?',
        'Where does the pending flag come from — is it tracking the network request or React state?',
        'How would you reset the form state after a successful submit?',
        'Can useActionState be used outside a <form> element?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Submit the form with an empty field to see the error state. Submit with values to see the success
        state. Watch the button label flip to "Sending…" during the 700ms server delay.
      </p>
      <ContactForm />
    </ExerciseLayout>
  )
}
