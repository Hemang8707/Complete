// src/AuthContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { setApiToken } from "./api";
import { api } from "./api";

/**
 * AuthContext provides in-memory authentication only.
 * It intentionally does NOT persist tokens to localStorage/sessionStorage.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // auth: { token: string, user: { id, dealerCode, dealerName, ... } } | null
  const [auth, setAuth] = useState(null);

  // signin: store token+user in memory and set token in api helper
  const signin = useCallback((token, user) => {
    if (!token || !user) {
      throw new Error("signin requires token and user");
    }
    // first set token in api so future calls attach Authorization
    setApiToken(token);
    // then set in-memory auth
    setAuth({ token, user });
    console.log("🔐 AuthProvider: signed in (in-memory)");
  }, []);

  // signout: clear in-memory auth and remove token in api helper
  const signout = useCallback(() => {
    setApiToken(null);
    setAuth(null);
    console.log("👋 AuthProvider: signed out (in-memory)");
  }, []);

  /**
   * validate - calls backend to validate token.
   * Returns true if token is valid; otherwise signs out and returns false.
   */
  const validate = useCallback(async () => {
    try {
      if (!auth || !auth.token) return false;

      // Use centralized api.validateToken() which attaches Authorization via setApiToken
      // (ensure setApiToken was called at signin time)
      const data = await api.validateToken();

      if (data && data.success && data.user) {
        // refresh user data in memory (optional)
        setAuth(prev => prev ? ({ ...prev, user: { ...prev.user, ...data.user } }) : prev);
        return true;
      }

      // invalid token -> signout
      signout();
      return false;
    } catch (err) {
      console.error("AuthProvider.validate error:", err);
      // On any error, sign the user out to be safe
      signout();
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, signout]);

  const value = {
    auth,
    signin,
    signout,
    validate
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for components to access auth
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
