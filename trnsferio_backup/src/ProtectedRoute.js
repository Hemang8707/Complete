// src/ProtectedRoute.js
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute
 * - Uses AuthContext (in-memory auth).
 * - If no auth -> redirect to "/".
 * - If auth exists, validates token once using AuthContext.validate().
 * - While validating, shows a small loading placeholder.
 * - If validation fails, signs out and redirects.
 *
 * Important: hooks are called unconditionally to satisfy ESLint/react rules.
 */
const ProtectedRoute = ({ children }) => {
  // hooks called unconditionally (no conditional hooks)
  const { auth, validate, signout } = useAuth();
  const location = useLocation();

  // local state for validation progress
  const [checking, setChecking] = useState(true);

  // useRef to ensure we run validation only once (avoid repeated calls)
  const validatedRef = useRef(false);

  useEffect(() => {
    // If there's no auth or token, skip validation (we'll redirect)
    if (!auth || !auth.token || !auth.user) {
      console.log('🔒 ProtectedRoute: no auth present, skipping validation.');
      setChecking(false);
      return;
    }

    // Avoid calling validate() multiple times
    if (validatedRef.current) {
      setChecking(false);
      return;
    }

    validatedRef.current = true;
    let mounted = true;

    (async () => {
      try {
        console.log('🔎 ProtectedRoute validating token for:', auth.user?.dealerName || '(unknown)');
        const ok = await validate(); // AuthContext.validate() should return boolean
        if (!mounted) return;

        if (!ok) {
          console.log('🔐 ProtectedRoute: token invalid -> signing out & redirecting');
          signout();
        } else {
          console.log('✅ ProtectedRoute: token valid');
        }
      } catch (err) {
        console.error('❌ ProtectedRoute validation error:', err);
        // On error, sign out to ensure a fresh state
        signout();
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [auth, validate, signout]);

  // While validating, show a simple loader (or null to hide)
  if (checking) {
    // Minimal inline loader - replace with your spinner UI if you want
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>Checking authentication...</div>
      </div>
    );
  }

  // If no valid auth found, redirect to signin
  if (!auth || !auth.token || !auth.user) {
    console.log('🚫 ProtectedRoute: unauthenticated -> redirect to "/"');
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Auth validated — render protected children
  return children;
};

export default ProtectedRoute;
