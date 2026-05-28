import { Input } from '@/shared/components/ui'
import { subscribe } from '../_actions'
import { SubmitButton } from './SubmitButton'

export function SubscribeForm() {
  return (
    <form action={subscribe} className="flex flex-col gap-3">
      <Input label="Email" name="email" type="email" required placeholder="you@example.com" />
      <SubmitButton />
    </form>
  )
}
