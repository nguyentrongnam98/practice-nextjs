import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { listMessages } from './_store'
import { MessageBoard } from './_components/MessageBoard'

export default function OptimisticExercise() {
  const messages = listMessages()
  return (
    <ExerciseLayout
      number="03"
      title="Optimistic updates with useOptimistic"
      concept="useOptimistic lets you render a temporary state immediately while a Server Action is in flight. When the action settles and the parent re-renders, React reconciles the optimistic state with the actual server state."
      questions={[
        'Why does useOptimistic only show its value during a transition?',
        'What happens to optimistic state if the Server Action throws an error?',
        'How do you distinguish optimistic items from real items in the UI?',
        'Why must useOptimistic be called from a Client Component?',
        'Could you achieve the same effect with useState? What would you lose?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Send a message — it appears <em>instantly</em> in yellow (&ldquo;sending…&rdquo;) even though the server takes
        1.5s. When the action completes and the page revalidates, it turns white (confirmed).
      </p>
      <MessageBoard messages={messages} />
    </ExerciseLayout>
  )
}
