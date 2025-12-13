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
import OTPVerificationPage from './OTPVerificationPage';
import AboutUs from "./Aboutus";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/launchdemo" element={<LaunchDemo />} />
           <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/" element={<TrnzioHomepage />} />
          <Route path="/otp-verification" element={<OTPVerificationPage />} />

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