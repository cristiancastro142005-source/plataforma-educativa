'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function updateUnit(unitId: string, subjectId: string, formData: FormData) {
  const session = cookies().get('admin_session')
  if (session?.value !== 'true') throw new Error('No autorizado')

  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('El nombre es obligatorio')

  await prisma.unit.update({ where: { id: unitId }, data: { name } })
  revalidatePath(`/admin/subjects/${subjectId}`)
}

export async function deleteUnit(unitId: string, subjectId: string) {
  const session = cookies().get('admin_session')
  if (session?.value !== 'true') throw new Error('No autorizado')

  await prisma.unit.delete({ where: { id: unitId } })
  revalidatePath(`/admin/subjects/${subjectId}`)
}