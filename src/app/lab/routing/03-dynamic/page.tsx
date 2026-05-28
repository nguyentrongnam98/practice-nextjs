import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function DynamicIntro() {
  return (
    <ExerciseLayout
      number="03"
      title="Dynamic & catch-all segments"
      concept="Square brackets in folder names declare dynamic params. [id] is single; [...slug] is required catch-all; [[...slug]] is optional catch-all (also matches the parent URL). Combine with generateStaticParams to prerender."
      questions={[
        'What is the difference between [...slug] and [[...slug]]?',
        'When does Next.js generate static pages from generateStaticParams?',
        'Can you have multiple dynamic segments in one path like /[category]/[id]?',
        'What does params look like for a 3-segment catch-all match?',
        'What happens if the user visits a param value not returned by generateStaticParams?',
      ]}
    >
      <ul className="space-y-2 text-sm">
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/single/42">
            /lab/routing/03-dynamic/single/42
          </Link>{' '}
          — single segment
        </li>
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="/lab/routing/03-dynamic/tag/nextjs/server-components/streaming"
          >
            /lab/routing/03-dynamic/tag/nextjs/server-components/streaming
          </Link>{' '}
          — catch-all (3 segments)
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/docs">
            /lab/routing/03-dynamic/docs
          </Link>{' '}
          — optional catch-all (zero segments)
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/docs/api/cache">
            /lab/routing/03-dynamic/docs/api/cache
          </Link>{' '}
          — optional catch-all (2 segments)
        </li>
      </ul>
    </ExerciseLayout>
  )
}
