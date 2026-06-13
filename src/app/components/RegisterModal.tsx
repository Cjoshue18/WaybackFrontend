import React, { useState } from 'react';
import { X, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void; // Por si quieres permitirle regresar al login directo
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    Email: '',
    NombreUsuario: '',
    Contrasena: '',
    Nombres: '',
    Apellidos: '',
    TipoDocumento: 'DNI',
    Documento: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones locales rápidas basadas en el DTO de C#
    if (form.NombreUsuario.length < 6) {
      setError('El usuario debe tener mínimo 6 caracteres.');
      return;
    }
    if (form.Contrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    const res = await register(form);
    setLoading(false);

    if (res.success) {
      handleClose(); // Cierra el modal de inmediato ya logueado por el Auto-Login
    } else {
      setError(res.error || 'Ocurrió un error al procesar el registro.');
    }
  };

  const handleClose = () => {
    setForm({
      Email: '',
      NombreUsuario: '',
      Contrasena: '',
      Nombres: '',
      Apellidos: '',
      TipoDocumento: 'DNI',
      Documento: '',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch">
      {/* Backdrop con Blur */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      />

      {/* Tarjeta del Modal */}
      <div
        className="relative z-10 m-auto flex flex-col overflow-hidden"
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', backgroundColor: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Botón Cerrar */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 pt-2">
          <div className="mb-6">
            <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.28em', color: '#7c3aed', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              WAYBACK
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Crear Cuenta
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Únete para gestionar tus pedidos y favoritos
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-100 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Nombre de Usuario
              </label>
              <input required type="text" name="NombreUsuario" value={form.NombreUsuario} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="user123 (min. 6 caracteres)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Nombres
                </label>
                <input required type="text" name="Nombres" value={form.Nombres} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="John" />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Apellidos
                </label>
                <input required type="text" name="Apellidos" value={form.Apellidos} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input required type="email" name="Email" value={form.Email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="tu@correo.com" />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Contraseña
              </label>
              <input required type="password" name="Contrasena" value={form.Contrasena} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="•••••••• (min. 8 caracteres)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Tipo Doc.
                </label>
                <select name="TipoDocumento" value={form.TipoDocumento} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm h-[40px]">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Documento
                </label>
                <input required type="text" name="Documento" value={form.Documento} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#7c3aed] focus:bg-white transition-all text-sm" placeholder="12345678" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 text-white transition-colors mt-4"
              style={{ background: loading ? '#6d28d9' : '#7c3aed', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {loading ? (
                <><Loader style={{ width: 14, height: 14 }} className="animate-spin" /> Procesando cuenta...</>
              ) : (
                <><span className="text-white">Registrarse</span><ArrowRight style={{ width: 14, height: 14 }} /></>
              )}
            </button>
          </form>

          {onSwitchToLogin && (
            <p className="text-center mt-5" style={{ fontSize: '13px', color: '#4b5563' }}>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onSwitchToLogin();
                }}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-[#7c3aed]"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}