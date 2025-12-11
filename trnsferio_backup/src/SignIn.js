import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { api } from "./api";
import Navbar from "./Navbar";

function SignIn() {
  const [formData, setFormData] = useState({
    dealerName: "",
    dealerCode: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBoxHovered, setIsBoxHovered] = useState(false);

  const navigate = useNavigate();
  const { signin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const dealerName = (formData.dealerName || "").trim();
    const dealerCode = (formData.dealerCode || "").trim();
    const password = formData.password || "";

    if (!dealerName || !dealerCode || !password) {
      setError("Please enter dealer name, dealer code, and password.");
      return;
    }

    setLoading(true);
    try {
      console.log(" Submitting login:", { dealerName, dealerCode });
      const data = await api.login({ dealerName, dealerCode, password });

      console.log(" /api/login returned:", data);

      if (data && data.success && data.token && data.user) {
        signin(data.token, data.user);
        await Promise.resolve();
        await new Promise(res => setTimeout(res, 50));
        console.log("🔄 Navigating to /form (protected) now that signin completed");
        navigate("/form", { replace: true });
      } else {
        const msg = (data && (data.error || data.message)) || "Login failed. Please check your credentials.";
        setError(msg);
      }
    } catch (err) {
      console.error("SignIn error:", err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <Navbar />

      <div className="top-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Trnzio <span className="highlight">Instant Credit Cards</span> for Modern Businesses
          </h1>
          <p className="hero-subtitle">
            Issue unlimited virtual cards in milliseconds. Full spend controls, real-time analytics, and global acceptance — all in one powerful platform.
          </p>
        
        </div>

        <div
          className={`signin-box ${isBoxHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsBoxHovered(true)}
          onMouseLeave={() => setIsBoxHovered(false)}
        >
          <div className="signin-header">
            <div className="icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V9M20 9V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V9M20 9H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className="signin-title">Sign In to Trnzio</h2>
            <p className="signin-subtitle">Access your virtual card dashboard</p>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="signin-form" noValidate>
            <div className="input-wrapper">
              <input
                type="text"
                name="dealerName"
                placeholder="🏢 User Name"
                value={formData.dealerName}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="organization"
              />
            </div>

            <div className="input-wrapper">
              <input
                type="text"
                name="dealerCode"
                placeholder="🔑 Dealer Code"
                value={formData.dealerCode}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>

            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="🔒 Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="signup-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")} style={{ color: "#0025ff", cursor: "pointer", fontWeight: "600" }}>
                Sign up here
              </span>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Import Inter font for consistency */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .signin-container {
          min-height: 100vh;
          background: radial-gradient(1400px 700px at 80% -10%, rgba(0, 37, 255, 0.18), transparent 60%), 
                     radial-gradient(1000px 600px at -20% 20%, rgba(77, 108, 255, 0.15), transparent 60%), 
                     #f7f9fc;
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0b1220;
          padding: 80px 20px 60px; /* Increased top padding to add margin */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .top-section {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 2;
          padding: 0 32px;
          margin-top: 40px; /* Added top margin */
        }

        .hero-content {
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-title {
          font-size: clamp(2.8rem, 4.8vw, 4.4rem);
          line-height: 1.06;
          letter-spacing: -0.035em;
          margin-bottom: 20px;
          font-weight: 800;
          color: #4a4848ff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .hero-title .highlight {
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.16rem);
          color: #222;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 56ch;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .stat-item {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 12px 36px rgba(16,24,40,0.08);
          transition: transform 0.28s;
        }

        .stat-item:hover {
          transform: translateY(-4px);
        }

        .stat-number {
          font-weight: 800;
          font-size: clamp(1.8rem, 3vw, 2.2rem);
          color: #0025ff;
          margin-bottom: 4px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .stat-label {
          color: #444;
          font-size: 14.5px;
          font-weight: 500;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .signin-box {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 22px 60px rgba(16,24,40,0.12);
          animation: fadeInUp 0.8s ease-out 0.2s both;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .signin-box.hovered {
          transform: translateY(-8px);
          box-shadow: 0 32px 80px rgba(16,24,40,0.18);
          border-color: rgba(0, 37, 255, 0.2);
        }

        .signin-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
        }

        .signin-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .icon-box {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          display: grid;
          place-items: center;
          color: white;
          margin: 0 auto 20px;
        }

        .signin-title {
          font-size: clamp(1.8rem, 3vw, 2.2rem);
          font-weight: 800;
          margin-bottom: 8px;
          color: #0b1220;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .signin-subtitle {
          color: #666;
          font-size: 1rem;
          font-weight: 500;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .error-message {
          background: linear-gradient(135deg, #ff3b30, #ff2d55);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(255, 59, 48, 0.2);
          animation: shake 0.5s ease-in-out;
          text-align: center;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          transition: width 0.3s ease;
        }

        .input-wrapper:focus-within::after {
          width: 100%;
        }
        
        .signin-form input {
          padding: 18px 24px;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 16px;
          font-size: 16px;
          background: white;
          transition: all 0.3s ease;
          outline: none;
          width: 100%;
          color: #0b1220;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .signin-form input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f5f5f7;
        }
        
        .signin-form input:not(:disabled):hover {
          border-color: rgba(0, 37, 255, 0.4);
          box-shadow: 0 8px 24px rgba(0, 37, 255, 0.08);
        }
        
        .signin-form input:not(:disabled):focus {
          border-color: #0025ff;
          box-shadow: 0 0 0 3px rgba(0, 37, 255, 0.1);
        }
        
        .signin-form input::placeholder {
          color: #666;
          font-weight: 500;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          color: white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 28px rgba(0,37,255,0.3);
          margin-top: 10px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s;
        }
        
        .btn-primary:not(:disabled):hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,37,255,0.4);
        }
        
        .btn-primary:not(:disabled):hover::before {
          left: 100%;
        }
        
        .btn-primary:not(:disabled):active {
          transform: translateY(-2px);
          animation: pulse 0.3s ease;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .signup-link {
          text-align: center;
          margin-top: 24px;
          color: #666;
          font-size: 15px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        @media (max-width: 1024px) {
          .top-section {
            grid-template-columns: 1fr;
            gap: 60px;
            padding: 0 24px;
            margin-top: 30px;
          }

          .hero-content {
            text-align: center;
          }

          .hero-stats {
            max-width: 600px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .signin-container {
            padding: 100px 20px 40px; /* Adjusted padding for mobile */
          }

          .top-section {
            padding: 0 20px;
            gap: 50px;
            margin-top: 20px;
          }

          .hero-title {
            font-size: clamp(2.2rem, 4vw, 3rem);
          }

          .signin-box {
            padding: 32px 24px;
          }

          .hero-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .stat-item {
            padding: 16px 12px;
          }
        }

        @media (max-width: 480px) {
          .signin-container {
            padding: 90px 16px 40px; /* Adjusted padding for mobile */
          }

          .top-section {
            padding: 0 16px;
            gap: 40px;
            margin-top: 15px;
          }

          .hero-title {
            font-size: clamp(1.8rem, 5vw, 2.5rem);
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .signin-box {
            padding: 24px 20px;
            border-radius: 20px;
          }

          .signin-title {
            font-size: 1.5rem;
          }

          .hero-stats {
            grid-template-columns: 1fr;
            max-width: 280px;
          }

          .signin-form input {
            padding: 16px 20px;
            font-size: 15px;
          }

          .btn-primary {
            padding: 16px 24px;
            font-size: 15px;
          }
        }

        @media (max-width: 360px) {
          .signin-container {
            padding: 80px 12px 30px; /* Adjusted padding for mobile */
          }

          .hero-title {
            font-size: 1.6rem;
          }

          .signin-box {
            padding: 20px 16px;
          }

          .btn-primary {
            padding: 14px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default SignIn;