'use server';

import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createSubject(formData: FormData) {
  // Verificar que el profesor tenga sesión activa
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const name = String(formData.get('name') || '');
  const area = String(formData.get('area') || '');
  const description = String(formData.get('description') || '');
  const icon = String(formData.get('icon') || '📘');
  const color = String(formData.get('color') || '#4F46E5');
  const rawPassword = String(formData.get('password') || '');

  // Encriptar la contraseña de la materia
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Crear la materia en la base de datos
  await prisma.subject.create({
    data: {
      name,
      area,
      description,
      icon,
      color,
      passwordHash,
    },
  });

  // Redirigir de vuelta al panel principal de administración
  redirect('/admin');
}

export async function createUnit(subjectId: string, formData: FormData) {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const name = String(formData.get('name') || '');
  const description = String(formData.get('description') || '');
  const order = parseInt(String(formData.get('order') || '1'), 10);

  // Crear la unidad asociada a la materia en la base de datos
  await prisma.unit.create({
    data: {
      name,
      description,
      order,
      subjectId,
    },
  });

  redirect('/admin');
}

export async function createFolder(unitId: string, formData: FormData) {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const name = String(formData.get('name') || '');
  const order = parseInt(String(formData.get('order') || '1'), 10);

  // Crear la carpeta asociada a la unidad
  await prisma.folder.create({
    data: {
      name,
      order,
      unitId,
    },
  });

  redirect('/admin');
}

export async function createMaterial(folderId: string, formData: FormData) {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const name = String(formData.get('name') || '');
  const type = String(formData.get('type') || 'PDF');
  const url = String(formData.get('url') || '');
  const order = parseInt(String(formData.get('order') || '1'), 10);

  // Crear el material asociado a la carpeta en la base de datos
  await prisma.material.create({
    data: {
      name,
      type,
      url,
      order,
      folderId,
    },
  });

  redirect('/admin');
}

export async function createPost(subjectId: string, formData: FormData) {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const title = String(formData.get('title') || '');
  const content = String(formData.get('content') || '');

  // Crear la publicación asociada a la materia
  await prisma.post.create({
    data: {
      title,
      content,
      subjectId,
    },
  });

  redirect('/admin');
}