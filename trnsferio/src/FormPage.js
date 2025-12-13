// FormPage.js - COMPLETE UPDATED VERSION WITH DIRECT REDIRECT TO DISCOUNT PAGE
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import DiscountResultsPage from "./DiscountResultsPage";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { api } from './api';

// First Page Component
function FormPageOne({ formData, setFormData, onProceed, brands, assets, models, loadingBrands, loadingAssets, loadingModels, loadAssets, loadModels, apiStatus }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });

    if (name === "brand") {
      setFormData(prev => ({ ...prev, brand: value, asset: "", model: "" }));
      if (value) {
        loadAssets(value);
      }
    } else if (name === "asset") {
      setFormData(prev => ({ ...prev, asset: value, model: "" }));
      if (value && formData.brand) {
        loadModels(formData.brand, value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.mobileNo || formData.mobileNo.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (!formData.brand) {
      alert("Please select a brand");
      return;
    }
    
    if (!formData.asset) {
      alert("Please select an asset");
      return;
    }
    
    if (!formData.model) {
      alert("Please select a model");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    onProceed();
  };

  return (
    <div className="form-card">
      <h2 className="floating-title">Tranzio</h2>

      {apiStatus.status === 'error' && (
        <div style={{
          background: "linear-gradient(135deg, #ffe5e5, #fff0f0)",
          border: "2px solid #ffcccc",
          borderRadius: "15px",
          padding: "15px",
          marginBottom: "25px",
          fontSize: "14px",
          color: "#d32f2f",
          textAlign: "center",
          fontWeight: "600"
        }}>
          <strong>⚠ API Connection Issue</strong><br />
          The server might be offline. You can still submit the form - it will show pricing without live discounts.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Mobile Number */}
        <div className="input-wrapper">
          <input
            className="input-field"
            type="tel"
            name="mobileNo"
            placeholder="Mobile Number"
            value={formData.mobileNo}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
            title="Please enter a valid 10-digit mobile number"
          />
        </div>

        {/* Brand Dropdown */}
        <div className="input-wrapper">
          <select
            className="select-field"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            disabled={loadingBrands}
            style={{
              cursor: loadingBrands ? "wait" : "pointer",
              color: formData.brand ? "#333" : "#333",
              opacity: formData.brand ? "1" : "0.6"
            }}
          >
            <option value="">
              {loadingBrands ? "Loading brands..." : "Select Brand"}
            </option>
            {brands.map((brand, idx) => (
              <option key={idx} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Asset Dropdown */}
        <div className="input-wrapper">
          <select
            className="select-field"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            required
            disabled={!formData.brand || loadingAssets}
            style={{
              cursor: (!formData.brand || loadingAssets) ? "not-allowed" : "pointer",
              color: formData.asset ? "#333" : "#333",
              opacity: formData.asset ? "1" : "0.6"
            }}
          >
            <option value="">
              {!formData.brand 
                ? "Select brand first" 
                : loadingAssets 
                ? "Loading assets..." 
                : "Select Asset"}
            </option>
            {assets.map((asset, idx) => (
              <option key={idx} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>

        {/* Model Dropdown */}
        <div className="input-wrapper">
          <select
            className="select-field"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            disabled={!formData.brand || !formData.asset || loadingModels}
            style={{
              cursor: (!formData.brand || !formData.asset || loadingModels) ? "not-allowed" : "pointer",
              color: formData.model ? "#333" : "#333",
              opacity: formData.model ? "1" : "0.6"
            }}
          >
            <option value="">
              {!formData.brand || !formData.asset
                ? "Select asset first" 
                : loadingModels 
                ? "Loading models..." 
                : "Select Model"}
            </option>
            {models.map((model, idx) => (
              <option key={idx} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="input-wrapper">
          <input
            className="input-field"
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          style={{
            width: "100%",
            padding: "20px",
            background: "#4d6cff",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "18px",
            fontWeight: "800",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            textTransform: "uppercase",
            letterSpacing: "2px",
            boxShadow: "0 10px 30px rgba(77, 108, 255, 0.4)",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(77, 108, 255, 0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(77, 108, 255, 0.4)";
          }}
        >
          <div className="btn-shimmer"></div>
          <span>Proceed</span>
        </button>
      </form>
    </div>
  );
}

// Second Page Component - UPDATED to send OTP on submit
function FormPageTwo({ formData, setFormData, onBack, onSubmit, loading }) {
  const navigate = useNavigate();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasReadPrivacyPolicy, setHasReadPrivacyPolicy] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePrivacyScroll = (e) => {
    const element = e.target;
    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;
    
    if (scrollPosition >= scrollHeight * 0.9) {
      setHasReadPrivacyPolicy(true);
    }
  };

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
    setShowPrivacyModal(false);
    setShowWarning(false);
  };

  const handleOpenPrivacyModal = () => {
    setShowPrivacyModal(true);
    setHasReadPrivacyPolicy(false);
    setShowWarning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate privacy policy acceptance
    if (!privacyAccepted) {
      setShowWarning(true);
      alert("Please read and accept the privacy policy to continue.");
      return;
    }

    // Validate all fields
    if (!formData.dealer || !formData.panNumber || !formData.dateOfBirth) {
      alert("Please fill all the required fields.");
      return;
    }

    // Check if already verified for this session
    const verifiedMobile = sessionStorage.getItem('verifiedMobile');
    const otpVerified = sessionStorage.getItem('otpVerified');
    
    if (otpVerified === 'true' && verifiedMobile === formData.mobileNo) {
      // Already verified - proceed with form submission
      onSubmit();
      return;
    }

    // Need OTP verification - send OTP and navigate
    setSendingOTP(true);
    
    try {
      const response = await api.sendOTP({ mobileNo: formData.mobileNo });
      
      if (response.success) {
        // Store complete form data for submission after OTP verification
        sessionStorage.setItem('pendingFormData', JSON.stringify(formData));
        sessionStorage.setItem('needsSubmission', 'true');
        
        // Navigate to OTP verification
        navigate("/otp-verification", {
          state: {
            formData: formData,
            autoSubmitAfterVerification: true
          }
        });
      } else {
        alert(response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error("OTP send error:", error);
      alert(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleCheckboxChange = (e) => {
    if (!hasReadPrivacyPolicy && e.target.checked) {
      e.preventDefault();
      handleOpenPrivacyModal();
    } else {
      setPrivacyAccepted(e.target.checked);
      if (e.target.checked) {
        setShowWarning(false);
      }
    }
  };

  // Show verification status if already verified
  const renderVerificationStatus = () => {
    const verifiedMobile = sessionStorage.getItem('verifiedMobile');
    const otpVerified = sessionStorage.getItem('otpVerified');
    
    if (otpVerified === 'true' && verifiedMobile === formData.mobileNo) {
      return (
        <div style={{
          background: "linear-gradient(135deg, #e8f7ef, #f0fdf4)",
          border: "2px solid #c6efd5",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#2ecc71",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: "#2ecc71", display: "block", fontSize: "15px" }}>
              Mobile Verified
            </strong>
            <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#555" }}>
              {formData.mobileNo} is verified
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={handlePrivacyAccept}
        onScroll={handlePrivacyScroll}
      />

      <div className="form-card">
        <h2 className="floating-title">Customer Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Show verification status if verified */}
          {renderVerificationStatus()}

          {/* Customer Name */}
          <div className="input-wrapper">
            <input
              className="input-field"
              type="text"
              name="dealer"
              placeholder="Customer Name"
              value={formData.dealer}
              onChange={handleChange}
              required
            />
          </div>

          {/* PAN Number */}
          <div className="input-wrapper">
            <input
              className="input-field"
              type="text"
              name="panNumber"
              placeholder="PAN Number"
              value={formData.panNumber}
              onChange={handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
              maxLength="10"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              title="Please enter valid PAN (e.g., ABCDE1234F)"
              required
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* Date of Birth */}
          <div className="input-wrapper">
            <div className="date-input-container">
              <input
                className="input-field"
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px',
              background: privacyAccepted ? '#f0f8ff' : '#f8f9ff',
              borderRadius: '12px',
              border: `2px solid ${privacyAccepted ? '#4d6cff' : '#e0e0e0'}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="checkbox"
                  id="privacyCheckbox"
                  checked={privacyAccepted}
                  onChange={handleCheckboxChange}
                  disabled={loading || sendingOTP}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#4d6cff'
                  }}
                />
              </div>
              <label 
                htmlFor="privacyCheckbox"
                style={{
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                I have read and accept the{' '}
                <span
                  onClick={handleOpenPrivacyModal}
                  style={{
                    color: '#4d6cff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  Privacy Policy
                </span>
              </label>
            </div>
            
            {showWarning && !privacyAccepted && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#e74c3c',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                animation: 'fadeIn 0.3s ease'
              }}>
                <span>⚠</span>
                <span>Please read the Privacy Policy fully before accepting</span>
              </div>
            )}
            
            {hasReadPrivacyPolicy && !privacyAccepted && !showWarning && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#2ecc71',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                animation: 'fadeIn 0.3s ease'
              }}>
                <span>✓</span>
                <span>Privacy Policy read - You can now accept it</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              type="button"
              onClick={onBack}
              disabled={sendingOTP}
              style={{
                flex: "1",
                padding: "20px",
                background: sendingOTP ? "#95a5a6" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: "800",
                cursor: sendingOTP ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                letterSpacing: "2px",
                boxShadow: "0 10px 30px rgba(108, 117, 125, 0.4)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                if (!sendingOTP) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(108, 117, 125, 0.3)";
                }
              }}
              onMouseOut={(e) => {
                if (!sendingOTP) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(108, 117, 125, 0.4)";
                }
              }}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading || sendingOTP || !privacyAccepted}
              className="submit-btn"
              style={{
                flex: "1",
                padding: "20px",
                background: (loading || sendingOTP || !privacyAccepted) ? "#95a5a6" : "#4d6cff",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: "800",
                cursor: (loading || sendingOTP || !privacyAccepted) ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                textTransform: "uppercase",
                letterSpacing: "2px",
                boxShadow: (loading || sendingOTP || !privacyAccepted)
                  ? "0 10px 30px rgba(149, 165, 166, 0.4)"
                  : "0 10px 30px rgba(77, 108, 255, 0.4)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                if (!loading && !sendingOTP && privacyAccepted) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(77, 108, 255, 0.3)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading && !sendingOTP && privacyAccepted) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(77, 108, 255, 0.4)";
                }
              }}
            >
              {!(loading || sendingOTP) && privacyAccepted && <div className="btn-shimmer"></div>}
              {sendingOTP ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="loading-spinner"></div>
                  Sending OTP...
                </span>
              ) : loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="loading-spinner"></div>
                  Processing...
                </span>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Main FormPage Component - UPDATED to handle auto-submission after OTP
export default function FormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, signout } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    mobileNo: "",
    dealer: "",
    panNumber: "",
    dateOfBirth: "",
    brand: "",
    asset: "",
    model: "",
    amount: ""
  });

  const [brands, setBrands] = useState([]);
  const [assets, setAssets] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: 'checking', message: '' });

  // Handle return from OTP verification with auto-submission
  useEffect(() => {
    const checkForPendingSubmission = async () => {
      const needsSubmission = sessionStorage.getItem('needsSubmission');
      const verifiedMobile = sessionStorage.getItem('verifiedMobile');
      const otpVerified = sessionStorage.getItem('otpVerified');
      const pendingData = sessionStorage.getItem('pendingFormData');
      
      if (needsSubmission === 'true' && otpVerified === 'true' && pendingData) {
        console.log("✅ OTP Verified - Auto-submitting form");
        
        // Clear the submission flag
        sessionStorage.removeItem('needsSubmission');
        
        // Parse and restore form data
        const parsedData = JSON.parse(pendingData);
        setFormData(parsedData);
        
        // Auto-submit the form
        await submitFormData(parsedData);
      }
    };
    
    checkForPendingSubmission();
  }, []);

  useEffect(() => {
    if (!auth || !auth.user) {
      return;
    }

    const initializeData = async () => {
      try {
        await api.healthCheck();
        setApiStatus({ 
          status: 'connected', 
          message: 'API Connected Successfully!' 
        });
        await loadBrands();
      } catch (error) {
        console.error("API initialization error:", error);
        setApiStatus({ 
          status: 'error', 
          message: `API Connection Failed: ${error.message}` 
        });
      }
    };

    initializeData();
  }, [auth]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await api.getBrands();
      if (response.success) {
        setBrands(response.brands);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadAssets = async (brand) => {
    if (!brand) {
      setAssets([]);
      return;
    }
    
    setLoadingAssets(true);
    try {
      const response = await api.getAssets(brand);
      if (response.success) {
        setAssets(response.assets);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const loadModels = async (brand, asset) => {
    if (!brand || !asset) {
      setModels([]);
      return;
    }
    
    setLoadingModels(true);
    try {
      const response = await api.getModels(brand, asset);
      if (response.success) {
        setModels(response.models);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleProceedToPage2 = () => {
    setCurrentPage(2);
  };

  const handleBackToPage1 = () => {
    setCurrentPage(1);
  };

  const submitFormData = async (data) => {
    setLoading(true);
    setResultData(null);

    const payload = {
      brand: data.brand,
      asset: data.asset,
      model: data.model,
      mobileNo: data.mobileNo,
      amount: data.amount,
      panNumber: data.panNumber,
      dateOfBirth: data.dateOfBirth
    };

    try {
      await api.healthCheck();
      const result = await api.checkDiscount(payload);
      
      if (result.success !== false) {
        setResultData(result);
        setShowResults(true);
      } else {
        setResultData({
          success: false,
          message: result.message || result.error || "An error occurred while checking discounts.",
          basePrice: parseFloat(data.amount) || 0,
          finalPrice: parseFloat(data.amount) || 0,
          discount: 0,
          offerDetails: null,
          showPaymentButton: true,
          noOffersReason: "error"
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error("API Error:", err);
      
      let errorType = "connection_error";
      let errorMessage = "Error connecting to server! Please check: Server is running, Internet connection is stable. You can try again or proceed with payment at regular price.";
      
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        errorType = "network_error";
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (err.message.includes("500") || err.message.includes("Internal Server")) {
        errorType = "server_error";
        errorMessage = "Server error occurred. Please try again in a moment or proceed with regular pricing.";
      } else if (err.message.includes("404")) {
        errorType = "endpoint_error";
        errorMessage = "API endpoint not found. Please ensure the server is running correctly.";
      }

      setResultData({
        success: false,
        message: errorMessage,
        basePrice: parseFloat(data.amount) || 0,
        finalPrice: parseFloat(data.amount) || 0,
        discount: 0,
        offerDetails: null,
        showPaymentButton: true,
        noOffersReason: errorType
      });
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    await submitFormData(formData);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setResultData(null);
    setCurrentPage(1);
    // Clear OTP verification for new submission
    sessionStorage.removeItem('otpVerified');
    sessionStorage.removeItem('verifiedMobile');
    sessionStorage.removeItem('needsSubmission');
    sessionStorage.removeItem('pendingFormData');
  };

  if (showResults) {
    return <DiscountResultsPage resultData={resultData} onBackToForm={handleBackToForm} />;
  }

  if (!auth || !auth.user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#333',
        backgroundColor: '#ffffff'
      }}>
        Loading user data...
      </div>
    );
  }

  return (
    <>
      <style>
        {`
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
            50% { transform: translateY(-10px); }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .form-page-container {
            min-height: 100vh;
            padding: 20px;
            background: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .form-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(77, 108, 255, 0.15);
            overflow: hidden;
            position: relative;
            z-index: 10;
            animation: slideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(10px);
            border: 2px solid #e0e0e0;
            border-top: 6px solid #4d6cff;
            width: 100%;
            max-width: 700px;
            padding: 30px;
          }

          .input-wrapper {
            position: relative;
            margin-bottom: 20px;
          }

          .input-field, .select-field {
            position: relative;
            transition: all 0.3s ease;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 16px;
            width: 100%;
            padding: 16px 20px;
            font-size: 16px;
            box-sizing: border-box;
            outline: none;
            font-weight: 600;
            color: #333;
          }

          .input-field:hover, .select-field:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(77, 108, 255, 0.15);
            border-color: #4d6cff;
          }

          .input-field:focus, .select-field:focus {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(77, 108, 255, 0.2);
            border-color: #4d6cff;
            outline: none;
          }

          .select-field:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #f5f5f5;
          }

          .submit-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(77, 108, 255, 0.3);
          }

          .submit-btn:active:not(:disabled) {
            transform: translateY(-1px);
          }

          .btn-shimmer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2.5s infinite;
          }

          .loading-spinner {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
          }

          .floating-title {
            animation: float 4s ease-in-out infinite;
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 42px;
            font-weight: 800;
            font-family: "Geneva, Arial, sans-serif";
            letter-spacing: 2px;
          }

          ::placeholder {
            color: #333;
            opacity: 0.6;
          }

          .date-input-container {
            position: relative;
            width: 100%;
          }

          .date-input-container input[type="date"] {
            width: 100%;
            padding: 16px 20px;
            padding-right: 50px;
            border-radius: 16px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            background: white;
            color: #333;
            font-weight: 600;
            box-sizing: border-box;
            outline: none;
            cursor: pointer;
          }

          .date-input-container input[type="date"]:focus {
            border-color: #4d6cff;
            box-shadow: 0 10px 30px rgba(77, 108, 255, 0.2);
            transform: translateY(-2px);
          }

          .date-input-container input[type="date"]:hover {
            border-color: #4d6cff;
            box-shadow: 0 10px 30px rgba(77, 108, 255, 0.15);
            transform: translateY(-2px);
          }

          .date-input-container::after {
            content: "📅";
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            pointer-events: none;
            color: #4d6cff;
            opacity: 1;
          }

          .date-input-container input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .date-input-container input[type="date"]::before {
            content: attr(placeholder);
            color: #333;
            opacity: 0.6;
            font-weight: 600;
          }

          .date-input-container input[type="date"]:focus::before,
          .date-input-container input[type="date"]:valid::before {
            content: "";
          }

          .select-field {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234d6cff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 20px;
            padding-right: 50px;
          }

          @media (max-width: 768px) {
            .form-page-container {
              padding: 15px;
            }
            
            .form-card {
              padding: 25px;
              border-radius: 25px;
            }
            
            .floating-title {
              font-size: 36px;
              margin-bottom: 25px;
            }
            
            .input-field, .select-field {
              padding: 14px 18px;
              font-size: 15px;
            }
          }

          @media (max-width: 480px) {
            .form-card {
              padding: 20px;
              border-radius: 20px;
            }
            
            .floating-title {
              font-size: 32px;
              margin-bottom: 20px;
            }
            
            .input-field, .select-field {
              padding: 12px 16px;
              font-size: 14px;
              border-radius: 14px;
            }
          }
        `}
      </style>
      
      <div className="form-page-container">
        {currentPage === 1 ? (
          <FormPageOne 
            formData={formData}
            setFormData={setFormData}
            onProceed={handleProceedToPage2}
            brands={brands}
            assets={assets}
            models={models}
            loadingBrands={loadingBrands}
            loadingAssets={loadingAssets}
            loadingModels={loadingModels}
            loadAssets={loadAssets}
            loadModels={loadModels}
            apiStatus={apiStatus}
          />
        ) : (
          <FormPageTwo 
            formData={formData}
            setFormData={setFormData}
            onBack={handleBackToPage1}
            onSubmit={handleFinalSubmit}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}