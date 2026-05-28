'use server'

import { signupSchema } from './_schema'

export type SignupState =
  | { ok: true; email: string }
  | { ok: false; fieldErrors: Record<string, string[]>; values: Record<string, string> }
  | { idle: true }

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  await new Promise((r) => setTimeout(r, 400))
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = signupSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      values: raw,
    }
  }

  return { ok: true, email: parsed.data.email }
}
