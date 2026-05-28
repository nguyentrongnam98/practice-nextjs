export type Photo = { id: string; title: string; color: string }

export const PHOTOS: Photo[] = [
  { id: '1', title: 'Sunset over Hà Long', color: 'from-orange-400 to-pink-500' },
  { id: '2', title: 'Mountain trail', color: 'from-emerald-400 to-teal-600' },
  { id: '3', title: 'Ocean morning', color: 'from-sky-400 to-blue-600' },
  { id: '4', title: 'Forest path', color: 'from-lime-400 to-green-700' },
  { id: '5', title: 'Desert dunes', color: 'from-amber-300 to-yellow-600' },
  { id: '6', title: 'Night sky', color: 'from-indigo-700 to-purple-900' },
]

export function getPhoto(id: string): Photo | null {
  return PHOTOS.find((p) => p.id === id) ?? null
}
