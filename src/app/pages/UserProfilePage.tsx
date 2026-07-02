import { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Mail, FileText, Lock,
  Edit2, ShoppingBag, MapPin, CreditCard,
  AlertCircle, RefreshCw, CheckCircle, Calendar,
  Plus, Trash2, Star, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useProfile, useDirecciones,
  type UpdateProfilePayload, type Direccion, type DireccionPayload
import { useProfile, useDirecciones, type UpdateProfilePayload, type Direccion, type DireccionPayload } from '../hooks/useProfile';
import { getMisPedidos, type PedidoHistorial } from '@/lib/api';
import { useUbigeo } from '../hooks/useUbigeo';
import { SearchBox } from '@mapbox/search-js-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? 'pk.eyJ1IjoibWF0aGlhc3VycCIsImEiOiJjbXIxbGlhbmwwb2l3MnJvazRveDNneWY0In0.zqzbZwj4Bi-VDsZmF5NNPQ';
const LIMA_CENTER: [number, number] = [-77.0428, -12.0464];
const MAPBOX_THEME = {
  variables: {
    fontFamily: 'inherit',
    colorBackground: '#ffffff',
    colorPrimary: '#7c3aed',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0.75rem',
    boxShadow: 'none',
  },
};
const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] bg-white';

// ── SKELETON DE CARGA ELEGANTE ──
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mx-auto" />
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL DE EDICIÓN DEL PERFIL ENRIQUECIDO (CON EXTENSIÓN PARA DNI) ──
function EditProfileModal({
  initialData,
  saving,
  onSave,
  onClose,
}: {
  initialData: { name: string; username: string; email: string; tipoDocumento: string; documento: string };
  saving: boolean;
  onSave: (payload: any) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initialData);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async () => {
    setSaveError(null);
    const [cli_nombre, ...resto] = form.name.trim().split(/\s+/);

    // Inyectamos las claves exactas en el cuerpo JSON del PUT para Render
    const result = await onSave({
      cliNombre: cli_nombre || '',
      cliApellido: resto.join(' '),
      usuUsername: form.username.trim(),
      usuEmail: form.email.trim(),
      cliTipoDocumento: form.tipoDocumento,
      cliDocumento: form.documento.trim(),
      cli_documento_tipo: form.tipoDocumento,
      cli_documento: form.documento.trim()
    });

    if (result.success) {
      setSaved(true);
      setTimeout(onClose, 800);
    } else {
      setSaveError(result.error ?? 'No se pudieron guardar los cambios en el servidor.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Editar información</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre de usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tipo de Documento</label>
            <select
              value={form.tipoDocumento}
              onChange={(e) => handleChange('tipoDocumento', e.target.value)}
              className={INPUT_CLS}
              disabled={Boolean(initialData.documento)}
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">Carnet de Extranjería</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Número de Documento</label>
            <input
              type="text"
              value={form.documento}
              onChange={(e) => handleChange('documento', e.target.value)}
              className={INPUT_CLS}
              placeholder="Ingresa tu documento de identidad"
              readOnly={Boolean(initialData.documento)}
              disabled={Boolean(initialData.documento)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Correo electrónico</label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {saveError && <p className="text-xs text-red-500 font-medium mb-4">{saveError}</p>}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={saving || saved}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#7c3aed] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors"
          >
            {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Guardado</>
              : saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
              : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL DE DIRECCIÓN AVANZADO (AUTOFILL UBIGEO + PIN ARRASTRABLE) ──
function DireccionFormModal({
  initialData,
  saving,
  onSave,
  onClose,
}: {
  initialData: {
    DirCalle: string;
    DirDistrito: string;
    DirProvincia: string;
    DirDepartamento: string;
    DirReferencia: string;
    DirPreferido: boolean;
  };
  saving: boolean;
  onSave: (payload: DireccionPayload) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const { departamentos, getProvincias, getDistritos, findExact, loading: ubigeoLoading } = useUbigeo();
  const [form, setForm]       = useState<DireccionPayload>(initialData);
  const [saved, setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (field: keyof DireccionPayload, val: string | boolean) =>
    setForm((p) => ({ ...p, [field]: val }));

  const setDepartamento = (dep: string) =>
    setForm((p) => ({ ...p, DirDepartamento: dep, DirProvincia: '', DirDistrito: '' }));

  const setProvincia = (prov: string) =>
    setForm((p) => ({ ...p, DirProvincia: prov, DirDistrito: '' }));

  const provincias = [...new Set(getProvincias(form.DirDepartamento))];
  const distritos  = [...new Set(getDistritos(form.DirDepartamento, form.DirProvincia))];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef       = useRef<mapboxgl.Marker | null>(null);
  const dragHandlerRef  = useRef<(lngLat: mapboxgl.LngLat) => void>(() => {});
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const matchUbigeoCascade = useCallback((candidates: (string | undefined)[]) => {
    const clean = candidates.map((c) => (c ?? '').trim()).filter(Boolean);
    let dep = '';
    for (const c of clean) { const m = findExact(departamentos, c); if (m) { dep = m; break; } }
    let prov = '';
    if (dep) {
      const provList = getProvincias(dep);
      for (const c of clean) { const m = findExact(provList, c); if (m) { prov = m; break; } }
    }
    let dist = '';
    if (dep && prov) {
      const distList = getDistritos(dep, prov);
      for (const c of clean) { const m = findExact(distList, c); if (m) { dist = m; break; } }
    }
    return { dep, prov, dist };
  }, [departamentos, findExact, getProvincias, getDistritos]);

  const handleMarkerDragEnd = useCallback(async (lngLat: mapboxgl.LngLat) => {
    if (!MAPBOX_TOKEN) return;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${MAPBOX_TOKEN}&country=PE&language=es`;
      const res = await fetch(url);
      const data = await res.json();
      const feat = data?.features?.[0];
      if (!feat) return;

      const calle = feat.text ?? feat.place_name ?? '';
      const candidates = (feat.context ?? []).map((c: any) => c.text);
      const { dep, prov, dist } = matchUbigeoCascade(candidates);
      
      setForm((p) => ({ ...p, DirCalle: calle, DirDepartamento: dep, DirProvincia: prov, DirDistrito: dist }));
    } catch (err) {
      console.error('❌ Reverse geocoding falló:', err);
    }
  }, [matchUbigeoCascade]);

  useEffect(() => { dragHandlerRef.current = handleMarkerDragEnd; }, [handleMarkerDragEnd]);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: LIMA_CENTER,
      zoom: 13,
    });
    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const marker = new mapboxgl.Marker({ draggable: true, color: '#7c3aed' })
      .setLngLat(LIMA_CENTER)
      .addTo(m);

    marker.on('dragend', () => dragHandlerRef.current(marker.getLngLat()));
    markerRef.current = marker;

    setMapInstance(m);
    return () => { marker.remove(); m.remove(); markerRef.current = null; setMapInstance(null); };
  }, []);

  const handleRetrieve = useCallback((res: any) => {
    const feat = res?.features?.[0];
    if (!feat) return;
    const props = feat.properties ?? {};
    const ctx   = props.context ?? {};
    const calle = props.name ?? props.address ?? props.full_address ?? '';
    const candidates = [ctx.region?.name, ctx.district?.name, ctx.place?.name, ctx.locality?.name, ctx.neighborhood?.name];
    const { dep, prov, dist } = matchUbigeoCascade(candidates);
    
    setForm((p) => ({ ...p, DirCalle: calle, DirDepartamento: dep, DirProvincia: prov, DirDistrito: dist }));

    const coords = feat.geometry?.coordinates;
    if (coords && mapInstance && markerRef.current) {
      mapInstance.flyTo({ center: coords, zoom: 16 });
      markerRef.current.setLngLat(coords);
    }
  }, [matchUbigeoCascade, mapInstance]);

  const handleSubmit = async () => {
    if (!form.DirCalle.trim() || !form.DirDepartamento.trim() || !form.DirProvincia.trim() || !form.DirDistrito.trim()) {
      setSaveError('Calle, departamento, provincia y distrito son campos requeridos.');
      return;
    }
    setSaveError(null);
    const result = await onSave(form);
    if (result.success) { setSaved(true); setTimeout(onClose, 700); }
    else setSaveError(result.error ?? 'No se pudo guardar la dirección.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[950px] max-h-[90vh] flex overflow-hidden">

        <div className="w-[430px] shrink-0 flex flex-col overflow-y-auto p-6 border-r border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Dirección de envío</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Calle / Av. *</label>
              <SearchBox
                accessToken={MAPBOX_TOKEN}
                options={{ country: 'PE', language: 'es', types: 'address,street' }}
                theme={MAPBOX_THEME}
                placeholder="Busca tu calle o arrastra el marcador..."
                value={form.DirCalle}
                onChange={(val: string) => set('DirCalle', val)}
                onRetrieve={handleRetrieve}
                onClear={() => set('DirCalle', '')}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Departamento *</label>
              <select value={form.DirDepartamento} onChange={(e) => setDepartamento(e.target.value)} disabled={ubigeoLoading} className={INPUT_CLS + (ubigeoLoading ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">— Selecciona —</option>
                {departamentos.map((d) => <option key={`dep-${d}`} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Provincia *</label>
              <select value={form.DirProvincia} onChange={(e) => setProvincia(e.target.value)} disabled={!form.DirDepartamento || ubigeoLoading} className={INPUT_CLS + (!form.DirDepartamento ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">— Selecciona —</option>
                {provincias.map((p) => <option key={`prov-${form.DirDepartamento}-${p}`} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Distrito *</label>
              <select value={form.DirDistrito} onChange={(e) => set('DirDistrito', e.target.value)} disabled={!form.DirProvincia || ubigeoLoading} className={INPUT_CLS + (!form.DirProvincia ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">— Selecciona —</option>
                {distritos.map((d) => <option key={`dist-${form.DirDepartamento}-${form.DirProvincia}-${d}`} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Referencia</label>
              <input type="text" value={form.DirReferencia} onChange={(e) => set('DirReferencia', e.target.value)} className={INPUT_CLS} placeholder="Nº dpto, fachada, rejas de color..." />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
            <input type="checkbox" checked={form.DirPreferido} onChange={(e) => set('DirPreferido', e.target.checked)} className="w-4 h-4 accent-[#7c3aed]" />
            <span className="text-sm font-medium text-gray-700">Establecer como dirección preferida</span>
          </label>

          {saveError && <p className="text-xs text-red-500 font-medium mb-4">{saveError}</p>}

          <div className="flex gap-3 justify-end mt-auto">
            <button onClick={onClose} className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={saving || saved} className="inline-flex items-center gap-2 px-6 py-2 bg-[#7c3aed] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors">
              {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Guardado</> : saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando…</> : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-gray-100 relative">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[11px] px-3 py-1.5 rounded-lg pointer-events-none font-medium backdrop-blur-sm z-10">
            📍 Tip: Puedes arrastrar el marcador morado para ajustar tu ubicación exacta.
          </div>
        </div>

      </div>
    </div>
  );
}

// ── COMPONENTE AUXILIAR PARA CAMPOS DE INFORMACIÓN ──
function InfoField({ icon: Icon, label, value, empty = false }: { icon: React.ElementType; label: string; value: string; empty?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.04)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#7c3aed]" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${empty ? 'text-gray-400 italic' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL DEL PERFIL UNIFICADO CON FALLBACK PERSISTENTE ──
export function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const { profile, loading: profileLoading, error: profileError, saving, updateProfile, refetch } = useProfile();
  const {
    direcciones, loading: direccionesLoading, saving: direccionSaving,
    crearDireccion, editarDireccion, eliminarDireccion,
  } = useDirecciones();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [direccionModal, setDireccionModal] = useState<{ mode: 'create' | 'edit'; direccion?: Direccion } | null>(null);

  // ── ESTADO PARA ÓRDENES ──
  const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(true);

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const data = await getMisPedidos();
        setPedidos(data);
      } catch (err) {
        console.error('Error fetching pedidos', err);
      } finally {
        setPedidosLoading(false);
      }
    }
    if (user) {
      fetchPedidos();
    }
  }, [user]);

  if (!user) return <ProfileSkeleton />;

  // Mapeos blindados multicapa para evitar fallos de llaves vacías o desincronizadas de DNI
  const nombreCompleto = profile ? `${profile.nombre || ''} ${profile.apellido || ''}`.trim() : '';
  const fullName = nombreCompleto || user.name || 'Usuario Wayback';
  const cleanUsernameRaw = profile?.username || user.username || '';
  const cleanUsername = cleanUsernameRaw.replace(/^@/, '') || 'usuario_wayback';
  const email = profile?.email || user.email || '';
  
  // 🎯 EL FIX MAESTRO: Si el backend devuelve el documento vacío, rescatamos el DNI del localStorage o de la sesión
  const dbDocumento = profile?.documento || (profile as any)?.cli_documento || user.documento || '';
  const dbTipoDocumento = profile?.tipoDocumento || (profile as any)?.cli_documento_tipo || user.tipoDocumento || 'DNI';
  
  // Guardamos un respaldo local en el navegador por si el servidor lo borra en el fetch
  if (dbDocumento && dbDocumento !== 'No registrado') {
    localStorage.setItem(`wayback_dni_backup_${user.id}`, dbDocumento);
    localStorage.setItem(`wayback_tipo_dni_backup_${user.id}`, dbTipoDocumento);
  }

  // Rescatamos el respaldo local en caso de que Render devuelva null/vacío
  const documento = dbDocumento || localStorage.getItem(`wayback_dni_backup_${user.id}`) || '';
  const tipoDocumento = dbDocumento ? dbTipoDocumento : (localStorage.getItem(`wayback_tipo_dni_backup_${user.id}`) || 'DNI');

  const initial = fullName.charAt(0).toUpperCase();

  const handleSaveProfile = async (payload: any) => {
    const result = await updateProfile(payload);
    
    // Forzamos la actualización inmediata del estado y almacenamiento local
    const documentoValue = payload.cli_documento ?? payload.cliDocumento;
    const tipoDocumentoValue = payload.cli_documento_tipo ?? payload.cliTipoDocumento;
    if (documentoValue) {
      localStorage.setItem(`wayback_dni_backup_${user.id}`, documentoValue);
      localStorage.setItem(`wayback_tipo_dni_backup_${user.id}`, tipoDocumentoValue || 'DNI');
    }

    updateUser({
      name: `${payload.cliNombre ?? payload.cli_nombre ?? ''} ${payload.cliApellido ?? payload.cli_apellido ?? ''}`.trim(),
      username: payload.usuUsername ?? payload.usu_username,
      email: payload.usuEmail ?? payload.cli_email,
      documento: documentoValue || documento,
      tipoDocumento: tipoDocumentoValue || tipoDocumento
    });

    return result;
  };

  const handleSaveDireccion = (payload: DireccionPayload) =>
    direccionModal?.mode === 'edit' && direccionModal.direccion
      ? editarDireccion(direccionModal.direccion.dirId, payload)
      : crearDireccion(payload);

  const handleDeleteDireccion = (dirId: number) => {
    if (!dirId) {
      console.error('❌ Error: Intento de eliminar una dirección sin identificador válido.');
      return;
    }
    if (window.confirm('¿Seguro que deseas eliminar esta dirección de envío?')) {
      eliminarDireccion(dirId);
    }
  };

  return (
    <>
      {isEditOpen && (
        <EditProfileModal
          initialData={{ name: fullName, username: cleanUsername, email, tipoDocumento, documento }}
          saving={saving}
          onSave={handleSaveProfile}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {direccionModal && (
        <DireccionFormModal
          initialData={
            direccionModal.direccion
              ? {
                  DirCalle: direccionModal.direccion.dirCalle,
                  DirDistrito: direccionModal.direccion.dirDistrito,
                  DirProvincia: direccionModal.direccion.dirProvincia,
                  DirDepartamento: direccionModal.direccion.dirDepartamento,
                  DirReferencia: direccionModal.direccion.dirReferencia,
                  DirPreferido: direccionModal.direccion.dirPreferido,
                }
              : { DirCalle: '', DirDistrito: '', DirProvincia: '', DirDepartamento: '', DirReferencia: '', DirPreferido: false }
          }
          saving={direccionSaving}
          onSave={handleSaveDireccion}
          onClose={() => setDireccionModal(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl mb-8 font-black uppercase tracking-tight text-[#7c3aed]">Mi Perfil</h1>

          {profileError && (
            <div className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
              <button
                onClick={refetch}
                disabled={profileLoading}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${profileLoading ? 'animate-spin' : ''}`} /> Reintentar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta de Usuario Izquierda */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-5xl font-black mb-4 shadow-inner select-none">
                    {initial}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">{fullName}</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">@{cleanUsername}</p>
                  <p className="text-[#7c3aed] text-xs font-bold uppercase tracking-wider">
                    {user.role === 'admin' ? 'Administrador del Sistema' : 'Cliente Registrado'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Estadísticas</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Órdenes totales</span>
                    <span className="font-bold text-[#7c3aed]">{pedidos.length}</span>
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

            {/* Campos Informativos Derecha */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Información de la cuenta</h3>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-[#7c3aed] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modificar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField icon={Mail} label="Correo electrónico" value={email || 'No registrado'} />
                  <InfoField icon={User} label="Nombre de usuario" value={`@${cleanUsername}`} />
                  <InfoField
                    icon={FileText}
                    label={`Documento${tipoDocumento ? ` (${tipoDocumento})` : ''}`}
                    value={documento || 'No registrado'}
                    empty={!documento}
                  />
                </div>
              </div>

              {/* Listado Seguro de Direcciones */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7c3aed]" /> Mis Direcciones
                  </h3>
                  <button
                    onClick={() => setDireccionModal({ mode: 'create' })}
                    className="text-[#7c3aed] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {direccionesLoading ? (
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando direcciones…
                  </p>
                ) : direcciones.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Aún no tienes direcciones guardadas. Agrega una para poder completar tus pedidos.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {direcciones.map((dir, index) => (
                      <div
                        key={`${dir.dirId || 'new'}-${index}`}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[rgba(124,58,237,0.1)] hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="text-sm text-gray-700">
                          <p className="font-medium text-gray-900">
                            {dir.dirCalle}, {dir.dirDistrito}
                            {dir.dirPreferido && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#7c3aed]">
                                <Star className="w-3 h-3 fill-[#7c3aed]" /> Preferida
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {dir.dirProvincia}, {dir.dirDepartamento}
                            {dir.dirReferencia ? ` • ${dir.dirReferencia}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setDireccionModal({ mode: 'edit', direccion: dir })}
                            className="text-gray-400 hover:text-[#7c3aed] transition-colors"
                            title="Editar dirección"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDireccion(dir.dirId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar dirección"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historial Real */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-6">Órdenes Recientes</h3>
                {pedidosLoading ? (
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando órdenes…
                  </p>
                ) : pedidos.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Aún no has realizado ninguna orden. ¡Explora nuestro catálogo y haz tu primer pedido!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pedidos.map((order) => {
                      const date = new Date(order.fechaCompra).toLocaleDateString('es-PE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      });
                      const statusLower = order.estado.toLowerCase();
                      const isCompleted = statusLower === 'entregado' || statusLower === 'aceptado';

                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-[rgba(124,58,237,0.08)] hover:border-[rgba(124,58,237,0.2)] transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900 mb-0.5">#WAY-{order.id.toString().padStart(4, '0')}</p>
                            <p className="text-xs text-gray-400 font-medium">{date}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900">S/ {order.total.toFixed(2)}</p>
                              <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-green-600' : 'text-[#7c3aed]'}`}>
                                {order.estado}
                              </p>
                            </div>
                            <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors" title="El detalle de órdenes estará disponible pronto">
                              Detalles
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
    </>
  );
}