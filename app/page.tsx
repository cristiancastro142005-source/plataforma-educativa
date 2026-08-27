import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function Home() {
  // Verificar si hay sesión de profesor activa para mostrar controles de admin
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  const isAdmin = adminSession && adminSession.value === 'true';

  // Consultar las materias reales desde Supabase ordenadas por fecha
  const subjects = await prisma.subject.findMany({
    include: {
      units: {
        include: {
          folders: {
            include: { materials: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra de navegación superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#4F46E5', borderRadius: '50%' }}></span> Prof. Mariana
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <a href="/admin" style={{ padding: '8px 16px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              ⚙️ Ir al Panel Docente
            </a>
          )}
          <a href="/admin/login" style={{ padding: '8px 16px', background: '#F1F5F9', color: '#0F172A', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
            💼 Acceso Profesor
          </a>
        </div>
      </nav>

      {/* Sección Hero / Presentación */}
      <header style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#4F46E5', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          Plataforma Educativa
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#0F172A', lineHeight: 1.1, marginBottom: '16px' }}>
          Plataforma de Clases y Materiales
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748B', lineHeight: 1.6, maxWidth: '600px', marginBottom: '32px' }}>
          Accede a tus apuntes, clases grabadas y ejercicios organizados por unidades de forma centralizada.
        </p>
      </header>

      {/* Listado dinámico de Materias */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', color: '#0F172A' }}>Mis materias</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {subjects.map((subject) => {
            const totalUnits = subject.units.length;
            const totalMaterials = subject.units.reduce((acc, unit) => 
              acc + unit.folders.reduce((fAcc, folder) => fAcc + folder.materials.length, 0)
            , 0);

            return (
              <div key={subject.id} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                {/* Cabecera de la tarjeta con color personalizado */}
                <div style={{ background: subject.color || 'linear-gradient(135deg, #3B82F6, #2563EB)', height: '100px', padding: '24px', position: 'relative', color: 'white', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {subject.icon || '📚'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.9, marginBottom: '4px' }}>{subject.area}</div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{subject.name}</h3>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>
                    {subject.description || 'Sin descripción disponible.'}
                  </p>
                  
                  {/* Estadísticas */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0F172A' }}>{totalUnits}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Unidades</div>
                    </div>
                    <div style={{ marginLeft: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0F172A' }}>{totalMaterials}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Recursos</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/subject/${subject.id}`} style={{ flex: 1, textAlign: 'center', padding: '10px 18px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}>
                      Ingresar →
                    </a>
                    {isAdmin && (
                      <a href={`/admin/subjects/${subject.id}`} style={{ padding: '10px 14px', background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                        Gestionar
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}