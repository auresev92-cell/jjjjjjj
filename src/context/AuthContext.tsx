import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccountRecord, isCompletedProfile, saveAccountRecord } from '../lib/accountStore';
import { safeJsonParse } from '../utils/safeStorage';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  isGoogle?: boolean;
  role?: 'user' | 'admin';
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  [key: string]: any;
}

export interface AuthContextType {
  user: AuthUser | null;
  userRole: 'user' | 'admin' | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  profile: any;
  photos: string[];
  setAuthUser: (user: AuthUser | null) => void;
  setUserRole: (role: 'user' | 'admin' | null) => void;
  setProfileData: (profile: any, photos?: string[]) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isAdmin: false,
  loading: true,
  isAuthenticated: false,
  profile: null,
  photos: ['', '', '', '', '', ''],
  setAuthUser: () => {},
  setUserRole: () => {},
  setProfileData: () => {},
  logout: async () => {},
  refreshSession: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRoleState] = useState<'user' | 'admin' | null>(() => {
    try {
      const saved = localStorage.getItem('bavel_user_role');
      if (saved === 'admin' || saved === 'user') return saved;
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>(['', '', '', '', '', '']);

  const setUserRole = (role: 'user' | 'admin' | null) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('bavel_user_role', role);
    } else {
      localStorage.removeItem('bavel_user_role');
    }
  };

  const loadSession = async (): Promise<boolean> => {
    try {
      // 1. Check server session cookie first
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json().catch(() => null);

      if (data && data.success && data.user) {
        const email = data.user.email || '';
        const localAcc = getAccountRecord(email);
        const activeProfile = data.profile || localAcc?.profile || null;
        const activePhotos = (data.photos && data.photos.length > 0) ? data.photos : (localAcc?.photos || null);

        const profileCompleted = isCompletedProfile(activeProfile) || isCompletedProfile(data.user) || Boolean(localAcc);

        // Determine user role (admin if explicitly tagged or matching admin email)
        const determinedRole: 'user' | 'admin' = 
          data.user.role === 'admin' || 
          email.toLowerCase() === 'donkoff90@gmail.com' ||
          localStorage.getItem('bavel_user_role') === 'admin'
            ? 'admin' 
            : 'user';

        const fullUser: AuthUser = {
          ...data.user,
          name: activeProfile?.name || data.user.name,
          role: determinedRole,
          isAdmin: determinedRole === 'admin',
          onboardingCompleted: profileCompleted,
        };

        setUser(fullUser);
        setUserRoleState(determinedRole);
        localStorage.setItem('bavel_user_role', determinedRole);

        if (activeProfile) {
          setProfile(activeProfile);
          if (email) saveAccountRecord(email, activeProfile, activePhotos || undefined);
        }
        if (activePhotos && activePhotos.length > 0) {
          setPhotos(activePhotos);
        }

        try {
          localStorage.setItem('app_user', JSON.stringify(fullUser));
          if (activeProfile) localStorage.setItem('bavel_user_profile', JSON.stringify(activeProfile));
          if (activePhotos) localStorage.setItem('bavel_user_photos', JSON.stringify(activePhotos));
        } catch (e) {
          console.warn('Storage sync error:', e);
        }
        return true;
      }

      // 2. Check local fallback (stored session)
      const savedUserRaw = localStorage.getItem('app_user');
      const savedProfileRaw = localStorage.getItem('bavel_user_profile');
      const savedPhotosRaw = localStorage.getItem('bavel_user_photos');

      if (savedUserRaw) {
        const parsedUser = safeJsonParse(savedUserRaw, null);
        if (!parsedUser) return false;
        const parsedProfile = safeJsonParse(savedProfileRaw, null);
        const parsedPhotos = safeJsonParse(savedPhotosRaw, null);

        const email = parsedUser.email || '';
        const localAcc = getAccountRecord(email);
        const effectiveProfile = parsedProfile || localAcc?.profile || null;
        const effectivePhotos = parsedPhotos || localAcc?.photos || null;

        const isComplete = isCompletedProfile(effectiveProfile) || Boolean(parsedUser.onboardingCompleted) || Boolean(localAcc);

        const determinedRole: 'user' | 'admin' = 
          parsedUser.role === 'admin' || 
          email.toLowerCase() === 'donkoff90@gmail.com' ||
          localStorage.getItem('bavel_user_role') === 'admin'
            ? 'admin' 
            : 'user';

        const fullUser: AuthUser = {
          ...parsedUser,
          name: effectiveProfile?.name || parsedUser.name,
          role: determinedRole,
          isAdmin: determinedRole === 'admin',
          onboardingCompleted: isComplete,
        };

        setUser(fullUser);
        setUserRoleState(determinedRole);
        if (effectiveProfile) setProfile(effectiveProfile);
        if (effectivePhotos) setPhotos(effectivePhotos);
        return true;
      }

      // 3. Fallback to Auto-Login for direct open access ("accès libre") without Supabase
      const defaultUser: AuthUser = {
        id: 'steven_bavel',
        email: 'donkoff90@gmail.com',
        name: 'Steven',
        role: 'admin',
        isAdmin: true,
        onboardingCompleted: true
      };
      setUser(defaultUser);
      setUserRoleState('admin');
      try {
        localStorage.setItem('app_user', JSON.stringify(defaultUser));
        localStorage.setItem('bavel_user_role', 'admin');
      } catch {}
      return true;
    } catch (err) {
      console.warn('Auth verification exception:', err);
      // Fail-safe auto-login on exception
      const defaultUser: AuthUser = {
        id: 'steven_bavel',
        email: 'donkoff90@gmail.com',
        name: 'Steven',
        role: 'admin',
        isAdmin: true,
        onboardingCompleted: true
      };
      setUser(defaultUser);
      setUserRoleState('admin');
      return true;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const setAuthUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      const role = newUser.role || (newUser.isAdmin ? 'admin' : 'user');
      setUserRoleState(role);
      try {
        localStorage.setItem('app_user', JSON.stringify(newUser));
        localStorage.setItem('bavel_user_role', role);
      } catch (e) {
        console.warn(e);
      }
    } else {
      localStorage.removeItem('app_user');
      localStorage.removeItem('app_token');
      localStorage.removeItem('bavel_user_role');
      setUserRoleState(null);
    }
  };

  const setProfileData = (newProfile: any, newPhotos?: string[]) => {
    setProfile(newProfile);
    if (newPhotos) setPhotos(newPhotos);
    if (newProfile?.email) {
      saveAccountRecord(newProfile.email, newProfile, newPhotos);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
    setUser(null);
    setUserRoleState(null);
    setProfile(null);
    setPhotos(['', '', '', '', '', '']);
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_token');
    localStorage.removeItem('bavel_user_role');
    localStorage.removeItem('bavel_user_profile');
    localStorage.removeItem('bavel_user_photos');
  };

  const isAdmin = userRole === 'admin' || Boolean(user?.isAdmin) || user?.email?.toLowerCase() === 'donkoff90@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAdmin,
        loading,
        isAuthenticated: !!user,
        profile,
        photos,
        setAuthUser,
        setUserRole,
        setProfileData,
        logout,
        refreshSession: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
