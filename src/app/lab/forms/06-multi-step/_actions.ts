'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { step1Schema, step2Schema, fullSchema, type WizardState } from './_schema'

const COOKIE = 'lab-wizard'
const PATH = '/lab/forms/06-multi-step'

async function readState(): Promise<WizardState> {
  const c = await cookies()
  const raw = c.get(COOKIE)?.value
  if (!raw) return {}
  try {
    return JSON.parse(raw) as WizardState
  } catch {
    return {}
  }
}

async function writeState(state: WizardState) {
  const c = await cookies()
  c.set(COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: 'lax',
    path: PATH,
    maxAge: 60 * 30,
  })
}

async function clearState() {
  const c = await cookies()
  c.delete(COOKIE)
}

export type StepResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]> }

export async function saveStepOne(
  _prev: StepResult,
  formData: FormData,
): Promise<StepResult> {
  const parsed = step1Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const current = await readState()
  await writeState({ ...current, ...parsed.data })
  redirect(`${PATH}?step=2`)
}

export async function saveStepTwo(
  _prev: StepResult,
  formData: FormData,
): Promise<StepResult> {
  const parsed = step2Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const current = await readState()
  await writeState({ ...current, ...parsed.data })
  redirect(`${PATH}?step=3`)
}

export async function submitWizard(): Promise<void> {
  const state = await readState()
  const parsed = fullSchema.safeParse(state)
  if (!parsed.success) {
    // unlikely if user followed steps, but guard anyway
    redirect(`${PATH}?step=1`)
  }
  // pretend to persist
  console.log('[wizard] final submit', parsed.data)
  await clearState()
  redirect(`${PATH}?step=done`)
}

export async function getStateForRender(): Promise<WizardState> {
  return readState()
}
