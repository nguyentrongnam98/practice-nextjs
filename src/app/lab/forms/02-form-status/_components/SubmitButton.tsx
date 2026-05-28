'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/shared/components/ui'

export function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      {pending ? 'Subscribing…' : 'Subscribe'}
    </Button>
  )
}
