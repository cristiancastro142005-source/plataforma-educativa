import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySubjectPassword } from '@/app/actions/auth';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    error?: string;
  };
}

export default async function SubjectPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const hasError = searchParams.error === 'true';

  // 1. Buscar la materia en la base de datos junto con sus unidades, carpetas, materiales y publicaciones
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: {
          folders: {
            orderBy: { order: 'asc' },
            include: {
              materials: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      },
      posts: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!subject) {
    notFound();
  }

  // 2. Verificar si el usuario ya introdujo la contraseña correcta para esta materia mediante cookies
  const cookieStore = cookies();
  const authCookie = cookieStore.get(`auth_subject_${id}`);
  const isAuthenticated = authCookie?.value === 'true';

  // Si NO está autenticado, mostramos la pantalla de bloqueo pidiendo la contraseña
  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '2.5rem' }}>{subject.icon || '🔒'}</span>
            <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '12px', marginBottom: '8px' }}>{subject.name}</h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Esta materia está protegida. Introduce la contraseña para acceder.</p>
          </div>

          <form action={verifySubjectPassword.bind(null, id)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Contraseña de acceso</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="Ingresa la clave..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            {hasError && (
              <div style={{ color: '#EF4444', fontSize: '0.85rem', textAlign: 'center' }}>
                Contraseña incorrecta. Inténtalo de nuevo.
              </div>
            )}

            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
              Ingresar a la materia
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="/" style={{ color: '#64748B', fontSize: '0.85rem', textDecoration: 'none' }}>← Volver al inicio</a>
          </div>
        </div>
      </main>
    );
  }

  // 3. Si SÍ está autenticado, mostramos todo el contenido de la materia (Avisos + Unidades)
  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra de navegación interna */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href="/" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver a materias
        </a>
        <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
          {subject.name}
        </div>
      </nav>

      {/* Cabecera de la materia */}
      <header style={{ background: subject.color || '#4F46E5', color: '#FFFFFF', padding: '50px 5%' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.9, letterSpacing: '0.05em' }}>{subject.area}</span>
          <h1 style={{ fontSize: '2.5rem', margin: '8px 0 12px 0' }}>{subject.name}</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '700px', lineHeight: 1.5 }}>
            {subject.description || 'Bienvenido al espacio de la materia.'}
          </p>
        </div>
      </header>

      {/* Sección de Avisos y Novedades */}
      {subject.posts && subject.posts.length > 0 && (
        <div style={{ maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 5%' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '16px' }}>📢 Avisos y Novedades</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subject.posts.map(post => (
              <div key={post.id} style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '20px 24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#92400E', margin: '0 0 8px 0' }}>{post.title}</h3>
                <p style={{ fontSize: '0.95rem', color: '#78350F', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{post.content}</p>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#B45309', marginTop: '12px' }}>
                  Publicado el {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido: Unidades y Materiales */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '24px' }}>Unidades de Estudio</h2>

        {subject.units.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
            Aún no hay unidades cargadas en esta materia.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {subject.units.map((unit, index) => (
              <div key={unit.id} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Cabecera de la Unidad */}
                <div style={{ background: '#F1F5F9', padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4F46E5', textTransform: 'uppercase' }}>Unidad {index + 1}</span>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '4px 0 0 0' }}>{unit.name}</h3>
                  {unit.description && <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px' }}>{unit.description}</p>}
                </div>

                {/* Carpetas y Materiales */}
                <div style={{ padding: '20px 24px' }}>
                  {unit.folders.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No hay carpetas en esta unidad.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {unit.folders.map(folder => (
                        <div key={folder.id}>
                          <h4 style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📁 {folder.name}
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px', paddingLeft: '20px' }}>
                            {folder.materials.map(material => (
                              <a 
                                key={material.id} 
                                href={material.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', textDecoration: 'none', color: '#0F172A', fontSize: '0.875rem', transition: 'background 0.2s' }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  📄 {material.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>
                                  {material.type}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}