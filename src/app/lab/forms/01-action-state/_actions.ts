'use server'

export type ContactState = {
  ok: boolean
  message: string
  // echo last submitted value to prove state survives between submits
  lastName?: string
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // simulate latency so the pending state is observable
  await new Promise((r) => setTimeout(r, 700))

  const name = String(formData.get('name') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !message) {
    return { ok: false, message: 'Name and message are required.', lastName: name }
  }

  return {
    ok: true,
    message: `Thanks ${name}! Your message has been received.`,
    lastName: name,
  }
}
