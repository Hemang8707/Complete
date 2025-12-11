// ==================== App.js ====================
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import SignIn from "./SignIn";
import Signup from "./Signup";
import FormPage from "./FormPage";
import ProtectedRoute from "./ProtectedRoute";
import LaunchDemo from "./launchdemo";
import TrnzioHomepage from "./TrnzioHomepage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/launchdemo" element={<LaunchDemo />} />
           <Route path="/" element={<TrnzioHomepage />} />

          {/* Protected Routes */}
          <Route
            path="/form"
            element={
              <ProtectedRoute>
                <FormPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;