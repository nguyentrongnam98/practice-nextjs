import { LoginForm } from '@/features/auth'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  )
}
