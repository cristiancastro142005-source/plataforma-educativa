import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando la base de datos...');

  // 1. Crear el usuario del Profesor
  const profPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'profesor@ejemplo.com' },
    update: {},
    create: {
      email: 'profesor@ejemplo.com',
      name: 'Prof. Mariana Ferreiro',
      passwordHash: profPassword,
      role: 'PROFESSOR',
    },
  });

  // 2. Crear materia de ejemplo
  const subjectPassword = await bcrypt.hash('calculo123', 10);
  await prisma.subject.create({
    data: {
      name: 'Cálculo 1',
      area: 'Matemática',
      description: 'Límites, derivadas e introducción a la integración.',
      color: 'linear-gradient(135deg, #3B82F6, #2563EB)',
      icon: '📐',
      passwordHash: subjectPassword,
      units: {
        create: [
          {
            name: '01 — Funciones',
            order: 1,
            folders: {
              create: [
                {
                  name: 'Teoría',
                  order: 1,
                  materials: {
                    create: [
                      {
                        name: 'Introducción a funciones.pdf',
                        type: 'pdf',
                        url: 'https://ejemplo.com/pdf-falso.pdf',
                        sizeBytes: 1258291,
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      },
      posts: {
        create: [
          {
            title: '¡Bienvenidos a Cálculo 1!',
            content: 'En este espacio publicaré las novedades de la materia.',
            type: 'Aviso',
            pinned: true,
          }
        ]
      }
    },
  });

  console.log('¡Base de datos sembrada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });