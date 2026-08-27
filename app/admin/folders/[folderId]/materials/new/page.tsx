import prisma from '@/lib/prisma';
import { createMaterial } from '@/app/actions/admin';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

interface PageProps {
  params: {
    folderId: string;
  };
}

export default async function NewMaterialPage({ params }: PageProps) {
  const { folderId } = params;

  // Verificar sesión del profesor
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // Buscar la carpeta para mostrar contexto
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      unit: {
        include: { subject: true }
      }
    }
  });

  if (!folder) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href="/admin" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver al Panel
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>
          {folder.unit.subject.name} &gt; {folder.unit.name} &gt; {folder.name}
        </span>
      </nav>

      {/* Formulario */}
      <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '0', marginBottom: '8px' }}>Subir Nuevo Material</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '24px' }}>Agrega un enlace, documento o recurso digital para los alumnos.</p>

          <form action={createMaterial.bind(null, folderId)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Título del Material</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Clase 1 - Presentación en PDF"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Tipo de Recurso</label>
              <select 
                name="type" 
                defaultValue="PDF"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: '#FFFFFF' }}
              >
                <option value="PDF">PDF / Documento</option>
                <option value="LINK">Enlace Web</option>
                <option value="VIDEO">Video</option>
                <option value="EXAM">Evaluación / Práctico</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>URL o Enlace del Recurso</label>
              <input 
                type="url" 
                name="url" 
                required 
                placeholder="https://ejemplo.com/archivo.pdf"
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
              Guardar y Publicar Material
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}