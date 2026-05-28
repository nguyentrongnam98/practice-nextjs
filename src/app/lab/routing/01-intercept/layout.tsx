import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function InterceptLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <ExerciseLayout
      number="01"
      title="Intercepting routes (modal pattern)"
      concept="The (.) marker before a route segment intercepts a navigation from the same level. Combined with a parallel @modal slot, a click-through opens an overlay while preserving the underlying page. A direct URL or refresh skips the intercept and renders the full page."
      questions={[
        'What is the difference between (.), (..), and (...) interceptors?',
        'Why does an intercepting route need a parallel slot to render the overlay?',
        'What happens to the modal when the user hits browser back?',
        'How does Next.js decide whether to use the intercepted route or the full page?',
        'Where do you put a default.tsx for an unmatched parallel slot, and why?',
      ]}
    >
      {children}
      {modal}
    </ExerciseLayout>
  )
}
