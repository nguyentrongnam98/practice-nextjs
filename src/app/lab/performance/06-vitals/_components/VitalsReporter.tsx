'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect, useState } from 'react'

export type VitalMetric = {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

const captured: VitalMetric[] = []
const listeners = new Set<() => void>()

function record(m: VitalMetric) {
  // de-dup by id
  if (captured.some((c) => c.id === m.id)) return
  captured.push(m)
  listeners.forEach((l) => l())
}

export function VitalsReporter() {
  useReportWebVitals((metric) => {
    record({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating as VitalMetric['rating'],
      navigationType: metric.navigationType,
    })
  })
  return null
}

export function useVitals(): VitalMetric[] {
  const [, force] = useState(0)
  useEffect(() => {
    const fn = () => force((n) => n + 1)
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])
  return [...captured]
}
