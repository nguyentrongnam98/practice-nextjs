import Link from 'next/link'

interface ExerciseLayoutProps {
  number: string
  title: string
  concept: string
  questions: string[]
  children: React.ReactNode
}

export function ExerciseLayout({
  number,
  title,
  concept,
  questions,
  children,
}: ExerciseLayoutProps) {
  return (
    <div className="space-y-6">
      <Link href="/lab/rsc" className="text-sm text-blue-600 hover:underline">
        ← Back to exercises
      </Link>

      <h1 className="text-2xl font-bold">
        Exercise {number}: {title}
      </h1>

      <div className="rounded-lg bg-gray-100 p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase">Concept</h2>
        <p className="mt-1 text-sm text-gray-700">{concept}</p>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase">Live Demo</h2>
        <div className="mt-3">{children}</div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h2 className="text-xs font-semibold text-blue-700 uppercase">
          Interview Questions
        </h2>
        <ul className="mt-2 space-y-1">
          {questions.map((q, i) => (
            <li key={i} className="text-sm text-blue-900">
              • {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
