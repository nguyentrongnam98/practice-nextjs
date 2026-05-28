import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { VitalsReporter } from './_components/VitalsReporter'
import { VitalsTable } from './_components/VitalsTable'

export default function VitalsExercise() {
  return (
    <ExerciseLayout
      number="06"
      title="Web Vitals with useReportWebVitals"
      concept="useReportWebVitals from next/web-vitals is the hook every analytics integration wraps. It fires once per metric as each Core Web Vital settles: LCP, CLS, INP, FCP, TTFB. Must be called inside a Client Component."
      questions={[
        'What is a "good" threshold for LCP, CLS, and INP?',
        'Why does the callback for useReportWebVitals fire multiple times per page load?',
        'How do Vercel Analytics and GA4 use this hook under the hood?',
        'What is the difference between FID and INP?',
        'How would you batch-send these metrics to your backend without blocking the UI?',
      ]}
    >
      <VitalsReporter />
      <p className="mb-3 text-sm text-gray-600">
        Metrics appear as they settle. Try refreshing, then interact with the page (click, scroll) to
        trigger INP. Throttle the network in DevTools to push LCP into the &quot;poor&quot; range.
      </p>
      <VitalsTable />
    </ExerciseLayout>
  )
}
