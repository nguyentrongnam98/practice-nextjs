import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-image',
    title: 'next/image deep dive',
    desc: 'priority, sizes, placeholder="blur", LCP optimisation, fill vs fixed dimensions.',
  },
  {
    num: '02',
    slug: '02-font',
    title: 'next/font self-host & no-CLS',
    desc: 'Google fonts via next/font/google, subset, variable fonts, layout shift prevention.',
  },
  {
    num: '03',
    slug: '03-bundle',
    title: 'Bundle splitting & dynamic import',
    desc: 'Read build output to see chunks; defer heavy modules with dynamic import().',
  },
  {
    num: '04',
    slug: '04-lazy',
    title: 'Lazy loading Client Components',
    desc: 'next/dynamic with and without ssr:false; intersection-observer-based mounting.',
  },
  {
    num: '05',
    slug: '05-prefetch',
    title: 'Prefetch strategies',
    desc: 'Default vs disabled vs hover-triggered vs programmatic router.prefetch().',
  },
  {
    num: '06',
    slug: '06-vitals',
    title: 'Web Vitals with useReportWebVitals',
    desc: 'Capture LCP, CLS, INP, FCP, TTFB in a table — same hook real analytics use.',
  },
]

export default function PerformanceLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Performance Lab</h1>
      <p className="mt-1 text-sm text-gray-500">6 exercises on optimisation primitives</p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/performance/${ex.slug}`}
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
