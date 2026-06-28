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
  cliNombre?: string;
  cliApellido?: string;
  usuUsername?: string;
  usuEmail?: string;
  cliTelefono?: string | null;
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
  const nombre   = raw?.cliNombre   ?? raw?.cli_nombre   ?? raw?.nombre   ?? raw?.nombres   ?? '';
  const apellido = raw?.cliApellido ?? raw?.cli_apellido ?? raw?.apellido ?? raw?.apellidos ?? '';
  const email    = raw?.usuario?.usuEmail ?? raw?.cliEmail ?? raw?.cli_email ?? raw?.email ?? '';
  const username = raw?.usuario?.usuUsername ?? raw?.usuUsername ?? raw?.username ?? raw?.nombreUsuario ?? String(email).split('@')[0] ?? '';
  const fechaRegistro = raw?.usuario?.usuFechaRegistro ?? raw?.cliFechaRegistro ?? raw?.cli_fecha_registro ?? raw?.fechaRegistro ?? '';
  const rol = raw?.usuario?.rol ?? raw?.rol ?? raw?.role ?? 'client';
  return {
    id:            Number(raw?.cliId ?? raw?.cli_id ?? raw?.id ?? 0),
    nombre:        String(nombre),
    apellido:      String(apellido),
    email:         String(email),
    username:      String(username),
    tipoDocumento: String(raw?.cliTipoDocumento ?? raw?.cli_documento_tipo ?? raw?.tipoDocumento ?? raw?.usuario?.cliTipoDocumento ?? 'DNI'),
    documento:     String(raw?.cliDocumento ?? raw?.cli_documento ?? raw?.documento ?? raw?.usuario?.cliDocumento ?? ''),
    telefono:      raw?.cliTelefono ?? raw?.cli_telefono ?? raw?.telefono ?? null,
    fechaRegistro: String(fechaRegistro),
    role:          rol === 'admin' ? 'admin' : 'client',
  };
}

// ── MAPEADOR DIRECCIÓN ──
function mapDireccion(raw: any): Direccion {
  return {
    dirId:           Number(raw?.dirId ?? raw?.dir_id ?? raw?.id ?? 0),
    dirCalle:        String(raw?.dirCalle ?? raw?.dir_calle ?? raw?.calle ?? ''),
    dirDistrito:     String(raw?.dirDistrito ?? raw?.dir_distrito ?? raw?.distrito ?? ''),
    dirProvincia:    String(raw?.dirProvincia ?? raw?.dir_provincia ?? raw?.provincia ?? ''),
    dirDepartamento: String(raw?.dirDepartamento ?? raw?.dir_departamento ?? raw?.departamento ?? ''),
    dirReferencia:   String(raw?.dirReferencia ?? raw?.dir_referencia ?? raw?.referencia ?? ''),
    dirPreferido:    Boolean(raw?.dirPreferido ?? raw?.dir_preferido ?? raw?.preferido ?? false),
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

// ── HOOK DIRECCIONES ──
export function useDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchJson<any>(`${API_BASE}/api/profile/direcciones`);
      const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.direcciones ?? []);
      setDirecciones(list.map(mapDireccion));
    } catch (err: any) {
      setError('No se pudieron cargar las direcciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearDireccion = useCallback(async (payload: DireccionPayload): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      await fetchJson(`${API_BASE}/api/profile/direcciones`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchDirecciones();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al crear dirección.' };
    } finally {
      setSaving(false);
    }
  }, [fetchDirecciones]);

  const editarDireccion = useCallback(async (id: number, payload: DireccionPayload): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      await fetchJson(`${API_BASE}/api/profile/direcciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await fetchDirecciones();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al editar dirección.' };
    } finally {
      setSaving(false);
    }
  }, [fetchDirecciones]);

  const eliminarDireccion = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      await fetchJson(`${API_BASE}/api/profile/direcciones/${id}`, { method: 'DELETE' });
      await fetchDirecciones();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Error al eliminar dirección.' };
    } finally {
      setSaving(false);
    }
  }, [fetchDirecciones]);

  useEffect(() => { fetchDirecciones(); }, [fetchDirecciones]);

  return { direcciones, loading, error, saving, refetch: fetchDirecciones, crearDireccion, editarDireccion, eliminarDireccion };
}