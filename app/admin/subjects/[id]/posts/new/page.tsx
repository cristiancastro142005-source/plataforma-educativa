import prisma from '@/lib/prisma';
import { createPost } from '@/app/actions/admin';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NewPostPage({ params }: PageProps) {
  const { id } = params;

  // Verificar sesión del profesor
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  // Buscar la materia para mostrar contexto
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href="/admin" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver al Panel
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>{subject.name} &gt; Nueva Novedad</span>
      </nav>

      {/* Formulario */}
      <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '0', marginBottom: '8px' }}>Publicar Aviso o Novedad</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '24px' }}>Comparte información importante con los alumnos de esta materia.</p>

          <form action={createPost.bind(null, id)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Título del Aviso</label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Ej. Suspensión de clase / Fecha de parcial"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Contenido del Mensaje</label>
              <textarea 
                name="content" 
                rows={5}
                required
                placeholder="Escribe aquí los detalles del comunicado..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '10px' }}>
              Publicar Aviso
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}