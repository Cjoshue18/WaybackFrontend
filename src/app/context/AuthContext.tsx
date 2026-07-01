import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { loginApi, registerClienteApi, type RegisterData, type LoginApiResponse } from '@/lib/api';

export type Role = 'client' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  username?: string;
  tipoDocumento?: string;
  documento?: string;
  telefono?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: Role; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'wayback_auth_user';
const TOKEN_STORAGE_KEY = 'wayback_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  // [P14 FIX] Protegemos JSON.stringify con try/catch
  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Si el usuario tiene datos no serializables, lo ignoramos silenciosamente
    }
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  // [P16 FIX] isAdmin con useMemo para evitar recálculo innecesario en cada render
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  // ── MÉTODO DE INICIO DE SESIÓN ──
  const login = async (identifier: string, password: string): Promise<{ success: boolean; role?: Role; error?: string }> => {
    const trimmedIdentifier = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedIdentifier || !trimmedPass) {
      return { success: false, error: 'Ingresa tu usuario o correo y tu contraseña.' };
    }

    const result = await loginApi(trimmedIdentifier, trimmedPass);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.token) {
      return { success: false, error: 'El servidor no devolvió un token de autenticación. Contacta soporte.' };
    }

    const apiUser: LoginApiResponse = result.user ?? {};
    const role: Role = apiUser.rol === 'admin' ? 'admin' : 'client';

    // 🎯 FIX: Cambiado 'undefined' por '""' para que persistir en localStorage no destruya la llave del DNI
    // Sincronizamos y blindamos contra minúsculas (snake_case) evadiendo el tipado estricto
    const loggedUser: AuthUser = {
      id: Number(apiUser.id ?? apiUser.usuId ?? (apiUser as any).cli_id ?? 0),
      name: apiUser.cliNombre || (apiUser as any).cli_nombre
        ? `${apiUser.cliNombre ?? (apiUser as any).cli_nombre} ${apiUser.cliApellido ?? (apiUser as any).cli_apellido ?? ''}`.trim()
        : (apiUser.usuEmail ?? trimmedIdentifier).split('@')[0],
      email: apiUser.usuEmail ?? (apiUser as any).usu_email ?? trimmedIdentifier,
      role,
      username: apiUser.usuUsername ?? (apiUser as any).usu_username ?? 'usuario',
      tipoDocumento: apiUser.cliTipoDocumento ?? (apiUser as any).cli_documento_tipo ?? 'DNI',
      documento: apiUser.cliDocumento ?? (apiUser as any).cli_documento ?? '', 
      telefono: apiUser.cliTelefono ?? (apiUser as any).cli_telefono ?? null,
    };

    setUser(null);
    setToken(result.token);
    setUser(loggedUser);

    return { success: true, role };
  };

  // ── MÉTODO DE REGISTRO ──
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const trimmedData: RegisterData = {
      ...data,
      Email: data.Email.trim().toLowerCase(),
    };

    const result = await registerClienteApi(trimmedData);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const loginResult = await loginApi(trimmedData.Email, trimmedData.Contrasena);

    if (!loginResult.success || !loginResult.token) {
      return { success: false, error: 'Cuenta creada con éxito, pero falló el inicio de sesión automático.' };
    }

    const apiUser: LoginApiResponse = loginResult.user ?? {};
    const role: Role = apiUser.rol === 'admin' ? 'admin' : 'client';

    const registeredUser: AuthUser = {
      id: Number(apiUser.id ?? apiUser.usuId ?? 0),
      name: `${trimmedData.Nombres} ${trimmedData.Apellidos}`.trim(),
      email: trimmedData.Email,
      role,
      username: trimmedData.NombreUsuario,
      tipoDocumento: trimmedData.TipoDocumento,
      documento: trimmedData.Documento || '',
      telefono: apiUser.cliTelefono ?? null,
    };

    setToken(loginResult.token);
    setUser(registeredUser);

    return { success: true };
  };

  // ── MÉTODO PARA ACTUALIZAR DATOS DEL USUARIO LOCALMENTE Y FORZAR STORAGE ──
  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nuevoUsuario = { ...prev, ...partial };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nuevoUsuario));
      } catch (e) {
        console.error("Error al persistir el perfil actualizado:", e);
      }
      return nuevoUsuario;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}