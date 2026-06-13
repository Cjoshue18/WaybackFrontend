import { User, Mail, Phone, MapPin, Calendar, Edit2, Lock, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // 🔑 Importamos el hook global

export function UserProfilePage() {
  const { user } = useAuth(); // 🔑 Extraemos el usuario autenticado en tiempo real

  // Si por alguna razón el usuario intenta entrar sin sesión, mostramos un estado de carga elegante
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-widest animate-pulse">
          Cargando datos del perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl mb-8 font-black uppercase tracking-tight text-[#7c3aed]">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
              <div className="flex flex-col items-center">
                {/* 🛠️ Avatar Dinámico: Muestra la inicial del nombre real del usuario */}
                <div className="w-32 h-32 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-5xl font-black mb-4 shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-16 h-16" />}
                </div>
                
                {/* 🛠️ Nombre e Identificador dinámicos */}
                <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
                  {user.name || 'Usuario Wayback'}
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
                  {user.role === 'admin' ? 'Administrador del Sistema' : 'Cliente Registrado'}
                </p>
                
                <button className="flex items-center gap-2 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Foto
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mt-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Estadísticas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Órdenes totales</span>
                  <span className="font-bold text-[#7c3aed]">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Favoritos</span>
                  <span className="font-bold text-[#7c3aed]">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Club Wayback Puntos</span>
                  <span className="font-bold text-black">150 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Información de la Cuenta</h3>
                <button className="text-[#7c3aed] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" />
                  Modificar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Real */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Correo Electrónico</p>
                    <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  </div>
                </div>

                {/* Nombre de Usuario Real (Username de la BD) */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Nombre de Usuario</p>
                    <p className="text-sm font-medium text-gray-800">@{user.username || 'sin_username'}</p>
                  </div>
                </div>

                {/* Documento de Identidad */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Documento ({user.tipoDocumento || 'DNI'})</p>
                    <p className="text-sm font-medium text-gray-800">{user.documento || 'No registrado'}</p>
                  </div>
                </div>

                {/* Teléfono de Contacto */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Teléfono</p>
                    <p className="text-sm font-medium text-gray-800">{user.telefono || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mb-6">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-6">Órdenes Recientes</h3>
              <div className="space-y-4">
                {[
                  { id: '#WAY-2026-003', date: '12 Jun 2026', status: 'En preparación', amount: 'S/ 189.00', items: 1 },
                  { id: '#WAY-2026-002', date: '28 May 2026', status: 'Entregado', amount: 'S/ 320.00', items: 2 },
                  { id: '#WAY-2026-001', date: '10 May 2026', status: 'Entregado', amount: 'S/ 95.00', items: 1 },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[rgba(124,58,237,0.08)] hover:border-[rgba(124,58,237,0.2)] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 mb-0.5">{order.id}</p>
                      <p className="text-xs text-gray-400 font-medium">{order.date} • {order.items} {order.items === 1 ? 'artículo' : 'artículos'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">{order.amount}</p>
                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${
                            order.status === 'Entregado' ? 'text-green-600' : 'text-[#7c3aed]'
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                      <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
                        Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-6">Seguridad</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Credenciales</p>
                    <p className="text-xs text-gray-400">Contraseña encriptada en el servidor</p>
                  </div>
                </div>
                <button className="text-[#7c3aed] hover:underline text-xs font-bold uppercase tracking-wider">
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}