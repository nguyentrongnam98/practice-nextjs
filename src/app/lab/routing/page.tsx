import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-intercept',
    title: 'Intercepting routes (modal pattern)',
    desc: 'Soft-navigation opens a modal; direct URL shows a full page. Uses (.) interceptor + @modal parallel slot.',
  },
  {
    num: '02',
    slug: '02-groups',
    title: 'Route Groups with separate layouts',
    desc: 'Three (group) folders, three different layouts, all sharing the same parent URL prefix.',
  },
  {
    num: '03',
    slug: '03-dynamic',
    title: 'Dynamic & catch-all segments',
    desc: '[id], [...slug], [[...path]] — plus generateStaticParams for prerender.',
  },
  {
    num: '04',
    slug: '04-handlers',
    title: 'Route Handlers (API)',
    desc: 'GET JSON, POST echo, dynamic param, and a streaming ReadableStream response.',
  },
  {
    num: '05',
    slug: '05-proxy',
    title: 'Proxy (formerly Middleware)',
    desc: 'Header injection, rewrite, and cookie-based redirect — using the Next.js 16 proxy.ts file.',
  },
]

export default function RoutingLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Routing Lab</h1>
      <p className="mt-1 text-sm text-gray-500">5 exercises on advanced App Router patterns</p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/routing/${ex.slug}`}
            className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-mono text-gray-400">{ex.num}</span>
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{ex.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
