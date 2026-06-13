import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginApi, registerClienteApi, type RegisterData } from '@/lib/api'; 

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
  login: (email: string, password: string) => Promise<{ success: boolean; role?: Role; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>; 
  logout: () => void;
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

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  const isAdmin = user?.role === 'admin';

  // ── MÉTODO DE INICIO DE SESIÓN (LOGIN TOTALMENTE CORREGIDO) ──
  const login = async (email: string, password: string): Promise<{ success: boolean; role?: Role; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass  = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      return { success: false, error: 'Ingresa tu email y contraseña.' };
    }

    const result = await loginApi(trimmedEmail, trimmedPass);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const apiUser = result.user; 
    const role: Role = apiUser?.rol === 'admin' ? 'admin' : 'client';

    const loggedUser: AuthUser = {
      id: Number(apiUser?.id ?? apiUser?.usuId ?? 0),
      name: apiUser?.cliNombre 
        ? `${apiUser.cliNombre} ${apiUser.cliApellido ?? ''}`.trim() 
        : (typeof apiUser?.usuario === 'string' ? apiUser.usuario : trimmedEmail.split('@')[0]), 
      email: trimmedEmail,
      role,
      // 🛠️ CORREGIDO: Validamos si 'usuario' es un string directo para asignarlo de inmediato
      username: typeof apiUser?.usuario === 'string' ? apiUser.usuario : (apiUser?.usuUsername ?? apiUser?.username ?? 'usuario'),
      tipoDocumento: apiUser?.cliTipoDocumento ?? apiUser?.tipoDocumento ?? 'DNI',
      documento: apiUser?.cliDocumento ?? apiUser?.documento,
      telefono: apiUser?.cliTelefono ?? apiUser?.telefono ?? null,
    };

    setToken(result.token ?? 'session-active');
    setUser(loggedUser);

    return { success: true, role };
  };

  // ── MÉTODO DE REGISTRO CON INYECCIÓN COMPLETA EN CALIENTE ──
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const result = await registerClienteApi(data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const loginResult = await login(data.Email, data.Contrasena);

    if (!loginResult.success) {
      return { success: false, error: 'Cuenta creada con éxito, pero falló el inicio de sesión automático.' };
    }

    // ⚡ ENRIQUECIMIENTO LOCAL OPTIMIZADO
    setUser((prevUser) => prevUser ? {
      ...prevUser,
      name: `${data.Nombres} ${data.Apellidos}`.trim(),
      username: data.NombreUsuario, // 🔑 CORREGIDO: Ahora sí se inyecta el username aquí
      tipoDocumento: data.TipoDocumento,
      documento: data.Documento,
    } : null);

    return { success: true };
  };
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── EXPORT DEL HOOK GLOBAL ──
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}