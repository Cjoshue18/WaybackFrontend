import { useState } from 'react';
import { X, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router'; 
import { registerClienteApi } from '@/lib/api'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Control de vista: 'login' o 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Estados comunes de credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados específicos para Registro (Mapeado al RegisterDTO de C#)
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [docTipo, setDocTipo] = useState('DNI');
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNombreUsuario('');
    setDocTipo('DNI');
    setDocumento('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setShowPass(false);
    setError('');
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      // ── LÓGICA DE LOGIN ──
      const result = await login(email, password);
      setLoading(false);

      if (!result.success) {
        setError(result.error ?? 'Error al iniciar sesión.');
        return;
      }

      onClose();
      resetForm();

      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      // ── LÓGICA DE REGISTRO CON JSON EN PASCALCASE PARA C# ──
      const registerPayload = {
        Email: email.trim().toLowerCase(),
        NombreUsuario: nombreUsuario.trim(),
        Contrasena: password.trim(),
        Nombres: nombre.trim(),
        Apellidos: apellido.trim(),
        TipoDocumento: docTipo,
        Documento: documento.trim()
      };

      const result = await registerClienteApi(registerPayload);

      if (!result.success) {
        setLoading(false);
        setError(result.error || 'Error al procesar el registro en el servidor.');
        return;
      }

      // Auto-Login fluido tras registrarse exitosamente
      const loginResult = await login(email, password);
      setLoading(false);

      if (loginResult.success) {
        onClose();
        resetForm();
        navigate('/');
      } else {
        setMode('login');
        setError('¡Cuenta creada con éxito! Introduce tus datos para ingresar.');
      }
    }
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
            src="https://i.pinimg.com/736x/66/fc/b0/66fcb043002f1f21659c0d53341ce73f.jpg"
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
          className="flex flex-col flex-1 relative"
          style={{ background: '#fff', minWidth: 0 }}
        >
          {/* BOTÓN DE CERRAR FLOTANTE — No estorba ni empuja los campos del scroll */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* CUERPO DEL FORMULARIO — pt-12 y justify-start para liberar espacio arriba */}
          <div className="flex-1 flex flex-col justify-start px-10 pt-12 pb-10 overflow-y-auto">
            {/* brand */}
            <div className="mb-6 flex-shrink-0">
              <span
                style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.28em', color: '#7c3aed', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}
              >
                WAYBACK
              </span>
              <h3
                style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 6 }}
              >
                {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
              </h3>
              
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* COMPONENTES DE REGISTRO */}
              {mode === 'register' && (
                <>
                  {/* Tipo de Documento y Número */}
                  <div className="flex gap-3">
                    <div style={{ width: '35%' }}>
                      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Tipo Doc
                      </label>
                      <select
                        value={docTipo}
                        onChange={(e) => setDocTipo(e.target.value)}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">C.E.</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Número Documento
                      </label>
                      <input
                        type="text"
                        required
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        placeholder="60753444"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      />
                    </div>
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Gaby"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      />
                    </div>
                    <div className="flex-1">
                      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Apellido
                      </label>
                      <input
                        type="text"
                        required
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Lopez"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      />
                    </div>
                  </div>

                  {/* Nombre de Usuario (UBICADO EXACTAMENTE ARRIBA DEL EMAIL) */}
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      placeholder="gabylop123"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                      style={{ fontSize: 14 }}
                    />
                  </div>
                </>
              )}

              {/* Email (Login y Registro) */}
              <div>
                <label
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}
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

              {/* Contraseña (Login y Registro) */}
              <div>
                <label
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}
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
                    onClick={() => { setShowPass((v) => !v); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              {/* Teléfono Opcional (Solo en Registro) */}
              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Teléfono <span style={{ color: '#9ca3af', textTransform: 'none', fontWeight: 400 }}>(Opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="987654321"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                    style={{ fontSize: 14 }}
                  />
                </div>
              )}

              {/* Cuadro de Error Dinámico */}
              {error && (
                <p
                  className="px-3 py-2"
                  style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                  {error}
                </p>
              )}

              {/* Botón de Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors mt-2 flex-shrink-0"
                style={{ background: loading ? '#6d28d9' : '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
              >
                {loading
                  ? <><Loader style={{ width: 14, height: 14 }} className="animate-spin" /> Procesando solicitud…</>
                  : <><span>{mode === 'login' ? 'Ingresar' : 'Registrar'}</span><ArrowRight style={{ width: 14, height: 14 }} /></>
                }
              </button>
            </form>

            {/* Enlace alternador interactivo */}
            <div className="mt-5 text-center flex-shrink-0">
              <p style={{ fontSize: 13, color: '#4b5563' }}>
                {mode === 'login' ? (
                  <>
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setError(''); setMode('register'); }}
                      className="font-bold underline transition-colors"
                      style={{ color: '#7c3aed', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      Regístrate
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setError(''); setMode('login'); }}
                      className="font-bold underline transition-colors"
                      style={{ color: '#7c3aed', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      Inicia sesión
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Texto informativo */}
            <p
              className="mt-4 text-center flex-shrink-0"
              style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.6 }}
            >
              Las credenciales determinan tu nivel de acceso.<br />
              Clientes y administradores usan el mismo login.
            </p>

            {/* Info de conexión backend */}
            <div
              className="mt-4 p-3 text-center flex-shrink-0"
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