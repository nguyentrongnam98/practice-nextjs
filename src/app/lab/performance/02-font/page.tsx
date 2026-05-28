import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { inter, jetbrains } from './_fonts'

export default function FontExercise() {
  return (
    <ExerciseLayout
      number="02"
      title="next/font self-host & no-CLS"
      concept="next/font downloads Google fonts at build time and self-hosts them, eliminating render-blocking requests to fonts.googleapis.com. It also produces a CSS variable and a precomputed size-adjust so the fallback font's metrics align with the web font — no Flash of Unstyled Text."
      questions={[
        'Why does next/font require subsets to be declared at config time?',
        'How does next/font prevent layout shift even before the web font loads?',
        'What is the difference between display: swap, block, fallback, and optional?',
        'How are variable fonts different from named-weight imports?',
        'Where do the self-hosted font files end up in the build output?',
      ]}
    >
      <section className={`${inter.variable} ${jetbrains.variable} space-y-3`}>
        <p style={{ fontFamily: 'var(--font-inter)' }} className="text-base">
          Inter (sans, Latin + Vietnamese subset). Tiếng Việt: chữ &ldquo;đ&rdquo; ư â ê ô ơ ạ ả.
        </p>
        <p
          style={{ fontFamily: 'var(--font-jetbrains)' }}
          className="rounded bg-gray-900 p-2 text-xs text-green-200"
        >
          {`function greet(name: string) {\n  return \`Hello, \${name}\`\n}`}
        </p>
        <p className="text-xs text-gray-500">
          Both fonts are self-hosted. Open Network → Fonts: you should see local <code>.woff2</code>
          files served from the same origin, NOT requests to fonts.gstatic.com.
        </p>
      </section>
    </ExerciseLayout>
  )
}
