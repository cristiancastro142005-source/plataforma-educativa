'use server'

import { db } from '@/lib/db'; // Ajusta la ruta a tu cliente de Prisma según tu proyecto
import { revalidatePath } from 'next/cache';

export async function createUnit(formData: FormData) {
  const name = formData.get('name') as string;
  const subjectId = formData.get('subjectId') as string;
  const description = formData.get('description') as string;

  if (!name || !subjectId) {
    throw new Error('Faltan datos obligatorios');
  }

  try {
    await db.unit.create({
      data: {
        name,
        subjectId,
        description: description || null,
      },
    });

    revalidatePath(`/admin`); // Refresca la vista del panel
  } catch (error) {
    console.error('Error al crear la unidad:', error);
    throw new Error('No se pudo crear la unidad');
  }
}

export async function createFolder(formData: FormData) {
  const name = formData.get('name') as string;
  const unitId = formData.get('unitId') as string;

  if (!name || !unitId) {
    throw new Error('Faltan datos obligatorios');
  }

  try {
    await db.folder.create({
      data: {
        name,
        unitId,
      },
    });

    revalidatePath(`/admin`);
  } catch (error) {
    console.error('Error al crear la carpeta:', error);
    throw new Error('No se pudo crear la carpeta');
  }
}