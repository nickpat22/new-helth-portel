import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ROLES, DEMO_ACCOUNTS } from './types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => { success: boolean; error?: string };
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
    const savedUser = localStorage.getItem('udhrs_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('udhrs_user');
      }
    }
  }, []);

  const login = (userId: string, password: string): { success: boolean; error?: string } => {
    const trimmedId = userId.trim();
    const account = DEMO_ACCOUNTS[trimmedId];

    if (!account) {
      return { success: false, error: 'Invalid User ID. Please check and try again.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (selectedRole && account.user.role !== selectedRole) {
      return { success: false, error: `This ID belongs to a ${account.user.role} account. Please select the correct role.` };
    }

    setUser(account.user);
    localStorage.setItem('udhrs_user', JSON.stringify(account.user));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem('udhrs_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const roleConfig = ROLES[user.role];
    return roleConfig.permissions.includes(permission as any);
  };

  const canAccessModule = (module: string): boolean => {
    if (!user) return false;
    const roleConfig = ROLES[user.role];
    return roleConfig.dashboardModules.includes(module);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
