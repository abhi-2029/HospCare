import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("Token");

  if (!token) {
    // Redirect to login page if token is not found
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
