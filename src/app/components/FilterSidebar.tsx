import { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { Slider } from '@/app/components/ui/slider';
import { getCategorias, getEstilos, getColores } from '@/lib/api';
import type { Categoria, Estilo, Color } from '@/lib/api';

interface FilterSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
  showCategorias?: boolean;
}

// Colors are now fetched dynamically

const TALLAS = ['S', 'M', 'L', 'XL'];
const SEXOS  = ['Mujer', 'Hombre', 'Unisex'];
const PRECIO_MIN = 0;
const PRECIO_MAX = 500;

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center justify-between w-full text-left py-1">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase' }}>
        {label}
      </span>
      {expanded ? <ChevronUp style={{ width: 14, height: 14, color: '#9ca3af' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#9ca3af' }} />}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />;
}

export function FilterSidebar({ filters, setFilters, showCategorias = true }: FilterSidebarProps) {
  const [expanded, setExpanded] = useState({ categorias: true, estilos: true, genero: true, color: true, talla: true, disponibilidad: true, precio: true });
  const toggle = (k: keyof typeof expanded) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const [categoriasList, setCategoriasList] = useState<Categoria[]>([]);
  const [estilosList, setEstilosList] = useState<Estilo[]>([]);
  const [coloresList, setColoresList] = useState<Color[]>([]);

  useEffect(() => {
    getCategorias().then(setCategoriasList).catch(console.error);
    getEstilos().then(setEstilosList).catch(console.error);
    getColores().then(setColoresList).catch(console.error);
  }, []);

  const toggleCategoria = (id: string) => {
    const actuales: string[] = Array.isArray(filters.categorias) ? filters.categorias : [];
    setFilters({ 
      ...filters, 
      categorias: actuales.includes(id) ? actuales.filter((x: string) => x !== id) : [...actuales, id] 
    });
  };

  const toggleEstilo = (id: string) => {
    const actuales: string[] = Array.isArray(filters.estilos) ? filters.estilos : [];
    setFilters({ 
      ...filters, 
      estilos: actuales.includes(id) ? actuales.filter((x: string) => x !== id) : [...actuales, id] 
    });
  };

  // Género es de selección única: elegir otro reemplaza al anterior, no se acumulan.
  const toggleSexo = (s: string) => {
    const actuales: string[] = Array.isArray(filters.sexo) ? filters.sexo : [];
    setFilters({
      ...filters,
      sexo: actuales.includes(s) ? [] : [s],
    });
  };

  const toggleColor = (id: number) => {
    const actuales: number[] = Array.isArray(filters.colors) ? filters.colors : [];
    setFilters({ 
      ...filters, 
      colors: actuales.includes(id) ? actuales.filter((x: number) => x !== id) : [...actuales, id] 
    });
  };

  const toggleTalla = (t: string) => {
    const actuales: string[] = Array.isArray(filters.tallas) ? filters.tallas : [];
    setFilters({ 
      ...filters, 
      tallas: actuales.includes(t) ? actuales.filter((x: string) => x !== t) : [...actuales, t] 
    });
  };

  const hasActive =
    (filters.categorias?.length ?? 0) > 0 || 
    (filters.estilos?.length ?? 0) > 0 || 
    (filters.sexo?.length ?? 0) > 0 || 
    (filters.colors?.length ?? 0) > 0 || 
    (filters.tallas?.length ?? 0) > 0 || 
    filters.soloDisponibles || 
    filters.precioMin > PRECIO_MIN ||
    filters.precioMax < PRECIO_MAX;

  const resetAll = () => setFilters({ categorias: [], estilos: [], sexo: [], colors: [], tallas: [], soloDisponibles: false, precioMin: PRECIO_MIN, precioMax: PRECIO_MAX });

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div className="sticky" style={{ top: 80 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal style={{ width: 14, height: 14, color: '#111' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Filtros</span>
          </div>
          {hasActive && (
            <button onClick={resetAll} style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }} className="hover:text-[#6d28d9] transition-colors">
              Limpiar
            </button>
          )}
        </div>

        <Divider />

        <div className="flex flex-col" style={{ gap: 16, marginTop: 16 }}>
          
          {/* Categorías */}
          {showCategorias && (
            <>
              <div>
                <SectionHeader label="Prendas" expanded={expanded.categorias} onToggle={() => toggle('categorias')} />
                {expanded.categorias && (
                  <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                    {categoriasList.map((c) => {
                      const actuales: string[] = Array.isArray(filters.categorias) ? filters.categorias : [];
                      const idStr = String(c.cat_id);
                      const active = actuales.includes(idStr);
                      return (
                        <button type="button" key={c.cat_id} onClick={() => toggleCategoria(idStr)} className="flex items-center gap-2.5 text-left transition-colors group">
                          <span style={{ width: 14, height: 14, border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: active ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {active && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </span>
                          <span style={{ fontSize: 13, color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">{c.cat_nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Divider />
            </>
          )}

          {/* Estilos */}
          <div>
            <SectionHeader label="Estilos" expanded={expanded.estilos} onToggle={() => toggle('estilos')} />
            {expanded.estilos && (
              <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                {estilosList.map((e) => {
                  const actuales: string[] = Array.isArray(filters.estilos) ? filters.estilos : [];
                  const idStr = String(e.est_id);
                  const active = actuales.includes(idStr);
                  return (
                    <button type="button" key={e.est_id} onClick={() => toggleEstilo(idStr)} className="flex items-center gap-2.5 text-left transition-colors group">
                      <span style={{ width: 14, height: 14, border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: active ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span style={{ fontSize: 13, color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">{e.est_nombre}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Género */}
          <div>
            <SectionHeader label="Género" expanded={expanded.genero} onToggle={() => toggle('genero')} />
            {expanded.genero && (
              <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                {SEXOS.map((s: string) => {
                  const actuales: string[] = Array.isArray(filters.sexo) ? filters.sexo : [];
                  const active = actuales.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => toggleSexo(s)} className="flex items-center gap-2.5 text-left transition-colors group">
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />}
                      </span>
                      <span style={{ fontSize: 13, color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">{s}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Color */}
          <div>
            <SectionHeader label="Color" expanded={expanded.color} onToggle={() => toggle('color')} />
            {expanded.color && (
              <div className="grid mt-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
                {coloresList.map((c) => {
                  const actuales: number[] = Array.isArray(filters.colors) ? filters.colors : [];
                  const active = actuales.includes(c.colorId);
                  return (
                    <button type="button" key={c.colorId} onClick={() => toggleColor(c.colorId)} style={{ width: 26, height: 26, background: c.colorHex, border: active ? '2px solid #7c3aed' : `1px solid ${['#FFFFFF', '#FFF'].includes(c.colorHex.toUpperCase()) ? '#d1d5db' : 'transparent'}`, outline: active ? '2px solid #7c3aed' : 'none', outlineOffset: 2, transition: 'transform 0.15s', transform: active ? 'scale(1.15)' : 'scale(1)' }} className="hover:scale-110 transition-transform" />
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Talla */}
          <div>
            <SectionHeader label="Talla" expanded={expanded.talla} onToggle={() => toggle('talla')} />
            {expanded.talla && (
              <div className="flex flex-wrap mt-3" style={{ gap: 6 }}>
                {TALLAS.map((t: string) => {
                  const actuales: string[] = Array.isArray(filters.tallas) ? filters.tallas : [];
                  const active = actuales.includes(t);
                  return (
                    <button type="button" key={t} onClick={() => toggleTalla(t)} style={{ padding: '4px 12px', border: `1.5px solid ${active ? '#7c3aed' : '#e5e7eb'}`, background: active ? '#7c3aed' : 'transparent', color: active ? '#fff' : '#374151', fontSize: 12, fontWeight: active ? 700 : 400, letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Disponibilidad */}
          <div>
            <SectionHeader label="Disponibilidad" expanded={expanded.disponibilidad} onToggle={() => toggle('disponibilidad')} />
            {expanded.disponibilidad && (
              <label className="flex items-center gap-2.5 cursor-pointer mt-3 group">
                <input type="checkbox" checked={filters.soloDisponibles || false} onChange={(e) => setFilters({ ...filters, soloDisponibles: e.target.checked })} className="sr-only" />
                <span style={{ width: 14, height: 14, border: `1.5px solid ${filters.soloDisponibles ? '#7c3aed' : '#d1d5db'}`, background: filters.soloDisponibles ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {filters.soloDisponibles && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <span style={{ fontSize: 13, color: filters.soloDisponibles ? '#7c3aed' : '#6b7280', fontWeight: filters.soloDisponibles ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">Solo en stock</span>
              </label>
            )}
          </div>

          <Divider />

          {/* Precio */}
          <div>
            <SectionHeader label="Precio" expanded={expanded.precio} onToggle={() => toggle('precio')} />
            {expanded.precio && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex flex-col flex-1">
                    <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Mínimo (S/)</label>
                    <input 
                      type="number" 
                      min={PRECIO_MIN} 
                      max={PRECIO_MAX} 
                      value={filters.precioMin ?? PRECIO_MIN} 
                      onChange={(e) => setFilters({ ...filters, precioMin: Number(e.target.value) })}
                      className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#7c3aed]"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Máximo (S/)</label>
                    <input 
                      type="number" 
                      min={PRECIO_MIN} 
                      max={PRECIO_MAX} 
                      value={filters.precioMax ?? PRECIO_MAX} 
                      onChange={(e) => setFilters({ ...filters, precioMax: Number(e.target.value) })}
                      className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#7c3aed]"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                </div>
                <div className="mt-8 px-2">
                  <Slider
                    min={PRECIO_MIN}
                    max={PRECIO_MAX}
                    step={10}
                    value={[filters.precioMin ?? PRECIO_MIN, filters.precioMax ?? PRECIO_MAX]}
                    onValueChange={(values) => {
                      setFilters({ ...filters, precioMin: values[0], precioMax: values[1] });
                    }}
                    className="[&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-range]]:bg-[#7c3aed] [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-[#7c3aed] [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:h-4"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}