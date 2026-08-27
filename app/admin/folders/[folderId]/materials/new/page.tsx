import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default function NewMaterialPage({ params }: { params: { folderId: string } }) {

  async function createMaterial(formData: FormData) {
    'use server';
    
    let redirectPath = '';

    try {
      const name = formData.get('name') as string;
      const file = formData.get('file') as File;
      
      if (!name || !file || file.size === 0) {
        throw new Error('Faltan datos o el archivo está vacío');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SECRET_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno en Vercel (URL o SECRET_KEY)');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // ¡EL TRUCO ESTÁ AQUÍ! Transformamos el archivo a Buffer para que Node.js no se ahogue
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subir el archivo al bucket "materiales"
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/materiales/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': file.type,
        },
        body: buffer, // Enviamos el archivo transformado
      });

      if (!uploadRes.ok) {
        const errorDetail = await uploadRes.text();
        console.error("Error de Supabase al subir:", errorDetail);
        throw new Error('Supabase rechazó el archivo. Revisa los logs en Vercel.');
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/materiales/${fileName}`;

      // Guardar en la base de datos
      await prisma.material.create({
        data: {
          name: name,
          type: file.type === 'application/pdf' ? 'PDF' : 'ARCHIVO',
          url: publicUrl,
          sizeBytes: file.size,
          order: 1,
          folderId: params.folderId,
        }
      });
      
      redirectPath = `/admin/folders/${params.folderId}`;
    } catch (error) {
      console.error("Error crítico en el Server Action:", error);
      throw error; // Lanzamos el error para que Next.js sepa que algo falló
    }

    // El redirect se debe hacer fuera del bloque try/catch
    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 5%', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Subir Nuevo Material</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
          Selecciona un archivo PDF de tu computadora para subirlo a la plataforma.
        </p>

        <form action={createMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
              Nombre del Material
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="Ej: Repartido Práctico 1"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
              Archivo (PDF u otros)
            </label>
            <input 
              type="file" 
              name="file" 
              accept=".pdf,.doc,.docx"
              required 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #CBD5E1', fontSize: '0.95rem', background: '#F8FAFC', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', flex: 1 }}>
              Subir Archivo
            </button>
            <a href={`/admin/folders/${params.folderId}`} style={{ background: '#F1F5F9', color: '#475569', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center', flex: 1 }}>
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}