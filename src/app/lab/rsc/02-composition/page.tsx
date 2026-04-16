import { ExerciseLayout } from '../_components/ExerciseLayout'
import { UserCard } from './_components/UserCard'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function getUser() {
  await sleep(500)
  return {
    name: 'Hùng Lê',
    email: 'hung@example.com',
    bio: 'Full-stack developer with 5 years of experience in React and Node.js. Passionate about building great user experiences and scalable backend systems. Currently exploring Next.js App Router and Server Components.',
    joinedAt: '2024-01-15',
  }
}

export default async function CompositionExercise() {
  const user = await getUser()

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
      <UserCard user={user} />
    </ExerciseLayout>
  )
}
