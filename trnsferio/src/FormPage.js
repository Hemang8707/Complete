import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import DiscountResultsPage from "./DiscountResultsPage";
import { api } from './api';

export default function FormPage() {
  const navigate = useNavigate();
  const { auth, signout } = useAuth();
  
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

  // State for dropdown options
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

  // Load user data from auth context and initialize
  useEffect(() => {
    if (!auth || !auth.user) {
      console.log("❌ No auth found in FormPage, user should be redirected by ProtectedRoute");
      return;
    }

    const user = auth.user;
    console.log("✅ User data loaded from auth:", user);
    
    // Auto-fill form fields with user data
    setFormData(prev => ({
      ...prev,
      mobileNo: user.mobileNumber || "",
      dealer: user.dealerName || ""
    }));

    // Initialize data
    const initializeData = async () => {
      try {
        await api.healthCheck();
        setApiStatus({ 
          status: 'connected', 
          message: 'API Connected Successfully!' 
        });
        
        // Load brands immediately
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

  // Load brands
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

  // Load assets when brand changes
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

  // Load models when brand and asset change
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow editing of auto-filled fields
    if (name === "mobileNo" || name === "dealer") {
      return;
    }
    
    setFormData({ ...formData, [name]: value });

    // Handle cascading dropdowns
    if (name === "brand") {
      // Reset dependent fields
      setFormData(prev => ({ ...prev, brand: value, asset: "", model: "" }));
      setAssets([]);
      setModels([]);
      
      // Load assets for selected brand
      if (value) {
        loadAssets(value);
      }
    } else if (name === "asset") {
      // Reset model field
      setFormData(prev => ({ ...prev, asset: value, model: "" }));
      setModels([]);
      
      // Load models for selected brand and asset
      if (value && formData.brand) {
        loadModels(formData.brand, value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultData(null);

    const payload = {
      brand: formData.brand,
      asset: formData.asset,
      model: formData.model,
      mobileNo: formData.mobileNo,
      amount: formData.amount,
      panNumber: formData.panNumber,
      dateOfBirth: formData.dateOfBirth
    };

    try {
      await api.healthCheck();
      const data = await api.checkDiscount(payload);
      
      if (data.success !== false) {
        setResultData(data);
        setShowResults(true);
      } else {
        setResultData({
          success: false,
          message: data.message || data.error || "An error occurred while checking discounts.",
          basePrice: parseFloat(formData.amount) || 0,
          finalPrice: parseFloat(formData.amount) || 0,
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
        basePrice: parseFloat(formData.amount) || 0,
        finalPrice: parseFloat(formData.amount) || 0,
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

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    signout();
    navigate("/", { replace: true });
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setResultData(null);
  };

  if (showResults) {
    return <DiscountResultsPage resultData={resultData} onBackToForm={handleBackToForm} />;
  }

  // Show loading if no auth data yet
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

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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
            /* Top border: #4d6cff, other borders: grey */
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

          .auto-filled-field {
            background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%);
            color: #333;
            font-weight: 600;
            border-color: #4d6cff;
          }

          .auto-filled-field:hover {
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
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

          /* Placeholder styling - changed to black */
          ::placeholder {
            color: #333;
            opacity: 0.6;
          }

          :-ms-input-placeholder {
            color: #333;
            opacity: 0.6;
          }

          ::-ms-input-placeholder {
            color: #333;
            opacity: 0.6;
          }

          /* Select placeholder styling - changed to black */
          select:invalid {
            color: #333;
            opacity: 0.6;
          }

          /* For select dropdown options */
          option {
            color: #333;
          }

          option[value=""][disabled] {
            color: #333;
            opacity: 0.6;
          }

          /* Custom date input styling */
          .date-input-container {
            position: relative;
            width: 100%;
          }

          .date-input-container input[type="date"] {
            width: 100%;
            padding: 16px 20px;
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

          /* Make the entire date field clickable */
          .date-input-container input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            color: transparent;
            cursor: pointer;
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
          }

          /* Custom calendar icon - made more visible with #4d6cff color */
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

          /* Style for empty date field - show "Date of Birth" placeholder */
          .date-input-container input[type="date"]:not(:valid)::before {
            content: "Date of Birth";
            color: #333;
            opacity: 0.6;
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-weight: 600;
          }

          /* Hide the default placeholder text */
          .date-input-container input[type="date"]::-webkit-input-placeholder {
            color: transparent;
          }

          .date-input-container input[type="date"]::-moz-placeholder {
            color: transparent;
          }

          .date-input-container input[type="date"]:-ms-input-placeholder {
            color: transparent;
          }

          .date-input-container input[type="date"]:-moz-placeholder {
            color: transparent;
          }

          /* Style for filled date field */
          .date-input-container input[type="date"]:valid {
            color: #333;
            opacity: 1;
          }

          /* Hide the custom placeholder when date is selected */
          .date-input-container input[type="date"]:valid::before {
            content: none;
          }

          /* Ensure the entire date input area is clickable */
          .date-input-container input[type="date"] {
            position: relative;
            z-index: 1;
          }

          /* Responsive styles */
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
            
            .date-input-container input[type="date"] {
              padding: 14px 18px;
              font-size: 15px;
            }
            
            .date-input-container input[type="date"]:not(:valid)::before {
              left: 18px;
            }
            
            .date-input-container::after {
              right: 18px;
            }
            
            button[type="submit"] {
              padding: 18px;
              font-size: 18px;
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
            
            .date-input-container input[type="date"] {
              padding: 12px 16px;
              font-size: 14px;
              border-radius: 14px;
            }
            
            .date-input-container input[type="date"]:not(:valid)::before {
              left: 16px;
              font-size: 14px;
            }
            
            .date-input-container::after {
              right: 16px;
              font-size: 18px;
            }
            
            button[type="submit"] {
              padding: 16px;
              font-size: 16px;
              border-radius: 14px;
            }
            
            .input-wrapper {
              margin-bottom: 16px;
            }
          }

          /* Small screen adjustments */
          @media (max-height: 700px) {
            .form-page-container {
              align-items: flex-start;
              padding-top: 30px;
            }
            
            .form-card {
              margin-top: 0;
            }
          }

          /* Select dropdown styling for responsiveness */
          .select-field {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234d6cff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 20px;
            padding-right: 50px;
          }

          @media (max-width: 480px) {
            .select-field {
              background-size: 18px;
              background-position: right 14px center;
              padding-right: 45px;
            }
          }
        `}
      </style>
      
      <div className="form-page-container">
        <div className="form-card">
          <h2 className="floating-title">
            Tranzio
          </h2>

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
            {/* Mobile Number - Auto-filled and Read-only */}
            <div className="input-wrapper">
              <input
                className="input-field auto-filled-field"
                type="text"
                name="mobileNo"
                placeholder="Mobile Number"
                value={formData.mobileNo}
                onChange={handleChange}
                readOnly
                disabled
              />
            </div>

            {/* Dealer - Auto-filled and Read-only */}
            <div className="input-wrapper">
              <input
                className="input-field auto-filled-field"
                type="text"
                name="dealer"
                placeholder="Dealer Name"
                value={formData.dealer}
                onChange={handleChange}
                readOnly
                disabled
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
                maxLength="10"
                // pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Please enter valid PAN (e.g., ABCDE1234F)"
                required
                style={{ textTransform: "uppercase" }}
              />
            </div>

            {/* Date of Birth - Updated with custom container */}
            <div className="input-wrapper">
              <div className="date-input-container">
                <input
                  className="input-field"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  style={{
                    color: formData.dateOfBirth ? "#333" : "transparent",
                    opacity: formData.dateOfBirth ? "1" : "1"
                  }}
                />
              </div>
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                width: "100%",
                padding: "20px",
                background: loading 
                  ? "#95a5a6" 
                  : apiStatus.status === 'error'
                  ? "#e74c3c"
                  : "#4d6cff",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: "800",
                cursor: loading ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                textTransform: "uppercase",
                letterSpacing: "2px",
                boxShadow: loading 
                  ? "0 10px 30px rgba(149, 165, 166, 0.4)"
                  : apiStatus.status === 'error'
                  ? "0 10px 30px rgba(231, 76, 60, 0.4)"
                  : "0 10px 30px rgba(77, 108, 255, 0.4)",
                transition: "all 0.3s ease"
              }}
            >
              {!loading && <div className="btn-shimmer"></div>}
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="loading-spinner"></div>
                  Checking Offers...
                </span>
              ) : (
                <span>
                  {apiStatus.status === 'error' ? 'Check Anyway' : 'Check Discount'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}