import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { getToken, authenticateUser } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  // TEMPORARY: Bypass authentication for development
  // TODO: Remove this before production!
  const isDevelopment = process.env.NODE_ENV === "development";
  const bypassAuth = isDevelopment && window.location.hostname === "localhost";

  useEffect(() => {
    const checkAuth = async () => {
      // Bypass authentication check in development
      if (bypassAuth) {
        setIsAuthenticated(true);
        return;
      }

      // Quick check: if no token exists, immediately redirect
      const token = getToken();
      if (!token || token === 0) {
        setIsAuthenticated(false);
        return;
      }

      // Verify token is valid with the backend
      const isValid = await authenticateUser();
      setIsAuthenticated(isValid);
    };

    checkAuth();
  }, [getToken, authenticateUser, bypassAuth]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
