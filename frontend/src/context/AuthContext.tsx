import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, registerApi } from '../api/auth';
import { getCurrentUserApi } from '../api/users';
import { LoginRequest, RegisterRequest, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('cortex_token')
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cortex_token');
      if (storedToken) {
        try {
          const currentUser = await getCurrentUserApi();
          setUser(currentUser);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('cortex_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await loginApi(data);
    localStorage.setItem('cortex_token', response.access_token);
    setToken(response.access_token);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    await registerApi(data);
    // After registration, automatically login
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    localStorage.removeItem('cortex_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
