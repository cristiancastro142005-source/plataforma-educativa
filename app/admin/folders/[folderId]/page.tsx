import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FolderPage({ params }: { params: { folderId: string } }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // Buscamos la carpeta por su ID e incluimos sus materiales
  const folder = await prisma.folder.findUnique({
    where: { id: params.folderId },
    include: {
      materials: true,
      unit: true, // Traemos la unidad para el botón de volver atrás
    }
  });

  // Si no encuentra la carpeta, nos devuelve al inicio
  if (!folder) {
    redirect('/admin');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem' }}>
          📁 Carpeta: {folder.name}
        </span>
        <a href={`/admin/units/${folder.unitId}`} style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver a la Unidad
        </a>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0 }}>Materiales de la carpeta</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
              Sube y gestiona los archivos de esta carpeta.
            </p>
          </div>
          <a href={`/admin/folders/${folder.id}/materials/new`} style={{ background: '#4F46E5', color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            + Subir Material
          </a>
        </div>

        {folder.materials.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
              Esta carpeta está vacía. Aún no hay materiales.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {folder.materials.map((material) => (
              <div key={material.id} style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0F172A' }}>{material.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {material.type}
                  </span>
                </div>
                <a href={material.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  Ver archivo ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}