import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  // 1. Verificar si el profesor tiene la sesión iniciada mediante cookies
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // 2. Obtener todas las materias de la base de datos
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { units: true }
      }
    }
  });

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior de administración */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>💼</span>
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>Panel de Docente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>Ver sitio público</a>
          <form action={async () => {
            'use server';
            cookies().delete('admin_session');
            redirect('/admin/login');
          }}>
            <button type="submit" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      {/* Contenido principal del Dashboard */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0 }}>Gestión de Materias</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>Administra los espacios académicos de la plataforma.</p>
          </div>
          <a href="/admin/subjects/new" style={{ background: '#4F46E5', color: '#FFFFFF', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            + Nueva Materia
          </a>
        </div>

        {/* Listado de Materias */}
        {subjects.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
            No hay materias creadas todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects.map(subject => (
              <div key={subject.id} style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '2rem', background: '#F1F5F9', padding: '10px', borderRadius: '10px' }}>{subject.icon || '📚'}</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: 0 }}>{subject.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>{subject.area} • {subject._count.units} unidades registradas</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Botón de gestión añadido */}
                  <a href={`/admin/subjects/${subject.id}`} style={{ background: '#EEF2FF', color: '#4F46E5', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                    Gestionar contenido
                  </a>
                  <a href={`/subject/${subject.id}`} target="_blank" style={{ background: '#F1F5F9', color: '#334155', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
                    Ver materia
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}