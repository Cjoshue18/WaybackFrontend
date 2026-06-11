import { useState } from 'react';
import { X, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router'; // 🚨 IMPORTA ESTO ARRIBA

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate(); // 🚨 DECLARA EL NAVIGATE

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  setError('');
  setLoading(true);

  const result = await login(email, password);
  setLoading(false);

  if (!result.success) {
    setError(result.error ?? 'Error al iniciar sesión.');
    return;
    }

onClose();
  resetForm();

  // 🚨 REDIRECCIÓN EN VIVO SEGÚN EL ROL DEVUELTO POR LA BD
  if (result.role === 'admin') {
    navigate('/admin/dashboard'); // Si es admin, lo mandamos al panel
  } else {
    navigate('/'); // Si es cliente, se queda en la tienda
  }
};

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPass(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch">
      {/* backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      />

      {/* modal */}
      <div
        className="relative z-10 m-auto flex overflow-hidden"
        style={{ width: '100%', maxWidth: 860, maxHeight: '95vh', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
      >
        {/* LEFT — editorial image panel */}
        <div
          className="hidden md:flex flex-col justify-end relative"
          style={{ width: 400, flexShrink: 0, background: '#0a0a0a', overflow: 'hidden' }}
        >
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=90"
            alt="Wayback editorial"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
          />
          <div className="relative z-10 p-10">
            <p
              className="text-white uppercase mb-3"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', opacity: 0.5 }}
            >
              Wayback · SS25
            </p>
            <h2
              className="text-white"
              style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}
            >
              Moda que<br />no caduca.
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
              Archivo Y2K. Prendas seleccionadas.<br />Una experiencia editorial única.
            </p>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div
          className="flex flex-col flex-1"
          style={{ background: '#fff', minWidth: 0 }}
        >
          {/* close */}
          <div className="flex justify-end p-5">
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* form body */}
          <div className="flex-1 flex flex-col justify-center px-10 pb-10">
            {/* brand */}
            <div className="mb-10">
              <span
                style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.28em', color: '#7c3aed', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}
              >
                WAYBACK
              </span>
              <h3
                style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 6 }}
              >
                Bienvenido
              </h3>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
                Inicia sesión para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* email */}
              <div>
                <label
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                  style={{ fontSize: 14 }}
                />
              </div>

              {/* password */}
              <div>
                <label
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all pr-11"
                    style={{ fontSize: 14 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              {/* error */}
              {error && (
                <p
                  className="px-3 py-2"
                  style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                  {error}
                </p>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors mt-2"
                style={{ background: loading ? '#6d28d9' : '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
              >
                {loading
                  ? <><Loader style={{ width: 14, height: 14 }} className="animate-spin" /> Conectando al servidor…</>
                  : <><span>Ingresar</span><ArrowRight style={{ width: 14, height: 14 }} /></>
                }
              </button>
            </form>

            {/* hint */}
            <p
              className="mt-6 text-center"
              style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.6 }}
            >
              Las credenciales determinan tu nivel de acceso.<br />
              Clientes y administradores usan el mismo login.
            </p>

            {/* 🛠️ Actualizado: Ya no es local, avisa que conecta a la API de Render */}
            <div
              className="mt-4 p-3 text-center"
              style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}
            >
              <p style={{ fontSize: 11, color: '#6b7280' }}>
                Conectado en vivo a la base de datos de <span className="font-semibold text-[#7c3aed]">Y2KVault API</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}