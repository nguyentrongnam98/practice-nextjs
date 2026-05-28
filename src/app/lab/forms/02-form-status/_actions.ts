'use server'

export async function subscribe(formData: FormData): Promise<void> {
  // simulate slow network
  await new Promise((r) => setTimeout(r, 1500))
  const email = String(formData.get('email') ?? '')
  console.log('[subscribe] received email:', email)
}
