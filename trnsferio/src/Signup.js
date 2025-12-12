import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// API configuration - Backend runs on port 5000
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Signup() {
  const navigate = useNavigate();
  
  // ==================== STATE ====================
  const [step, setStep] = useState(1); // 1: Type Selection, 2: Form, 3: OTP Verification
  const [userType, setUserType] = useState(null); // 'individual' or 'enterprise'
  
  const [formData, setFormData] = useState({
    dealerName: "",      // For individual: "Name", For enterprise: "Dealer Name"
    mobileNumber: "",
    email: "",
    ownerName: "",       // Enterprise only
    ownerMobile: "",     // Enterprise only
    gstNumber: "",       // Enterprise only
    enterpriseType: "",  // Enterprise only
    cancelCheque: null,  // Enterprise only (for now)
    shopPhoto: null,     // Enterprise only
    password: "",
    confirmPassword: ""
  });

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [dealerCode, setDealerCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.dealerName.trim()) {
      newErrors.dealerName = userType === 'individual' ? "Name is required" : "Dealer name is required";
    }
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Mobile validation (10 digits)
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Enterprise-specific validations
    if (userType === 'enterprise') {
      if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
      if (!formData.ownerMobile.trim()) newErrors.ownerMobile = "Owner mobile is required";
      if (!formData.gstNumber.trim()) newErrors.gstNumber = "GST number is required";
      if (!formData.enterpriseType) newErrors.enterpriseType = "Enterprise type is required";
      
      if (formData.ownerMobile && !/^\d{10}$/.test(formData.ownerMobile)) {
        newErrors.ownerMobile = "Owner mobile must be 10 digits";
      }

      // File validations (optional for now - can be uploaded later)
      // if (!formData.cancelCheque) newErrors.cancelCheque = "Cancel cheque photo is required";
      // if (!formData.shopPhoto) newErrors.shopPhoto = "Shop photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================
  const handleTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
    setErrors({});
    setSubmitMessage("");
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
      if (files[0]) setErrors({ ...errors, [name]: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setUserType(null);
      setErrors({});
      setSubmitMessage("");
    } else if (step === 3) {
      setStep(2);
      setOtp("");
      setErrors({});
      setSubmitMessage("");
    }
  };

  // Submit form and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage("❌ Please fix the errors above");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          dealerName: formData.dealerName,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          ownerName: formData.ownerName || formData.dealerName,
          ownerMobile: formData.ownerMobile || formData.mobileNumber,
          gstNumber: formData.gstNumber,
          enterpriseType: formData.enterpriseType,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();
      console.log("📥 Server response:", result);

      if (result.success) {
        setSubmitMessage("✅ OTP sent to your email!");
        setStep(3);
        startOtpTimer();
      } else {
        setSubmitMessage(`❌ ${result.error || 'Failed to send OTP'}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitMessage("❌ Network error. Please check if the server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      const result = await response.json();
      console.log("📥 OTP verification response:", result);

      if (result.success) {
        setDealerCode(result.dealerCode);
        setSubmitMessage(`✅ ${result.message}`);
        // Success - don't auto redirect, let user click button
      } else {
        if (result.expired) {
          setSubmitMessage("❌ OTP expired. Please request a new one.");
        } else {
          setSubmitMessage(`❌ ${result.error || 'Invalid OTP'}`);
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setSubmitMessage("❌ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/signup/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage("✅ New OTP sent to your email!");
        startOtpTimer();
      } else {
        setSubmitMessage(`❌ ${result.error || 'Failed to resend OTP'}`);
      }
    } catch (error) {
      setSubmitMessage("❌ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ==================== RENDER FUNCTIONS ====================

  // Step 1: User Type Selection
  const renderTypeSelection = () => (
    <div className="type-selection">
      <h2 className="selection-title">Choose Your Account Type</h2>
      <p className="selection-subtitle">How would you like to register?</p>
      
      <div className="type-cards">
        <div 
          className="type-card" 
          onClick={() => handleTypeSelect('individual')}
        >
          <div className="type-icon">👤</div>
          <h3>Individual</h3>
          <p>For personal use and individual dealers</p>
          <ul className="type-features">
            <li>✓ Simple registration</li>
            <li>✓ No GST required</li>
            <li>✓ Quick setup</li>
          </ul>
        </div>

        <div 
          className="type-card"
          onClick={() => handleTypeSelect('enterprise')}
        >
          <div className="type-icon">🏢</div>
          <h3>Enterprise</h3>
          <p>For businesses and organizations</p>
          <ul className="type-features">
            <li>✓ Business registration</li>
            <li>✓ GST compliant</li>
            <li>✓ Full features</li>
          </ul>
        </div>
      </div>

      <p className="login-link">
        Already have an account?{" "}
        <span onClick={() => navigate('/login')}>Sign In</span>
      </p>
    </div>
  );

  // Step 2: Registration Form
  const renderForm = () => (
    <div className="signup-form-container">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      
      <h2 className="form-title">
        {userType === 'individual' ? '👤 Individual Registration' : '🏢 Enterprise Registration'}
      </h2>

      <div className="signup-form">
        <div className="form-columns">
          <div className="form-column">
            {/* Name / Dealer Name */}
            <div className="input-group">
              <input
                type="text"
                name="dealerName"
                placeholder={userType === 'individual' ? "👤 Your Name" : "🏪 Dealer Name"}
                value={formData.dealerName}
                onChange={handleChange}
                className={errors.dealerName ? 'error' : ''}
              />
              {errors.dealerName && <span className="error-text">{errors.dealerName}</span>}
            </div>

            {/* Mobile Number */}
            <div className="input-group">
              <input
                type="tel"
                name="mobileNumber"
                placeholder="📱 Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={errors.mobileNumber ? 'error' : ''}
              />
              {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
            </div>

            {/* Email */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="✉️ Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Enterprise: Owner Name */}
            {userType === 'enterprise' && (
              <div className="input-group">
                <input
                  type="text"
                  name="ownerName"
                  placeholder="👤 Owner Name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={errors.ownerName ? 'error' : ''}
                />
                {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
              </div>
            )}

            {/* Enterprise: Owner Mobile */}
            {userType === 'enterprise' && (
              <div className="input-group">
                <input
                  type="tel"
                  name="ownerMobile"
                  placeholder="📞 Owner Mobile Number"
                  value={formData.ownerMobile}
                  onChange={handleChange}
                  className={errors.ownerMobile ? 'error' : ''}
                />
                {errors.ownerMobile && <span className="error-text">{errors.ownerMobile}</span>}
              </div>
            )}

            {/* Enterprise: GST Number */}
            {userType === 'enterprise' && (
              <div className="input-group">
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="📄 GST Number"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className={errors.gstNumber ? 'error' : ''}
                />
                {errors.gstNumber && <span className="error-text">{errors.gstNumber}</span>}
              </div>
            )}
          </div>

          <div className="form-column">
            {/* Enterprise: File Uploads */}
            {userType === 'enterprise' && (
              <>
                <div className="input-group">
                  <div className="file-input-wrapper">
                    <label htmlFor="cancelCheque">🏦 Cancel Cheque Photo</label>
                    <input
                      type="file"
                      id="cancelCheque"
                      name="cancelCheque"
                      onChange={handleChange}
                      accept="image/*,.pdf"
                    />
                    {formData.cancelCheque && (
                      <span className="file-selected">Selected: {formData.cancelCheque.name}</span>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <div className="file-input-wrapper">
                    <label htmlFor="shopPhoto">🏪 Store Shop Photo</label>
                    <input
                      type="file"
                      id="shopPhoto"
                      name="shopPhoto"
                      onChange={handleChange}
                      accept="image/*"
                    />
                    {formData.shopPhoto && (
                      <span className="file-selected">Selected: {formData.shopPhoto.name}</span>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <select
                    name="enterpriseType"
                    value={formData.enterpriseType}
                    onChange={handleChange}
                    className={errors.enterpriseType ? 'error' : ''}
                  >
                    <option value="">🏢 Type Of Enterprise</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private-limited">Private Limited</option>
                    <option value="public-limited">Public Limited</option>
                    <option value="llp">Limited Liability Partnership</option>
                  </select>
                  {errors.enterpriseType && <span className="error-text">{errors.enterpriseType}</span>}
                </div>
              </>
            )}

            {/* Password */}
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="🔒 Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="🔐 Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

        {submitMessage && (
          <div className={`message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}

        <button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={isSubmitting ? 'submitting' : ''}
        >
          {isSubmitting ? "Sending OTP..." : "CONTINUE"}
        </button>
      </div>
    </div>
  );

  // Step 3: OTP Verification
  const renderOtpVerification = () => (
    <div className="otp-container">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>

      <div className="otp-icon">📧</div>
      <h2 className="otp-title">Verify Your Email</h2>
      <p className="otp-subtitle">
        We've sent a 6-digit code to<br />
        <strong>{formData.email}</strong>
      </p>

      <div className="otp-input-container">
        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setOtp(value);
            if (errors.otp) setErrors({});
          }}
          placeholder="● ● ● ● ● ●"
          className={`otp-input ${errors.otp ? 'error' : ''}`}
        />
        {errors.otp && <span className="error-text">{errors.otp}</span>}
      </div>

      {submitMessage && (
        <div className={`message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
          {submitMessage}
          {dealerCode && (
            <div className="dealer-code-display">
              <h3>🎉 Your Dealer Code</h3>
              <div className="dealer-code">{dealerCode}</div>
              <p>Please save this code for login!</p>
            </div>
          )}
        </div>
      )}

      {/* Show Sign In button after successful verification, otherwise show Verify button */}
      {dealerCode ? (
        <button 
          onClick={() => navigate('/login')}
          className="success-button"
        >
          GO TO SIGN IN →
        </button>
      ) : (
        <button 
          onClick={handleVerifyOtp}
          disabled={isSubmitting || otp.length !== 6}
          className={isSubmitting ? 'submitting' : ''}
        >
          {isSubmitting ? "Verifying..." : "VERIFY & CREATE ACCOUNT"}
        </button>
      )}

      <div className="resend-otp">
        {otpTimer > 0 ? (
          <p>Resend OTP in <strong>{otpTimer}s</strong></p>
        ) : (
          <p>
            Didn't receive the code?{" "}
            <span onClick={handleResendOtp}>Resend OTP</span>
          </p>
        )}
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="signin-container">
      <div className="signin-box">
        {step === 1 && renderTypeSelection()}
        {step === 2 && renderForm()}
        {step === 3 && renderOtpVerification()}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slideIn {
          0% { 
            transform: translateY(50px) scale(0.9);
            opacity: 0;
          }
          100% { 
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .signin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem 1rem;
          background: linear-gradient(to bottom, 
            #6087FF 0%, 
            #8AA5FF 25%, 
            #B8CCFF 50%, 
            #E6EFFF 65%, 
            #FFFFFF 75%, 
            white 75%, 
            white 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .signin-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 75vh;
          background-image: 
            radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
            radial-gradient(circle at 70% 20%, white 1px, transparent 1px),
            radial-gradient(circle at 40% 60%, white 1px, transparent 1px);
          background-size: 150px 150px, 200px 200px, 180px 180px;
          animation: blink 5s ease-in-out infinite;
          z-index: 1;
        }
        
        .signin-box {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.3),
            0 0 0 1px rgba(255,255,255,0.2);
          width: 100%;
          max-width: 900px;
          text-align: center;
          animation: slideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          overflow: hidden;
          z-index: 10;
        }
        
        .signin-box::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
          background-size: 400% 400%;
          animation: gradient 10s ease infinite;
          z-index: -2;
          border-radius: 26px;
        }
        
        .signin-box::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          z-index: -1;
        }

        /* Type Selection Styles */
        .selection-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .selection-subtitle {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .type-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .type-card {
          background: white;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
        }

        .type-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }

        .type-icon {
          font-size: 48px;
          margin-bottom: 1rem;
        }

        .type-card h3 {
          font-size: 20px;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .type-card p {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 1rem;
        }

        .type-features {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }

        .type-features li {
          color: #28a745;
          font-size: 14px;
          padding: 4px 0;
        }

        .login-link {
          color: #6c757d;
          font-size: 14px;
        }

        .login-link span {
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
        }

        .login-link span:hover {
          text-decoration: underline;
        }

        /* Back Button */
        .back-button {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: transparent;
          border: none;
          color: #667eea;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        /* Form Styles */
        .form-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 2rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .form-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .error-text {
          color: #dc3545;
          font-size: 12px;
          margin-left: 4px;
          text-align: left;
        }
        
        .file-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .file-input-wrapper label {
          color: #6c757d;
          font-weight: 500;
          font-size: 16px;
          text-align: left;
          margin-left: 4px;
        }
        
        .file-selected {
          font-size: 12px;
          color: #28a745;
          margin-top: 4px;
        }
        
        .message {
          padding: 12px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 500;
          margin: 1rem 0;
        }
        
        .message.success {
          background: linear-gradient(45deg, #d4edda, #c3e6cb);
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background: linear-gradient(45deg, #f8d7da, #f1b0b7);
          color: #721c24;
          border: 1px solid #f1b0b7;
        }

        .dealer-code-display {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.5);
          border-radius: 8px;
        }

        .dealer-code {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
          letter-spacing: 4px;
        }
        
        .signup-form input,
        .signup-form select {
          padding: 18px 24px;
          border: 2px solid transparent;
          border-radius: 16px;
          font-size: 16px;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          outline: none;
        }
        
        .signup-form input[type="file"] {
          padding: 14px 20px;
          font-size: 14px;
        }
        
        .signup-form select {
          cursor: pointer;
        }
        
        .signup-form input.error,
        .signup-form select.error {
          border-color: #dc3545;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #dc3545, #c82333) border-box;
        }
        
        .signup-form input:hover,
        .signup-form select:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
        }
        
        .signup-form input:focus,
        .signup-form select:focus {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(#f8f9ff, #f8f9ff) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
        }
        
        .signup-form input::placeholder {
          color: #6c757d;
          font-weight: 500;
        }
        
        .signin-box button[type="submit"],
        .signin-box button:not(.back-button) {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          margin-top: 1rem;
          width: fit-content;
          align-self: center;
        }
        
        .signin-box button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .signin-box button:hover:not(:disabled):not(.back-button) {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
          background: linear-gradient(45deg, #5a67d8, #6b46c1);
        }

        /* OTP Verification Styles */
        .otp-container {
          padding: 2rem 0;
        }

        .otp-icon {
          font-size: 64px;
          margin-bottom: 1rem;
        }

        .otp-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .otp-subtitle {
          color: #6c757d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .otp-input-container {
          margin-bottom: 2rem;
        }

        .otp-input {
          width: 200px;
          padding: 20px;
          font-size: 32px;
          text-align: center;
          letter-spacing: 8px;
          border: 2px solid transparent;
          border-radius: 16px;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
          outline: none;
          transition: all 0.3s ease;
        }

        .otp-input:focus {
          transform: scale(1.05);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .otp-input.error {
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #dc3545, #c82333) border-box;
        }

        .resend-otp {
          margin-top: 2rem;
          color: #6c757d;
        }

        .resend-otp span {
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
        }

        .resend-otp span:hover {
          text-decoration: underline;
        }

        /* Success Button (Go to Sign In) */
        .success-button {
          background: linear-gradient(45deg, #28a745, #20c997) !important;
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
        }

        .success-button:hover {
          background: linear-gradient(45deg, #218838, #1aa179) !important;
          box-shadow: 0 15px 40px rgba(40, 167, 69, 0.5) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .form-columns,
          .type-cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .signin-box {
            padding: 2rem;
            max-width: 500px;
          }
        }
        
        @media (max-width: 480px) {
          .signin-container {
            padding: 1rem;
          }
          
          .signin-box {
            width: 100%;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;