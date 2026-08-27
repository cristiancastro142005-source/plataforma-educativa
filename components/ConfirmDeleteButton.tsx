'use client'

import { useTransition } from 'react'

export function ConfirmDeleteButton({
  action,
  confirmMessage = '¿Seguro que querés eliminar esto? Esta acción no se puede deshacer.',
  label = 'Eliminar',
}: {
  action: () => Promise<void>
  confirmMessage?: string
  label?: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action())
        }
      }}
      style={{
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: isPending ? 'default' : 'pointer',
        fontSize: 13,
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? 'Eliminando...' : label}
    </button>
  )
}