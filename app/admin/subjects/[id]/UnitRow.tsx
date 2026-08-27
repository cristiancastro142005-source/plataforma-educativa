'use client'

import { useState } from 'react'
import { updateUnit, deleteUnit } from './actions'
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton'

export function UnitRow({ unit, subjectId }: { unit: { id: string; title: string }; subjectId: string }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(unit.title)

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateUnit(unit.id, subjectId, formData)
          setEditing(false)
        }}
        style={{ display: 'flex', gap: 8, padding: 12, background: '#F8FAFC', borderRadius: '8px', border: '1px solid #CBD5E1' }}
      >
        <input
          name="name" // <-- ¡Aquí está el cambio! Ahora coincide con actions.ts y tu base de datos
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem' }}
        />
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, background: '#4F46E5', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Guardar
        </button>
        <button type="button" onClick={() => setEditing(false)} style={{ padding: '8px 12px', borderRadius: 8, background: '#F1F5F9', color: '#334155', border: 'none', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>
          Cancelar
        </button>
      </form>
    )
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC',
    }}>
      <div>
        <a href={`/admin/units/${unit.id}`} style={{ fontWeight: 600, color: '#0F172A', textDecoration: 'none', fontSize: '0.95rem' }}>
          {unit.title}
        </a>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button type="button" onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          Editar
        </button>
        <ConfirmDeleteButton
          action={() => deleteUnit(unit.id, subjectId)}
          confirmMessage="Esto eliminará la unidad y todas sus carpetas y materiales. ¿Continuar?"
        />
      </div>
    </div>
  )
}