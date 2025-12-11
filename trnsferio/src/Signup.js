import React, { useState } from "react";

// API configuration - Backend runs on port 5000
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Signup() {
  const [formData, setFormData] = useState({ 
    dealerName: "",
    mobileNumber: "",
    email: "", 
    gstNumber: "",
    cancelCheque: null,
    shopPhoto: null,
    ownerName: "",
    ownerMobile: "",
    enterpriseType: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [dealerCode, setDealerCode] = useState(""); // New state for dealer code

  // Enhanced validation function
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.dealerName.trim()) newErrors.dealerName = "Dealer name is required";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
    if (!formData.ownerMobile.trim()) newErrors.ownerMobile = "Owner mobile is required";
    if (!formData.gstNumber.trim()) newErrors.gstNumber = "GST number is required";
    if (!formData.enterpriseType) newErrors.enterpriseType = "Enterprise type is required";
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

    if (formData.ownerMobile && !/^\d{10}$/.test(formData.ownerMobile)) {
      newErrors.ownerMobile = "Owner mobile must be 10 digits";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // File validation
    if (!formData.cancelCheque) {
      newErrors.cancelCheque = "Cancel cheque photo is required";
    }

    if (!formData.shopPhoto) {
      newErrors.shopPhoto = "Shop photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
      // Clear error when file is selected
      if (files[0]) {
        setErrors({ ...errors, [name]: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSubmitMessage("❌ Please fix the errors above");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    setDealerCode(""); // Reset dealer code

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all form fields with exact names expected by backend
      submitData.append('dealerName', formData.dealerName);
      submitData.append('mobileNumber', formData.mobileNumber);
      submitData.append('email', formData.email);
      submitData.append('ownerName', formData.ownerName);
      submitData.append('ownerMobile', formData.ownerMobile);
      submitData.append('gstNumber', formData.gstNumber);
      submitData.append('enterpriseType', formData.enterpriseType);
      submitData.append('password', formData.password);
      submitData.append('confirmPassword', formData.confirmPassword);
      
      if (formData.cancelCheque) {
        submitData.append('cancelCheque', formData.cancelCheque);
      }
      if (formData.shopPhoto) {
        submitData.append('shopPhoto', formData.shopPhoto);
      }

      console.log("📤 Sending signup request to:", `${API_BASE}/api/signup`);

      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();
      console.log("📥 Server response:", result);

      if (response.ok && result.success) {
        // Set the dealer code received from backend
        setDealerCode(result.dealerCode);
        setSubmitMessage(`✅ Sign up successful! Your account has been created. Your Dealer Code: ${result.dealerCode}`);
        
        // Reset form
        setFormData({
          dealerName: "",
          mobileNumber: "",
          email: "", 
          gstNumber: "",
          cancelCheque: null,
          shopPhoto: null,
          ownerName: "",
          ownerMobile: "",
          enterpriseType: "",
          password: "",
          confirmPassword: ""
        });
        
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        setErrors({});
        
      } else {
        // Show detailed error message from server
        const errorMsg = result.error || result.message || 'Failed to create account';
        setSubmitMessage(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitMessage("❌ Network error. Please check if the backend server is running on port 5000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        {/* <h2 className="signin-title"> SIGN UP</h2> */}
        <div className="signin-form">
          <div className="form-columns">
            <div className="form-column">
              <div className="input-group">
                <input
                  type="text"
                  name="dealerName"
                  placeholder="🏪 Dealer Name"
                  value={formData.dealerName}
                  onChange={handleChange}
                  className={errors.dealerName ? 'error' : ''}
                />
                {errors.dealerName && <span className="error-text">{errors.dealerName}</span>}
              </div>

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
            </div>
            
            <div className="form-column">
              <div className="input-group">
                <div className="file-input-wrapper">
                  <label htmlFor="cancelCheque">🏦 Cancel Cheque Photo</label>
                  <input
                    type="file"
                    id="cancelCheque"
                    name="cancelCheque"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    className={errors.cancelCheque ? 'error' : ''}
                  />
                  {errors.cancelCheque && <span className="error-text">{errors.cancelCheque}</span>}
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
                    className={errors.shopPhoto ? 'error' : ''}
                  />
                  {errors.shopPhoto && <span className="error-text">{errors.shopPhoto}</span>}
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
              {dealerCode && (
                <div className="dealer-code-display">
                  <h3>🎉 Your Dealer Code</h3>
                  <div className="dealer-code">{dealerCode}</div>
                  <p>Please save this code for future reference!</p>
                </div>
              )}
            </div>
          )}
          
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isSubmitting ? 'submitting' : ''}
          >
            {isSubmitting ? "Creating Account..." : "SIGN UP"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { 
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
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

        .signin-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 75vh;
          background-image: 
            radial-gradient(circle at 80% 40%, white 1px, transparent 1px),
            radial-gradient(circle at 30% 70%, white 1px, transparent 1px);
          background-size: 220px 220px, 160px 160px;
          animation: blink 7s ease-in-out infinite;
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
        
        .signin-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 2rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: float 3s ease-in-out infinite;
          position: relative;
        }
        
        .signin-title::after {
          content: '✨';
          position: absolute;
          top: -10px;
          right: -30px;
          font-size: 20px;
          animation: pulse 2s infinite;
        }
        
        .signin-form {
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
        
        .signin-form input,
        .signin-form select {
          padding: 18px 24px;
          border: 2px solid transparent;
          border-radius: 16px;
          font-size: 16px;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          outline: none;
          position: relative;
        }
        
        .signin-form input[type="file"] {
          padding: 14px 20px;
          font-size: 14px;
        }
        
        .signin-form select {
          cursor: pointer;
        }
        
        .signin-form input.error,
        .signin-form select.error {
          border-color: #dc3545;
          background: linear-gradient(white, white) padding-box, 
                      linear-gradient(45deg, #dc3545, #c82333) border-box;
        }
        
        .signin-form input:hover,
        .signin-form select:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
        }
        
        .signin-form input:focus,
        .signin-form select:focus {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(#f8f9ff, #f8f9ff) padding-box, 
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
        }
        
        .signin-form input::placeholder {
          color: #6c757d;
          font-weight: 500;
        }
        
        .signin-form select option {
          background: white;
          color: #333;
        }
        
        .signin-form button {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          margin-top: 1rem;
          width: fit-content;
          align-self: center;
        }
        
        .signin-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .signin-form button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .signin-form button:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
          background: linear-gradient(45deg, #5a67d8, #6b46c1);
        }
        
        .signin-form button:hover:not(:disabled)::before {
          left: 100%;
        }
        
        .signin-form button:active:not(:disabled) {
          transform: translateY(-2px);
        }
        
        .signin-form button:focus {
          outline: none;
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5), 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .server-info {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 12px;
          color: #6c757d;
        }

        .server-info p {
          margin: 0.25rem 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .form-columns {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .signin-box {
            padding: 2rem;
            max-width: 500px;
          }
          
          .signin-title {
            font-size: 28px;
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
          
          .signin-title {
            font-size: 24px;
          }
          
          .form-column {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;