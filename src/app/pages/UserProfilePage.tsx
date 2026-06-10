import { User, Mail, Phone, MapPin, Calendar, Edit2, Lock } from 'lucide-react';

export function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl mb-8 text-[#7c3aed]">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-4xl mb-4">
                  <User className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">María González</h2>
                <p className="text-gray-500 text-sm mb-4">Cliente Premium</p>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Órdenes totales</span>
                  <span className="font-semibold text-[#7c3aed]">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favoritos</span>
                  <span className="font-semibold text-[#7c3aed]">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Puntos</span>
                  <span className="font-semibold text-[#7c3aed]">1,250</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
                <button className="text-[#7c3aed] hover:text-[#7c3aed] text-sm flex items-center gap-1">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-800">maria.gonzalez@email.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                    <p className="text-gray-800">+52 55 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dirección</p>
                    <p className="text-gray-800">Av. Reforma 123, CDMX</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Miembro desde</p>
                    <p className="text-gray-800">Enero 2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Órdenes Recientes</h3>
              <div className="space-y-4">
                {[
                  { id: '#ORD-2024-001', date: '15 May 2024', status: 'Entregado', amount: '$2,450', items: 3 },
                  { id: '#ORD-2024-002', date: '10 May 2024', status: 'En tránsito', amount: '$1,890', items: 2 },
                  { id: '#ORD-2024-003', date: '3 May 2024', status: 'Entregado', amount: '$3,200', items: 4 },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[rgba(124,58,237,0.08)] hover:border-[rgba(124,58,237,0.2)] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.items} artículos</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{order.amount}</p>
                        <p
                          className={`text-sm ${
                            order.status === 'Entregado'
                              ? 'text-green-600'
                              : 'text-[#7c3aed]'
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                      <button className="text-[#7c3aed] hover:text-[#7c3aed] text-sm">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Seguridad</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Contraseña</p>
                    <p className="text-sm text-gray-500">Última actualización hace 3 meses</p>
                  </div>
                </div>
                <button className="text-[#7c3aed] hover:text-[#7c3aed] text-sm">
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
