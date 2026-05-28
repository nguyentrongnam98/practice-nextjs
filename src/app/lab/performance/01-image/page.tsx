import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { HeroImage } from './_components/HeroImage'
import { BlurredImage } from './_components/BlurredImage'
import { ResponsiveGrid } from './_components/ResponsiveGrid'

export default function ImageExercise() {
  return (
    <ExerciseLayout
      number="01"
      title="next/image deep dive"
      concept="next/image extends <img> with format conversion (AVIF/WebP), responsive sizing, lazy-by-default, CLS prevention via width/height, blur placeholders, and the priority prop for LCP images. The sizes prop tells the browser which candidate to download."
      questions={[
        'Why does next/image need both width/height (or fill) to prevent layout shift?',
        'When should you set the priority prop, and what does it disable?',
        'What does the sizes prop affect — the rendered size or the downloaded size?',
        'How does placeholder="blur" work — what asset gets shipped?',
        'What is the difference between fill and explicit width/height?',
      ]}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">priority + fill + sizes (LCP candidate)</h3>
        <HeroImage />
        <p className="text-xs text-gray-500">Loads eagerly. Inspect &lt;link rel=&quot;preload&quot;&gt; in DevTools.</p>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">placeholder=&quot;blur&quot; with blurDataURL</h3>
        <BlurredImage />
        <p className="text-xs text-gray-500">Throttle to Slow 3G in DevTools to see the blur preview.</p>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">Responsive grid (sizes drives download size)</h3>
        <ResponsiveGrid />
        <p className="text-xs text-gray-500">
          Resize the viewport from mobile to desktop and re-load — the browser picks a smaller candidate
          on mobile thanks to <code>sizes</code>.
        </p>
      </section>
    </ExerciseLayout>
  )
}
