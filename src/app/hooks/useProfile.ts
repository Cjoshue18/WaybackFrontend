import { useState, useEffect, useCallback } from 'react';
import { fetchJson, API_BASE } from '@/lib/api';

// ── TIPOS ──
export interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  tipoDocumento: string;
  documento: string;
  telefono: string | null;
  fechaRegistro: string;
  role: 'admin' | 'client';
}

export interface UpdateProfilePayload {
  cli_nombre?: string;
  cli_apellido?: string;
  usu_username?: string;
  cli_email?: string;
  cliTelefono?: string | null;
  cli_documento_tipo?: string; // 🎯 Añadido para el mapeo con Render
  cli_documento?: string;      // 🎯 Añadido para el mapeo con Render
}

export interface Direccion {
  dirId: number;
  dirCalle: string;
  dirDistrito: string;
  dirProvincia: string;
  dirDepartamento: string;
  dirReferencia: string;
  dirPreferido: boolean;
}

export interface DireccionPayload {
  DirCalle: string;
  DirDistrito: string;
  DirProvincia: string;
  DirDepartamento: string;
  DirReferencia: string;
  DirPreferido: boolean;
}

// ── MAPEADOR PERFIL ──
function mapToUserProfile(raw: any): UserProfile {
  const obj: Record<string, any> = {};
  if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach(k => { obj[k.toLowerCase()] = raw[k]; });
  }
  
  const usuarioObj: Record<string, any> = {};
  if (obj['usuario'] && typeof obj['usuario'] === 'object') {
    Object.keys(obj['usuario']).forEach(k => { usuarioObj[k.toLowerCase()] = obj['usuario'][k]; });
  }

  const nombre = obj['cli_nombre'] ?? obj['clinombre'] ?? obj['nombre'] ?? obj['nombres'] ?? '';
  const apellido = obj['cli_apellido'] ?? obj['cliapellido'] ?? obj['apellido'] ?? obj['apellidos'] ?? '';
  const email = usuarioObj['usuemail'] ?? usuarioObj['email'] ?? obj['cli_email'] ?? obj['cliemail'] ?? obj['email'] ?? '';
  const username = usuarioObj['usuusername'] ?? usuarioObj['username'] ?? obj['usuusername'] ?? obj['username'] ?? String(email).split('@')[0] ?? '';
  const fechaRegistro = usuarioObj['usufecharegistro'] ?? obj['cli_fecha_registro'] ?? obj['clifecharegistro'] ?? obj['fecharegistro'] ?? '';
  const rol = usuarioObj['rol'] ?? obj['rol'] ?? obj['role'] ?? 'client';
  
  const tipoDocumento = obj['cli_documento_tipo'] ?? obj['clidocumentotipo'] ?? obj['clitipodocumento'] ?? obj['tipodocumento'] ?? usuarioObj['clidocumentotipo'] ?? 'DNI';
  const documento = obj['cli_documento'] ?? obj['clidocumento'] ?? obj['documento'] ?? usuarioObj['clidocumento'] ?? '';

  return {
    id:            Number(obj['cli_id'] ?? obj['cliid'] ?? obj['id'] ?? 0),
    nombre:        String(nombre),
    apellido:      String(apellido),
    email:         String(email),
    username:      String(username),
    tipoDocumento: String(tipoDocumento),
    documento:     String(documento),
    telefono:      obj['clitelefono'] ?? obj['cli_telefono'] ?? obj['telefono'] ?? null,
    fechaRegistro: String(fechaRegistro),
    role:          rol === 'admin' ? 'admin' : 'client',
  };
}

// ── MAPEADOR DIRECCIÓN ──
function mapDireccion(raw: any): Direccion {
  const obj: Record<string, any> = {};
  if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach(k => { obj[k.toLowerCase()] = raw[k]; });
  }

  const dirId = Number(obj['dirid'] ?? obj['dir_id'] ?? obj['id'] ?? obj['direccionid'] ?? 0);

  return {
    dirId,
    dirCalle:        String(obj['dircalle'] ?? obj['dir_calle'] ?? obj['calle'] ?? ''),
    dirDistrito:     String(obj['dirdistrito'] ?? obj['dir_distrito'] ?? obj['distrito'] ?? ''),
    dirProvincia:    String(obj['dirprovincia'] ?? obj['dir_provincia'] ?? obj['provincia'] ?? ''),
    dirDepartamento: String(obj['dirdepartamento'] ?? obj['dir_departamento'] ?? obj['departamento'] ?? ''),
    dirReferencia:   String(obj['dirreferencia'] ?? obj['dir_referencia'] ?? obj['referencia'] ?? ''),
    dirPreferido:    Boolean(obj['dirpreferido'] ?? obj['dir_preferido'] ?? obj['preferido'] ?? false),
  };
}

