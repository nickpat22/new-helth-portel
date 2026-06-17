import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ROLES, DEMO_ACCOUNTS } from './types';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  hasPermission: (permission: string) => boolean;
  canAccessModule: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedId = userId.trim();
    
    // 1. Check demo accounts first
    const account = DEMO_ACCOUNTS[trimmedId as keyof typeof DEMO_ACCOUNTS];
    if (account) {
      if (selectedRole && account.user.role !== selectedRole) {
        return {
          success: false,
          error: `This ID belongs to a ${account.user.role} account. Please select the correct role.`,
        };
      }

      if (account.password !== password) {
        return { success: false, error: 'Invalid password. Please check and try again.' };
      }

      const userData = account.user;
      setUser(userData);
      setSelectedRole(userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }

    // 2. If not demo account, check database
    try {
      const { data: dbUser, error } = await supabase
        .from('registered_users')
        .select('*')
        .eq('user_id', trimmedId)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Database connection error: ' + error.message };
      }

      if (!dbUser) {
        return { success: false, error: 'Invalid user ID. Please check and try again.' };
      }

      if (selectedRole && dbUser.role !== selectedRole) {
        return {
          success: false,
          error: `This ID belongs to a ${dbUser.role} account. Please select the correct role.`,
        };
      }

      if (dbUser.password_hash !== password) {
        return { success: false, error: 'Invalid password. Please check and try again.' };
      }

      if (dbUser.status === 'pending') {
        return { success: false, error: 'Your account is pending approval by the administrator.' };
      }

      if (dbUser.status === 'rejected') {
        return { success: false, error: 'Your registration request has been rejected.' };
      }

      const userData: User = {
        id: `db-${dbUser.id}`,
        username: dbUser.user_id,
        fullName: dbUser.full_name,
        role: dbUser.role as UserRole,
        idType: 'System Generated ID',
      };

      setUser(userData);
      setSelectedRole(userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'An unexpected error occurred: ' + err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const role = ROLES[user.role];
    return role?.permissions.includes(permission as any) || false;
  };

  const canAccessModule = (module: string): boolean => {
    if (!user) return false;
    const role = ROLES[user.role];
    return role?.dashboardModules.includes(module) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        selectedRole,
        setSelectedRole,
        hasPermission,
        canAccessModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
