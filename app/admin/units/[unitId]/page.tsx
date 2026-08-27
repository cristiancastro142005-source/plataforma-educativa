import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Server Action para crear una carpeta dentro de esta unidad
async function createFolder(unitId: string, formData: FormData) {
  'use server';
  const name = (formData.get('name') as string)?.trim();
  
  if (!name || !unitId) return;

  await prisma.folder.create({
    data: {
      name,
      unitId,
      order: 1 // Por defecto le ponemos 1, luego lo puedes mejorar
    },
  });

  revalidatePath(`/admin/units/${unitId}`);
}

export default async function UnitDetailPage({ params }: { params: { unitId: string } }) {
  // Resolvemos los params (Next.js 14+)
  const resolvedParams = await params;
  const unitId = resolvedParams.unitId;

  // Verificar sesión de administrador
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // Buscar la unidad con sus carpetas
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      subject: true,
      folders: {
        orderBy: { createdAt: 'desc' },
        include: { materials: true } // Para saber cuántos archivos tiene cada carpeta
      },
    },
  });

  if (!unit) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href={`/admin/subjects/${unit.subjectId}`} style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver a {unit.subject.name}
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>
          Unidad: {unit.name}
        </span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0 }}>{unit.name}</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Crea carpetas organizadoras (ej: "Teórico", "Prácticos") para subir los materiales.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Formulario para Crear Carpeta */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>+ Nueva Carpeta</h3>
            
            <form action={createFolder.bind(null, unitId)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Nombre de la Carpeta</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej: Clases Grabadas"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Guardar Carpeta
              </button>
            </form>
          </div>

          {/* Listado de Carpetas */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>Carpetas en esta Unidad</h3>

            {unit.folders.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>No has creado carpetas en esta unidad.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unit.folders.map((folder) => (
                  <div key={folder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>📁 {folder.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                        {folder.materials.length} recursos dentro
                      </div>
                    </div>
                    {/* Este botón te llevará a la pantalla de materiales que ya creamos antes */}
                    <a href={`/admin/folders/${folder.id}`} style={{ padding: '6px 12px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                      Abrir →
                    </a>
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