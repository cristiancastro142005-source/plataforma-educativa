import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      units: true,
    },
  });

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem' }}>💼 Panel de Administración</span>
        <a href="/admin/subjects/new" style={{ background: '#4F46E5', color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          + Nueva Materia
        </a>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0 }}>Mis Materias</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Selecciona una materia para gestionar sus unidades, carpetas y materiales.
          </p>
        </div>

        {subjects.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
              Todavía no creaste ninguna materia.
            </p>
            <a href="/admin/subjects/new" style={{ display: 'inline-block', marginTop: '16px', color: '#4F46E5', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
              Crear la primera materia →
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {subjects.map((subject) => (
              <a
                key={subject.id}
                href={`/admin/subjects/${subject.id}`}
                style={{
                  display: 'block',
                  background: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{subject.icon || '📘'}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>{subject.name}</div>
                    <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{subject.area}</div>
                  </div>
                </div>
                {subject.description && (
                  <p style={{ color: '#475569', fontSize: '0.85rem', margin: '8px 0 12px 0' }}>
                    {subject.description}
                  </p>
                )}
                <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {subject.units.length} {subject.units.length === 1 ? 'unidad' : 'unidades'}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
