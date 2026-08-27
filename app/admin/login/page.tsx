import { loginProfessor } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    error?: string;
  };
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const hasError = searchParams.error === 'true';

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2.5rem' }}>💼</span>
          <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '12px', marginBottom: '8px' }}>Acceso Profesor</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Ingresa tus credenciales de docente para administrar la plataforma.</p>
        </div>

        {/* Formulario de Login */}
        <form action={loginProfessor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Correo electrónico</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="profesor@ejemplo.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Contraseña</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {hasError && (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', textAlign: 'center' }}>
              Credenciales incorrectas. Inténtalo de nuevo.
            </div>
          )}

          <button type="submit" style={{ background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '8px' }}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/" style={{ color: '#64748B', fontSize: '0.85rem', textDecoration: 'none' }}>← Volver al inicio</a>
        </div>
      </div>
    </main>
  );
}