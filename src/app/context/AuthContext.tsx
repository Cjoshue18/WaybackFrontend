import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginApi } from '@/lib/api'; // Usamos el alias de tu configuración de Vite

export type Role = 'client' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  // 🛠️ Cambiado a función asíncrona para soportar HTTP requests
  login: (email: string, password: string) => Promise<{ success: boolean; role?: Role; error?: string }>;
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

  // 🛠️ Transformación a método Async para consultar al Backend real
  // src/app/context/AuthContext.tsx (Dentro de AuthProvider)

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

  const apiUser = result.user; // Este es el JSON de tu captura
  
  // 🛠️ Mapeamos "rol" e "usuario" de forma exacta a tu estado de React
  const role: Role = apiUser?.rol === 'admin' ? 'admin' : 'client';

  const loggedUser: AuthUser = {
    id: Number(apiUser?.id ?? 0),
    name: String(apiUser?.usuario ?? trimmedEmail.split('@')[0]), // Extrae "admin123"
    email: trimmedEmail,
    role,
  };

  setToken(result.token ?? 'session-active');
  setUser(loggedUser);

  // Retorna el rol real para que LoginModal.tsx ejecute el navigate correspondiente
  return { success: true, role };
};

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}