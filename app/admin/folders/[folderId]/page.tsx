import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Server Action segura y conectada al schema real de Prisma (usando 'name')
async function createMaterial(folderId: string, formData: FormData) {
  'use server';
  const name = (formData.get('name') as string)?.trim();
  const type = (formData.get('type') as string) || 'PDF';
  const urlInput = (formData.get('url') as string)?.trim();
  const file = formData.get('file') as File;

  if (!name || !folderId) {
    redirect(`/admin/folders/${folderId}?error=El+nombre+es+obligatorio`);
  }

  let finalUrl = urlInput || '';

  if (file && file.size > 0) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      redirect(`/admin/folders/${folderId}?error=Faltan+las+credenciales+de+Supabase+en+el+servidor`);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('materiales')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Error subiendo a Supabase:', uploadError);
      redirect(`/admin/folders/${folderId}?error=Error+al+subir+a+Supabase:+${encodeURIComponent(uploadError.message)}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('materiales')
      .getPublicUrl(fileName);

    finalUrl = publicUrlData.publicUrl;
  }

  if (!finalUrl) {
    redirect(`/admin/folders/${folderId}?error=Debes+subir+un+archivo+o+ingresar+un+enlace+válido`);
  }

  try {
    await prisma.material.create({
      data: {
        name, // Corregido para coincidir con tu schema de Prisma
        type,
        url: finalUrl,
        folderId,
      },
    });
  } catch (dbError) {
    console.error('Error en Prisma:', dbError);
    redirect(`/admin/folders/${folderId}?error=Error+al+guardar+en+la+base+de+datos`);
  }

  revalidatePath(`/admin/folders/${folderId}`);
  redirect(`/admin/folders/${folderId}?success=1`);
}

export default async function FolderDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ folderId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedParams = await params;
  const folderId = resolvedParams?.folderId;
  const resolvedSearch = await searchParams;

  if (!folderId) {
    notFound();
  }

  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login');
  }

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      unit: { include: { subject: true } },
      materials: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!folder) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href={`/admin/units/${folder.unitId}`} style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver a la Unidad
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>
          📁 {folder.name}
        </span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>📁 {folder.name}</h1>
        
        {/* Banner de Errores o Éxito */}
        {resolvedSearch?.error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⚠️ {decodeURIComponent(resolvedSearch.error)}
          </div>
        )}

        {resolvedSearch?.success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            ✅ ¡Material subido y guardado exitosamente!
          </div>
        )}

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>+ Agregar Nuevo Material</h3>
          
          <form action={createMaterial.bind(null, folderId)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="text" name="name" placeholder="Título (ej: PDF Teórico)" required style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }} />
              <select name="type" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                <option value="PDF">Documento (PDF/Word)</option>
                <option value="VIDEO">Video / Clase</option>
                <option value="LINK">Enlace Web</option>
              </select>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px dashed #94A3B8' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                Opción A: Subir archivo real (PDF, imagen, etc.)
              </label>
              <input type="file" name="file" accept=".pdf,.doc,.docx,.mp4,.jpg,.png" style={{ fontSize: '0.9rem' }} />
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px dashed #94A3B8' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                Opción B: Pegar un enlace externo (YouTube, Drive)
              </label>
              <input type="url" name="url" placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', fontSize: '0.9rem' }} />
            </div>

            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              Subir Material
            </button>
          </form>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>Materiales Disponibles</h3>
          
          {folder.materials.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Aún no hay materiales en esta carpeta.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {folder.materials.map((mat) => (
                <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>{mat.name}</div>
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>
                      Ver Material ↗
                    </a>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {mat.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}