import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Server Action para crear una Unidad dentro de la materia
async function createUnit(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const subjectId = formData.get('subjectId') as string;
  const description = formData.get('description') as string;

  if (!name || !subjectId) return;

  await prisma.unit.create({
    data: {
      name,
      subjectId,
      description: description || null,
    },
  });

  revalidatePath(`/admin/subjects/${subjectId}`);
}

export default async function SubjectManagePage({ params }: { params: { id: string } }) {
  // 1. Resolver params por seguridad en Next.js 14+
  const resolvedParams = await params;
  const subjectId = resolvedParams.id;

  // 2. Verificar sesión de administrador
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // 3. Buscar la materia y sus unidades actuales
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      units: {
        orderBy: { createdAt: 'desc' },
        include: { folders: true },
      },
    },
  });

  if (!subject) {
    redirect('/admin');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/admin" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver al Panel</a>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>Gestión: {subject.name}</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <div style={{ maxWidth: '900px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0 }}>{subject.name}</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>Área: {subject.area} • Administra las unidades y contenidos de este espacio.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Formulario para Crear Unidad */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>+ Nueva Unidad</h3>
            
            <form action={createUnit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="subjectId" value={subject.id} />
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Nombre de la Unidad</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej: Unidad 1 — Funciones"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Descripción (opcional)</label>
                <textarea 
                  name="description" 
                  placeholder="Breve detalle de los temas..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Guardar Unidad
              </button>
            </form>
          </div>

          {/* Listado de Unidades Existentes */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>Unidades Creadas</h3>

            {subject.units.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>No hay unidades registradas todavía en esta materia.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subject.units.map((unit) => (
                  <div key={unit.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#0F172A', margin: 0 }}>{unit.name}</h4>
                    {unit.description && (
                      <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>{unit.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}