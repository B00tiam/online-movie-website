import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

export default function RequireAdmin() {
  const {isAuthenticated, user, loading} = useAuth();

  if (loading) return null;   // or return a Spinner
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace/>;

  return <Outlet />;
}