'use server'

import { requireRole } from '../_dal/auth'

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | { idle: true }

// This action enforces the role server-side. Even if the UI is hidden client-side
// or someone reverse-engineers and calls the action directly, requireRole will
// redirect (a 303) before the privileged work runs.
export async function deleteEverything(
  _prev: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(['admin'])
  // pretend to do dangerous admin work
  return {
    ok: true,
    message: `✓ Action executed by admin (${session.user.name}). Nothing was actually deleted.`,
  }
}
