import { getProfileDTO } from '../_dto'

export async function ProfileCard() {
  const profile = await getProfileDTO()

  if (!profile) {
    return (
      <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
        No session. Start one in exercise 01.
      </p>
    )
  }

  return (
    <dl className="rounded-md border bg-white p-4 text-sm">
      <Row label="Name" value={profile.name} />
      <Row label="Email" value={profile.email} />
      <Row label="Role" value={profile.role} />
      <Row label="Team" value={profile.team} />
      <Row label="Phone" value={profile.phone ?? '(redacted)'} />
      <Row label="Secret" value={profile.secret ?? '(redacted — admin only)'} />
    </dl>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}
