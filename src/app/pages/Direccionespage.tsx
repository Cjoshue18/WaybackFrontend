import { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Plus, Edit2, Trash2, Star, AlertCircle, RefreshCw, CheckCircle, X } from 'lucide-react';
import { useDirecciones, type Direccion, type DireccionPayload } from '../hooks/useProfile';
import { useUbigeo } from '../hooks/useUbigeo';
import { SearchBox } from '@mapbox/search-js-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';
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

const EMPTY_FORM: DireccionPayload = {
  DirCalle: '', DirDistrito: '', DirProvincia: '',
  DirDepartamento: '', DirReferencia: '', DirPreferido: false,
};

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] bg-white';

// ── FORMULARIO ──────────────────────────────────────────────────────────────
function DireccionForm({
  initial, saving, onSave, onClose,
}: {
  initial?: Direccion;
  saving: boolean;
  onSave: (p: DireccionPayload) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const { departamentos, getProvincias, getDistritos, findExact, loading: ubigeoLoading } = useUbigeo();

  const [form, setForm] = useState<DireccionPayload>(
    initial
      ? {
          DirCalle:        initial.dirCalle,
          DirDistrito:     initial.dirDistrito,
          DirProvincia:    initial.dirProvincia,
          DirDepartamento: initial.dirDepartamento,
          DirReferencia:   initial.dirReferencia,
          DirPreferido:    initial.dirPreferido,
        }
      : EMPTY_FORM
  );
  const [saved, setSaved]     = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const set = (field: keyof DireccionPayload, val: string | boolean) =>
    setForm((p) => ({ ...p, [field]: val }));

  const setDepartamento = (dep: string) =>
    setForm((p) => ({ ...p, DirDepartamento: dep, DirProvincia: '', DirDistrito: '' }));

  const setProvincia = (prov: string) =>
    setForm((p) => ({ ...p, DirProvincia: prov, DirDistrito: '' }));

  const provincias = getProvincias(form.DirDepartamento);
  const distritos  = getDistritos(form.DirDepartamento, form.DirProvincia);

  // ── Map instance ──────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: LIMA_CENTER,
      zoom: 12,
    });
    m.addControl(new mapboxgl.NavigationControl(), 'top-right');
    setMapInstance(m);
    return () => { m.remove(); setMapInstance(null); };
  }, []);

  // ── Mapbox retrieve → auto-fill ubigeo selects ───────────────────────────
  const handleRetrieve = useCallback((res: any) => {
    const feat = res?.features?.[0];
    if (!feat) return;

    const props = feat.properties ?? {};
    const ctx   = props.context ?? {};

    // DirCalle: street name + number (e.g. "Av. Benavides 5440")
    const calle = props.name ?? props.address ?? props.full_address ?? '';

    // Administrative divisions from Mapbox context
    const rawDep  = (ctx.region?.name  ?? '').trim();
    const rawProv = (ctx.district?.name ?? '').trim();
    const rawDist = (ctx.place?.name ?? ctx.locality?.name ?? '').trim();

    // Case-insensitive match against loaded ubigeo to keep selects consistent
    const dep  = findExact(departamentos, rawDep)  || rawDep;
    const prov = findExact(getProvincias(dep), rawProv) || rawProv;
    const dist = findExact(getDistritos(dep, prov), rawDist) || rawDist;

    setForm((p) => ({
      ...p,
      DirCalle:        calle,
      DirDepartamento: dep,
      DirProvincia:    prov,
      DirDistrito:     dist,
    }));
  }, [departamentos, findExact, getProvincias, getDistritos]);

  const handleSubmit = async () => {
    if (!form.DirCalle.trim() || !form.DirDistrito.trim() || !form.DirDepartamento.trim()) {
      setFormErr('Calle, distrito y departamento son obligatorios.');
      return;
    }
    setFormErr(null);
    const result = await onSave(form);
    if (!result.success) { setFormErr(result.error ?? 'Error al guardar.'); return; }
    setSaved(true);
    setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[900px] max-h-[90vh] flex overflow-hidden">

        {/* ── Left: form ── */}
        <div className="w-[420px] shrink-0 flex flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">
              {initial ? 'Editar dirección' : 'Nueva dirección'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {/* Calle — Mapbox SearchBox */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Calle / Av. *
              </label>
              <SearchBox
                accessToken={MAPBOX_TOKEN}
                options={{ country: 'PE', language: 'es', types: 'address,street' }}
                theme={MAPBOX_THEME}
                placeholder="Av. Principal 123 — empieza a escribir…"
                value={form.DirCalle}
                onChange={(val: string) => set('DirCalle', val)}
                onRetrieve={handleRetrieve}
                onClear={() => set('DirCalle', '')}
                map={mapInstance ?? undefined}
                mapboxgl={mapboxgl}
                marker
              />
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Departamento *</label>
              <select
                value={form.DirDepartamento}
                onChange={(e) => setDepartamento(e.target.value)}
                disabled={ubigeoLoading}
                className={INPUT_CLS + (ubigeoLoading ? ' opacity-50 cursor-not-allowed' : '')}
              >
                <option value="">— Selecciona —</option>
                {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Provincia *</label>
              <select
                value={form.DirProvincia}
                onChange={(e) => setProvincia(e.target.value)}
                disabled={!form.DirDepartamento || ubigeoLoading}
                className={INPUT_CLS + (!form.DirDepartamento ? ' opacity-50 cursor-not-allowed' : '')}
              >
                <option value="">— Selecciona —</option>
                {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Distrito */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Distrito *</label>
              <select
                value={form.DirDistrito}
                onChange={(e) => set('DirDistrito', e.target.value)}
                disabled={!form.DirProvincia || ubigeoLoading}
                className={INPUT_CLS + (!form.DirProvincia ? ' opacity-50 cursor-not-allowed' : '')}
              >
                <option value="">— Selecciona —</option>
                {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Referencia */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Referencia</label>
              <input
                type="text"
                value={form.DirReferencia}
                onChange={(e) => set('DirReferencia', e.target.value)}
                className={INPUT_CLS}
                placeholder="Cerca al parque, puerta azul…"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-5 cursor-pointer">
            <input type="checkbox" checked={form.DirPreferido} onChange={(e) => set('DirPreferido', e.target.checked)} className="w-4 h-4 accent-[#7c3aed]" />
            <span className="text-sm font-medium text-gray-700">Establecer como dirección preferida</span>
          </label>

          {formErr && <p className="text-xs text-red-500 font-medium mb-4">{formErr}</p>}

          <div className="flex gap-3 justify-end mt-auto">
            <button onClick={onClose} className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || saved}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#7c3aed] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors"
            >
              {saved    ? <><CheckCircle className="w-3.5 h-3.5" /> Guardado</>
               : saving ? <><RefreshCw   className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
               :          (initial ? 'Guardar cambios' : 'Agregar dirección')}
            </button>
          </div>
        </div>

        {/* ── Right: map ── */}
        <div className="flex-1 min-w-0 bg-gray-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
        </div>

      </div>
    </div>
  );
}

// ── TARJETA ──────────────────────────────────────────────────────────────────
function DireccionCard({
  dir, onEdit, onDelete, deleting,
}: {
  dir: Direccion;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className={`relative bg-white rounded-2xl p-5 border transition-all ${dir.dirPreferido ? 'border-[#7c3aed] shadow-md' : 'border-[rgba(124,58,237,0.12)] shadow-sm'}`}>
      {dir.dirPreferido && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
          <Star className="w-3 h-3 fill-[#7c3aed]" /> Preferida
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[rgba(124,58,237,0.06)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPin className="w-4 h-4 text-[#7c3aed]" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{dir.dirCalle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {[dir.dirDistrito, dir.dirProvincia, dir.dirDepartamento].filter(Boolean).join(', ')}
          </p>
          {dir.dirReferencia && (
            <p className="text-xs text-gray-400 mt-0.5 italic">{dir.dirReferencia}</p>
          )}
        </div>
      </div>

      {confirmDel ? (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <p className="text-xs text-red-500 font-medium flex-1">¿Eliminar esta dirección?</p>
          <button onClick={() => setConfirmDel(false)} className="text-xs font-bold text-gray-400 hover:text-gray-700 px-2 py-1">No</button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors disabled:opacity-60"
          >
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#7c3aed] hover:underline">
            <Edit2 className="w-3 h-3" /> Editar
          </button>
          <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-600">
            <Trash2 className="w-3 h-3" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────
export function DireccionesPage() {
  const { direcciones, loading, error, saving, refetch, crearDireccion, editarDireccion, eliminarDireccion } = useDirecciones();
  const [modal, setModal]           = useState<'new' | number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await eliminarDireccion(id);
    setDeletingId(null);
  };

  const editTarget = typeof modal === 'number' ? direcciones.find((d) => d.dirId === modal) : undefined;

  return (
    <>
      {modal !== null && (
        <DireccionForm
          initial={editTarget}
          saving={saving}
          onSave={async (payload) => {
            if (modal === 'new') return crearDireccion(payload);
            return editarDireccion(modal as number, payload);
          }}
          onClose={() => setModal(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <a href="/perfil" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#7c3aed] transition-colors mb-1 block">
                ← Volver al perfil
              </a>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#7c3aed]">Mis Direcciones</h1>
            </div>
            <button
              onClick={() => setModal('new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva dirección
            </button>
          </div>

          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-64 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl p-8 border border-red-100 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button onClick={refetch} className="inline-flex items-center gap-2 px-5 py-2 bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          )}

          {!loading && !error && direcciones.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-dashed border-[rgba(124,58,237,0.2)] text-center">
              <MapPin className="w-12 h-12 text-[rgba(124,58,237,0.25)] mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Sin direcciones guardadas</p>
              <p className="text-xs text-gray-400 mb-5">Agrega tu primera dirección de envío</p>
              <button
                onClick={() => setModal('new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d28d9] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar dirección
              </button>
            </div>
          )}

          {!loading && !error && direcciones.length > 0 && (
            <div className="space-y-4">
              {[...direcciones]
                .sort((a, b) => (b.dirPreferido ? 1 : 0) - (a.dirPreferido ? 1 : 0))
                .map((dir) => (
                  <DireccionCard
                    key={dir.dirId}
                    dir={dir}
                    onEdit={() => setModal(dir.dirId)}
                    onDelete={() => handleDelete(dir.dirId)}
                    deleting={deletingId === dir.dirId}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
