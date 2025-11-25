import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiPost, apiDelete, apiGet } from '@/react-app/utils/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isPending: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'sb-access-token';
const REFRESH_TOKEN_KEY = 'sb-refresh-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const fetchUser = async () => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        setUser(null);
        setIsPending(false);
        return;
      }

try {
	        const userData = await apiGet<User>('/api/users/me');
	        setUser(userData);
	      } catch (e) {
        setUser(null);
        clearTokens();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      clearTokens();
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
const data = await apiPost<{ user: User, session: { access_token: string, refresh_token: string } }>('/api/auth/login', { email, password });
    
    // Armazenar tokens
    if (data.session) {
      setTokens(data.session.access_token, data.session.refresh_token);
    }
    
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
const data = await apiPost<{ user: User, session: { access_token: string, refresh_token: string } }>('/api/auth/register', { email, password, name });
    
    // Armazenar tokens
    if (data.session) {
      setTokens(data.session.access_token, data.session.refresh_token);
    }
    
    setUser(data.user);
  };

  const logout = async () => {
    const token = getAccessToken();
    
    if (token) {
      try {
await apiPost('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isPending, login, register, logout, fetchUser, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
