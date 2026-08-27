'use server';

import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifySubjectPassword(subjectId: string, formData: FormData) {
  const passwordAttempt = formData.get('password');

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { passwordHash: true }
  });

  if (!subject) {
    redirect(`/subject/${subjectId}?error=true`);
  }

  // Aseguramos que ambos valores sean strings planos
  const passwordString = String(passwordAttempt || '');
  const hashString = String(subject.passwordHash || '');

  const isValid = await bcrypt.compare(passwordString, hashString);

  if (!isValid) {
    redirect(`/subject/${subjectId}?error=true`);
  }

  // Guardamos la cookie con el nombre exacto que espera la página de la materia
  cookies().set(`auth_subject_${subjectId}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // Dura 30 días
    path: '/',
  });

  redirect(`/subject/${subjectId}`);
}
export async function loginProfessor(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  // Buscar al usuario en la base de datos por su email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    redirect('/admin/login?error=true');
  }

  // Comparar la contraseña ingresada con el hash guardado
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    redirect('/admin/login?error=true');
  }

  // Si es correcto, guardamos una cookie de sesión para el profesor
  cookies().set('admin_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 día
    path: '/',
  });

  redirect('/admin');
}