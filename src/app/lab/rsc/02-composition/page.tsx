import { ExerciseLayout } from '../_components/ExerciseLayout'
import { UserCard } from './_components/UserCard'
import { TodoList } from './_components/TodoList'

async function getUser() {
  const res = await fetch('https://dummyjson.com/users/1')
  const data = await res.json()
  return {
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    bio: `${data.company.title} at ${data.company.name}. Lives in ${data.address.city}, ${data.address.state}.`,
    joinedAt: data.birthDate,
  }
}

async function getTodos() {
  const res = await fetch('https://dummyjson.com/todos?limit=10')
  const data = await res.json()
  return data.todos as { id: number; todo: string; completed: boolean }[]
}

export default async function CompositionExercise() {
  const [user, todos] = await Promise.all([getUser(), getTodos()])

  return (
    <ExerciseLayout
      number="02"
      title="Server wraps Client"
      concept="A Server Component can fetch data asynchronously (using await) and pass the result to a Client Component as props. The client never sees the fetch — it just receives the data. This eliminates loading states, useEffect chains, and client-side fetch waterfalls."
      questions={[
        'Why not fetch data inside the Client Component?',
        'What are the benefits of fetching data on the server?',
        'How do you pass server data to a Client Component?',
      ]}
    >
      <div className="space-y-4">
        <UserCard user={user} />
        <TodoList todos={todos} />
        <div className="rounded bg-yellow-50 p-3 text-xs text-yellow-800">
          Open <strong>Network tab</strong> in DevTools → refresh page →
          you will NOT see any request to <code>dummyjson.com</code>.
          The fetch happened on the server before HTML was sent to your browser.
        </div>
      </div>
    </ExerciseLayout>
  )
}
