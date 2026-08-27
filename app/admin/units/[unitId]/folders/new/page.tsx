import prisma from '@/lib/prisma';
import { createFolder } from '@/app/actions/admin';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

interface PageProps {
  params: {
    unitId: string;
  };
}

export default async function NewFolderPage({ params }: PageProps) {
  const { unitId } = params;

  // Verificar sesión
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // Buscar la unidad para mostrar contexto
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { subject: true }
  });

  if (!unit) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href="/admin" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver al Panel
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>{unit.subject.name} &gt; {unit.name}</span>
      </nav>

      {/* Formulario */}
      <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '0', marginBottom: '8px' }}>Crear Carpeta Organizadora</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '24px' }}>Agrupa los archivos por categoría (ej. Bibliografía, Prácticos, Videos).</p>

          <form action={createFolder.bind(null, unitId)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Nombre de la Carpeta</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Guía de Ejercicios Resueltos"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Orden de Aparición (Número)</label>
              <input 
                type="number" 
                name="order" 
                defaultValue={1}
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '10px' }}>
              Guardar Carpeta
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}