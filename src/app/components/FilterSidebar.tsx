import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { ProductFilters } from '../types/database';

interface FilterSidebarProps {
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
}

const COLORS: { id: number; nombre: string; hex: string }[] = [
  { id: 1,  nombre: 'Blanco',   hex: '#FFFFFF' },
  { id: 2,  nombre: 'Negro',    hex: '#000000' },
  { id: 3,  nombre: 'Azul',     hex: '#0000FF' },
  { id: 4,  nombre: 'Verde',    hex: '#008000' },
  { id: 5,  nombre: 'Amarillo', hex: '#FFFF00' },
  { id: 6,  nombre: 'Rojo',     hex: '#FF0000' },
  { id: 7,  nombre: 'Rosa',     hex: '#FFC0CB' },
  { id: 8,  nombre: 'Morado',   hex: '#800080' },
  { id: 9,  nombre: 'Marrón',   hex: '#A52A2A' },
  { id: 10, nombre: 'Celeste',  hex: '#87CEEB' },
  { id: 11, nombre: 'Gris',     hex: '#808080' },
  { id: 12, nombre: 'Beige',    hex: '#F5F5DC' },
];

const TALLAS = ['S', 'M', 'L', 'XL'];
const SEXOS  = ['Mujer', 'Hombre', 'Unisex'];

const PRECIO_MIN = 0;
const PRECIO_MAX = 500;

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left py-1"
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase' }}>
        {label}
      </span>
      {expanded
        ? <ChevronUp style={{ width: 14, height: 14, color: '#9ca3af' }} />
        : <ChevronDown style={{ width: 14, height: 14, color: '#9ca3af' }} />
      }
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />;
}

export function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const [expanded, setExpanded] = useState({ genero: true, color: true, talla: true, disponibilidad: true, precio: true });
  const toggle = (k: keyof typeof expanded) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const toggleSexo  = (s: string)  => setFilters({ ...filters, sexo:   filters.sexo.includes(s)     ? filters.sexo.filter((x) => x !== s)   : [...filters.sexo, s] });
  const toggleColor = (id: number) => setFilters({ ...filters, colors: filters.colors.includes(id)   ? filters.colors.filter((x) => x !== id) : [...filters.colors, id] });
  const toggleTalla = (t: string)  => setFilters({ ...filters, tallas: filters.tallas.includes(t)    ? filters.tallas.filter((x) => x !== t)  : [...filters.tallas, t] });

  const hasActive =
    filters.sexo.length > 0 || filters.colors.length > 0 || filters.tallas.length > 0 ||
    filters.soloDisponibles || filters.precioMin > PRECIO_MIN || filters.precioMax < PRECIO_MAX;

  const resetAll = () => setFilters({ sexo: [], colors: [], tallas: [], soloDisponibles: false, precioMin: PRECIO_MIN, precioMax: PRECIO_MAX });

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div className="sticky" style={{ top: 80 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal style={{ width: 14, height: 14, color: '#111' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>
              Filtros
            </span>
          </div>
          {hasActive && (
            <button onClick={resetAll} style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }} className="hover:text-[#6d28d9] transition-colors">
              Limpiar
            </button>
          )}
        </div>

        <Divider />

        <div className="flex flex-col" style={{ gap: 16, marginTop: 16 }}>

          {/* Género */}
          <div>
            <SectionHeader label="Género" expanded={expanded.genero} onToggle={() => toggle('genero')} />
            {expanded.genero && (
              <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                {SEXOS.map((s) => {
                  const active = filters.sexo.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSexo(s)} className="flex items-center gap-2.5 text-left transition-colors group">
                      <span style={{ width: 14, height: 14, border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: active ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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
                {COLORS.map((c) => {
                  const active = filters.colors.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleColor(c.id)}
                      title={c.nombre}
                      style={{
                        width: 26, height: 26,
                        background: c.hex,
                        border: active ? '2px solid #7c3aed' : `1px solid ${['#FFFFFF','#FFFF00','#F5F5DC'].includes(c.hex) ? '#d1d5db' : 'transparent'}`,
                        outline: active ? '2px solid #7c3aed' : 'none',
                        outlineOffset: 2,
                        transition: 'transform 0.15s',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                      }}
                      className="hover:scale-110 transition-transform"
                    />
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
                {TALLAS.map((t) => {
                  const active = filters.tallas.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTalla(t)}
                      style={{
                        padding: '4px 12px',
                        border: `1.5px solid ${active ? '#7c3aed' : '#e5e7eb'}`,
                        background: active ? '#7c3aed' : 'transparent',
                        color: active ? '#fff' : '#374151',
                        fontSize: 12, fontWeight: active ? 700 : 400,
                        letterSpacing: '0.04em', transition: 'all 0.15s',
                      }}
                    >
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
              <label className="flex items-center gap-2.5 cursor-pointer mt-3">
                <span
                  onClick={() => setFilters({ ...filters, soloDisponibles: !filters.soloDisponibles })}
                  style={{ width: 14, height: 14, border: `1.5px solid ${filters.soloDisponibles ? '#7c3aed' : '#d1d5db'}`, background: filters.soloDisponibles ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {filters.soloDisponibles && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <input type="checkbox" checked={filters.soloDisponibles} onChange={(e) => setFilters({ ...filters, soloDisponibles: e.target.checked })} className="sr-only" />
                <span style={{ fontSize: 13, color: '#6b7280' }}>Solo en stock</span>
              </label>
            )}
          </div>

          <Divider />

          {/* Precio */}
          <div>
            <SectionHeader label="Precio" expanded={expanded.precio} onToggle={() => toggle('precio')} />
            {expanded.precio && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>S/ {filters.precioMin}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>S/ {filters.precioMax}</span>
                </div>
                <input
                  type="range" min={PRECIO_MIN} max={PRECIO_MAX} step={10}
                  value={filters.precioMax}
                  onChange={(e) => setFilters({ ...filters, precioMax: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: '#7c3aed' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}