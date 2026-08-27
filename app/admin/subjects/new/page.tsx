import { createSubject } from '@/app/actions/admin';

export default async function NewSubjectPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      {/* Barra superior */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <a href="/admin" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver al Panel
        </a>
        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>Crear Nueva Materia</span>
      </nav>

      {/* Formulario */}
      <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 5%' }}>
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: 0, marginBottom: '8px' }}>Nueva Materia</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '24px' }}>Completa los datos para registrar un nuevo espacio académico.</p>

          <form action={createSubject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Nombre de la Materia</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Física II"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Área o Categoría</label>
              <input 
                type="text" 
                name="area" 
                required 
                placeholder="Ej. Ciencias Exactas"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Descripción</label>
              <textarea 
                name="description" 
                rows={3}
                placeholder="Breve resumen de lo que trata la materia..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Icono (Emoji)</label>
                <input 
                  type="text" 
                  name="icon" 
                  defaultValue="📘"
                  maxLength={2}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Color de Cabecera</label>
                <input 
                  type="color" 
                  name="color" 
                  defaultValue="#4F46E5"
                  style={{ width: '100%', height: '42px', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Contraseña de Acceso para Alumnos</label>
              <input 
                type="text" 
                name="password" 
                required 
                placeholder="Clave que usarán los alumnos..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '10px' }}>
              Guardar y Crear Materia
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}