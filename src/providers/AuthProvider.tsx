import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';

interface AuthContextType {
  authToken: string | null;
  loggedIn: boolean;
  setAuthToken: (token: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          setAuthToken(token);
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
          setAuthToken(null);
          localStorage.removeItem('access_token');
          navigate('/');
        }
      } catch (error) {
        setLoggedIn(false);
        setAuthToken(null);
        localStorage.removeItem('access_token');
        navigate('/');
      }
    } else {
      setLoggedIn(false);
      setAuthToken(null);
      localStorage.removeItem('access_token');
      navigate('/');
    }
  }, [navigate,loggedIn]);

  return (
    <AuthContext.Provider value={{ authToken, loggedIn, setAuthToken, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