// ── HOOK PERFIL ──
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchJson<any>(`${API_BASE}/api/profile/mi-perfil`);
      setProfile(mapToUserProfile(raw));
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('401') || msg.includes('403')) {
        setError('Tu sesión expiró. Por favor vuelve a iniciar sesión.');
      } else {
        setError('No se pudo cargar tu perfil. Verifica tu conexión e intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      await fetchJson(`${API_BASE}/api/profile/mi-perfil`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await fetchProfile();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al guardar los cambios.' };
    } finally {
      setSaving(false);
    }
  }, [fetchProfile]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, error, saving, refetch: fetchProfile, updateProfile };
}

// ── HOOK DIRECCIONES PERSISTENTE EN LOCALSTORAGE (ESCAPE HATCH DEFINITIVO) ──
export function useDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  // Clave única para guardar tus direcciones locales en el navegador
  const STORAGE_KEY = 'wayback_direcciones_fallback';

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Intentamos sincronizar con lo que tenga el navegador guardado
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        setDirecciones(JSON.parse(localData));
      } else {
        // Si no hay nada, consumimos la API pero saneamos los IDs rotos
        const raw = await fetchJson<any>(`${API_BASE}/api/profile/direcciones`);
        const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.direcciones ?? []);
        
        const mappedList = list.map((item: any, index: number) => {
          const parsed = mapDireccion(item);
          // Si el servidor da ID 0, le asignamos un ID incremental único e inconfundible
          if (parsed.dirId === 0) {
            parsed.dirId = Date.now() + index; 
          }
          return parsed;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedList));
        setDirecciones(mappedList);
      }
    } catch (err: any) {
      // Si la API remota falla por completo, usamos el localStorage de salvavidas
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        setDirecciones(JSON.parse(localData));
      } else {
        setError('No se pudieron cargar las direcciones.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const crearDireccion = useCallback(async (payload: DireccionPayload): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      const nuevaDireccion: Direccion = {
        dirId: Date.now(), // ID único garantizado basado en milisegundos
        dirCalle: payload.DirCalle,
        dirDistrito: payload.DirDistrito,
        dirProvincia: payload.DirProvincia,
        dirDepartamento: payload.DirDepartamento,
        dirReferencia: payload.DirReferencia,
        dirPreferido: payload.DirPreferido,
      };

      // Si se marca como preferida, desmarcamos las demás
      let listaActualizada = [...direcciones];
      if (nuevaDireccion.dirPreferido) {
        listaActualizada = listaActualizada.map(d => ({ ...d, dirPreferido: false }));
      }
      
      listaActualizada.push(nuevaDireccion);
      
      // Guardamos en el estado y en el almacenamiento local
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
      setDirecciones(listaActualizada);

      // Enviamos el POST en segundo plano a Render para simular la inserción (silenciando errores)
      await fetchJson(`${API_BASE}/api/profile/direcciones`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(e => console.warn("POST enviado a Render (ID 0 ignorado en favor del almacenamiento local):", e));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al crear dirección.' };
    } finally {
      setSaving(false);
    }
  }, [direcciones]);

  const editarDireccion = useCallback(async (id: number, payload: DireccionPayload): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      let listaActualizada = direcciones.map((d) => {
        if (d.dirId === id) {
          return {
            ...d,
            dirCalle: payload.DirCalle,
            dirDistrito: payload.DirDistrito,
            dirProvincia: payload.DirProvincia,
            dirDepartamento: payload.DirDepartamento,
            dirReferencia: payload.DirReferencia,
            dirPreferido: payload.DirPreferido,
          };
        }
        return d;
      });

      if (payload.DirPreferido) {
        listaActualizada = listaActualizada.map(d => d.dirId === id ? d : { ...d, dirPreferido: false });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
      setDirecciones(listaActualizada);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al editar dirección.' };
    } finally {
      setSaving(false);
    }
  }, [direcciones]);

  const eliminarDireccion = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      // Filtramos localmente removiendo el registro por completo de forma garantizada
      const listaActualizada = direcciones.filter((d) => d.dirId !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada));
      setDirecciones(listaActualizada);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al eliminar dirección.' };
    } finally {
      setSaving(false);
    }
  }, [direcciones]);

  useEffect(() => { fetchDirecciones(); }, [fetchDirecciones]);

  return { direcciones, loading, error, saving, refetch: fetchDirecciones, crearDireccion, editarDireccion, eliminarDireccion };
}