'use client'

import { useActionState, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/shared/components/ui'
import { uploadImage, type UploadState } from '../_actions'

const initial: UploadState = { idle: true }

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(uploadImage, initial)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return setPreviewUrl(null)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd)
        formRef.current?.reset()
        setPreviewUrl(null)
      }}
      className="flex flex-col gap-3"
    >
      <input
        type="file"
        name="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onPick}
        className="text-sm"
      />
      {previewUrl && (
        <div className="relative h-40 w-40 overflow-hidden rounded border">
          <Image src={previewUrl} alt="preview" fill className="object-cover" unoptimized />
        </div>
      )}
      <Button type="submit" loading={pending}>
        Upload
      </Button>

      {'ok' in state && state.ok === true && (
        <p className="text-sm text-green-600">
          ✓ Uploaded {state.filename} ({(state.size / 1024).toFixed(1)} KB)
        </p>
      )}
      {'ok' in state && state.ok === false && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  )
}
