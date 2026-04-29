// ============================================================================
// AuthContext — Cookie-based authentication state for the entire app
// ============================================================================
//
// WHY WE MOVED FROM LOCALSTORAGE TO CONTEXT + COOKIE:
//
// The old approach stored the JWT in localStorage and read it with
// localStorage.getItem('token'). This has two serious problems:
//
//   1. SECURITY: Any JavaScript on the page can read localStorage — if an
//      attacker injects a script (XSS), they can steal the token and
//      impersonate the user from any device. httpOnly cookies are invisible
//      to JavaScript entirely, so even a successful XSS can't steal them.
//
//   2. CONSISTENCY: With localStorage, every component independently parsed
//      the user object, leading to stale data and race conditions. React
//      Context gives a single source of truth that updates all consumers
//      simultaneously when auth state changes.
//
// The new flow:
//   - Backend sets JWT as httpOnly cookie on login/signup
//   - On page load, AuthContext calls GET /api/auth/me to validate the cookie
//   - If valid → user state is populated from the response
//   - If 401 → cookie is expired/absent → user is null → redirect to login
//   - Logout calls POST /api/auth/logout which clears the cookie server-side
// ============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';


/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user - Current user object ({ id, name, email, role }) or null
 * @property {boolean} isLoading - True while the initial /me call is in flight
 * @property {Function} login - Sets user state after successful login/signup
 * @property {Function} logout - Clears the auth cookie and resets user state
 */

const AuthContext = createContext(null);


/**
 * Provides authentication state to the entire component tree.
 * On mount, validates the existing cookie by calling /api/auth/me.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if the user has a valid auth cookie.
  // This replaces the old localStorage.getItem('user') pattern.
  useEffect(() => {
    const validateSession = async () => {
      try {
        // GET /api/auth/me — the browser sends the httpOnly cookie automatically
        // because axios has withCredentials: true
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        // 401 means no cookie or expired cookie — user is not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);


  /**
   * Sets the user in context after a successful login or signup.
   * The cookie is already set by the backend response — we just need
   * to update React state so the UI reflects the logged-in state.
   *
   * @param {Object} userData - User object from the login/signup response
   */
  const login = (userData) => {
    setUser(userData);
  };


  /**
   * Logs out the user by clearing the httpOnly cookie server-side
   * and resetting the user state to null.
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the logout API fails, clear local state —
      // the cookie will expire on its own eventually
    }
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


/**
 * Hook to access authentication state from any component.
 *
 * @returns {AuthContextValue} Current auth state and actions
 * @example
 * const { user, isLoading, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
