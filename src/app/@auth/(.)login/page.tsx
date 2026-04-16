import { Modal } from '@/shared/components/feedback'
import { LoginForm } from '@/features/auth'

export default function LoginModalPage() {
  return (
    <Modal>
      <h2 className="mb-4 text-lg font-semibold">Sign in</h2>
      <LoginForm />
    </Modal>
  )
}
