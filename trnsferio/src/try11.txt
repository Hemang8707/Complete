// OTPVerificationPage.js - UPDATED to redirect directly to discount page
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from './api';

function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mobileNo, setMobileNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(300); 
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  // Get form data from location state or session storage
  useEffect(() => {
    if (location.state) {
      if (location.state.formData) {
        setFormData(location.state.formData);
        const mobileNumber = location.state.formData.mobileNo || "";
        setMobileNo(mobileNumber);
        
        // Store form data in session
        sessionStorage.setItem('pendingFormData', JSON.stringify(location.state.formData));
      }
      
      // Auto-send OTP on page load
      if (location.state.formData && location.state.formData.mobileNo) {
        sendOTP(location.state.formData.mobileNo);
      }
    } else {
      // Try to restore from session storage
      const storedData = sessionStorage.getItem('pendingFormData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
        const mobileNumber = parsedData.mobileNo || "";
        setMobileNo(mobileNumber);
        sendOTP(mobileNumber);
      } else {
        // No form data available - redirect back
        navigate("/form");
      }
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const sendOTP = async (mobileNumber) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.sendOTP({ mobileNo: mobileNumber });
      
      if (response.success) {
        setSuccess("OTP sent successfully to your mobile!");
        
        // Show dev OTP if available
        if (response.otp && process.env.NODE_ENV === 'development') {
          console.log("🔧 DEV MODE - OTP:", response.otp);
          setSuccess(`OTP sent! (Dev: ${response.otp})`);
        }
        
        setTimer(300); // Reset timer
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        
        // Focus first input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setError(response.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setTimeout(() => {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }, 10);
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      setTimeout(() => {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }, 10);
    }
    if (e.key === "ArrowRight" && index < 5) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const pastedOtp = pastedData.split("");
      const newOtp = [...pastedOtp];
      while (newOtp.length < 6) newOtp.push("");
      setOtp(newOtp.slice(0, 6));
      
      // Focus last input
      setTimeout(() => {
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
      }, 10);
    }
  };

  const submitFormDirectly = async (data) => {
    console.log("📤 Submitting form directly to get discount results...");
    setIsSubmitting(true);
    
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
      
      console.log("✅ Discount check complete, navigating to results");
      
      // Navigate to form page with result data
      // The FormPage will detect this and show results
      sessionStorage.setItem('discountResult', JSON.stringify(result));
      sessionStorage.setItem('needsSubmission', 'true');
      
      navigate("/form", { replace: true });
    } catch (err) {
      console.error("❌ Form submission error:", err);
      
      // Even on error, navigate back with error data
      const errorResult = {
        success: false,
        message: err.message || "Error processing request",
        basePrice: parseFloat(data.amount) || 0,
        finalPrice: parseFloat(data.amount) || 0,
        discount: 0,
        offerDetails: null,
        showPaymentButton: true,
        noOffersReason: "error"
      };
      
      sessionStorage.setItem('discountResult', JSON.stringify(errorResult));
      sessionStorage.setItem('needsSubmission', 'true');
      
      navigate("/form", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.verifyOTP({ 
        mobileNo: mobileNo, 
        otp: otpString 
      });
      
      if (response.success && response.verified) {
        setSuccess("✓ OTP verified successfully! Processing...");
        
        // Store verification status
        sessionStorage.setItem('otpVerified', 'true');
        sessionStorage.setItem('verifiedMobile', mobileNo);
        
        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Submit form directly and navigate to discount page
        if (formData) {
          await submitFormDirectly(formData);
        } else {
          console.error("No form data available");
          navigate("/form", { replace: true });
        }
      } else {
        setError(response.error || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setError(err.message || "OTP verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (canResend && !loading) {
      sendOTP(mobileNo);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBack = () => {
    // Clear verification status
    sessionStorage.removeItem('otpVerified');
    sessionStorage.removeItem('verifiedMobile');
    sessionStorage.removeItem('needsSubmission');
    
    // Navigate back with form data
    if (formData) {
      navigate("/form", { 
        state: { 
          formData: formData,
          returnToPage2: true 
        } 
      });
    } else {
      navigate("/form");
    }
  };

  const handleContainerClick = () => {
    const firstEmptyIndex = otp.findIndex(digit => digit === "");
    const indexToFocus = firstEmptyIndex !== -1 ? firstEmptyIndex : 5;
    setTimeout(() => {
      if (inputRefs.current[indexToFocus]) {
        inputRefs.current[indexToFocus].focus();
      }
    }, 10);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button 
          onClick={handleBack}
          disabled={isSubmitting || verifying}
          style={{
            ...styles.backButton,
            ...(isSubmitting || verifying ? { opacity: 0.5, cursor: 'not-allowed' } : {})
          }}
          onMouseOver={(e) => {
            if (!isSubmitting && !verifying) {
              e.currentTarget.style.backgroundColor = "#f0f4ff";
            }
          }}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          ← Back to Form
        </button>

        <h2 style={styles.title}>OTP Verification</h2>
        
        <div style={styles.subtitleContainer}>
          <p style={styles.subtitle}>
            We've sent a verification code to
          </p>
          <strong style={styles.phoneNumber}>+91 {mobileNo}</strong>
          <p style={styles.instruction}>
            Enter the 6-digit code sent to your mobile
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠</span> {error}
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✓</span> {success}
          </div>
        )}

        {/* Show submission status */}
        {isSubmitting && (
          <div style={{
            ...styles.successBox,
            background: "linear-gradient(135deg, #e3f2fd, #f0f8ff)",
            border: "2px solid #bbdefb"
          }}>
            <div style={styles.spinner}></div>
            <strong style={{ color: "#4d6cff" }}>
              Processing your request...
            </strong>
          </div>
        )}

        {/* OTP Input */}
        <div 
          style={styles.otpContainer}
          onClick={handleContainerClick}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              onFocus={(e) => {
                e.target.style.borderColor = "#4d6cff";
                e.target.style.boxShadow = "0 0 0 3px rgba(77, 108, 255, 0.1)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                if (!digit) {
                  e.target.style.borderColor = "#e0e0e0";
                }
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
              }}
              style={{
                ...styles.otpInput,
                ...(digit ? styles.otpInputFilled : {}),
                borderColor: digit ? "#4d6cff" : "#e0e0e0",
                backgroundColor: digit ? "#f0f4ff" : "white"
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              disabled={verifying || loading || isSubmitting}
            />
          ))}
        </div>

        {/* Timer */}
        <div style={styles.timer}>
          {timer > 0 ? (
            <p style={styles.timerText}>
              OTP expires in <span style={styles.timerCount}>{formatTime(timer)}</span>
            </p>
          ) : (
            <p style={styles.expiredText}>OTP has expired. Please request a new one.</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifying || isSubmitting || otp.join("").length !== 6}
          style={{
            ...styles.verifyButton,
            ...((verifying || isSubmitting || otp.join("").length !== 6) && styles.verifyButtonDisabled)
          }}
          onMouseOver={(e) => {
            if (!verifying && !isSubmitting && otp.join("").length === 6) {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(77, 108, 255, 0.3)";
            }
          }}
          onMouseOut={(e) => {
            if (!verifying && !isSubmitting && otp.join("").length === 6) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(77, 108, 255, 0.4)";
            }
          }}
        >
          {verifying || isSubmitting ? (
            <span style={styles.loadingText}>
              <div style={styles.spinner}></div>
              {isSubmitting ? "Processing..." : "Verifying..."}
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend OTP */}
        <div style={styles.resendContainer}>
          <p style={styles.resendText}>
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || loading || isSubmitting}
            style={{
              ...styles.resendButton,
              ...((!canResend || loading || isSubmitting) && styles.resendButtonDisabled)
            }}
            onMouseOver={(e) => {
              if (canResend && !loading && !isSubmitting) {
                e.currentTarget.style.backgroundColor = "#4d6cff";
                e.currentTarget.style.color = "white";
              }
            }}
            onMouseOut={(e) => {
              if (canResend && !loading && !isSubmitting) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#4d6cff";
              }
            }}
          >
            {loading ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${formatTime(timer)}`}
          </button>
        </div>

        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debugInfo}>
            <p style={styles.debugText}>
              📱 Mobile: {mobileNo} | OTP: {otp.join("")}/6
            </p>
            <p style={styles.debugText}>
              Timer: {formatTime(timer)} | Resend: {canResend ? "Yes" : "No"}
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7ff",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "30px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(77, 108, 255, 0.15)",
    maxWidth: "500px",
    width: "100%",
    position: "relative",
    border: "2px solid #e0e0e0",
    borderTop: "6px solid #4d6cff",
    animation: "slideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "transparent",
    border: "none",
    color: "#4d6cff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  title: {
    textAlign: "center",
    color: "#333",
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "15px",
    fontFamily: "Geneva, Arial, sans-serif",
    letterSpacing: "1px",
  },
  subtitleContainer: {
    textAlign: "center",
    marginBottom: "40px",
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
    marginBottom: "5px",
    lineHeight: "1.6",
  },
  phoneNumber: {
    color: "#4d6cff",
    fontSize: "18px",
    display: "block",
    margin: "10px 0",
    padding: "8px 16px",
    backgroundColor: "#f0f4ff",
    borderRadius: "12px",
    fontWeight: "700",
  },
  instruction: {
    color: "#888",
    fontSize: "14px",
    marginTop: "10px",
    fontStyle: "italic",
  },
  errorBox: {
    backgroundColor: "#ffe5e5",
    border: "2px solid #ffcccc",
    color: "#d32f2f",
    padding: "15px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    animation: "fadeIn 0.3s ease",
  },
  errorIcon: {
    fontSize: "18px",
  },
  successBox: {
    backgroundColor: "#e8f7ef",
    border: "2px solid #c6efd5",
    color: "#2ecc71",
    padding: "15px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    animation: "fadeIn 0.3s ease",
  },
  successIcon: {
    fontSize: "18px",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "30px",
    cursor: "pointer",
  },
  otpInput: {
    width: "55px",
    height: "65px",
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "700",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    color: "#333",
    caretColor: "#4d6cff",
  },
  otpInputFilled: {
    animation: "fadeIn 0.2s ease",
  },
  timer: {
    textAlign: "center",
    marginBottom: "30px",
  },
  timerText: {
    color: "#666",
    fontSize: "15px",
    fontWeight: "600",
  },
  timerCount: {
    color: "#ff4757",
    fontWeight: "800",
    fontSize: "17px",
  },
  expiredText: {
    color: "#ff4757",
    fontSize: "15px",
    fontWeight: "600",
  },
  verifyButton: {
    width: "100%",
    padding: "20px",
    backgroundColor: "#4d6cff",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "18px",
    fontWeight: "800",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    boxShadow: "0 10px 30px rgba(77, 108, 255, 0.4)",
  },
  verifyButtonDisabled: {
    backgroundColor: "#95a5a6",
    cursor: "not-allowed",
    transform: "none !important",
    boxShadow: "0 10px 30px rgba(149, 165, 166, 0.4) !important",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  spinner: {
    width: "22px",
    height: "22px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  resendContainer: {
    textAlign: "center",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f9faff",
    borderRadius: "12px",
  },
  resendText: {
    color: "#666",
    fontSize: "15px",
    marginBottom: "12px",
    fontWeight: "600",
  },
  resendButton: {
    backgroundColor: "transparent",
    color: "#4d6cff",
    border: "2px solid #4d6cff",
    padding: "12px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "150px",
  },
  resendButtonDisabled: {
    borderColor: "#ccc",
    color: "#ccc",
    cursor: "not-allowed",
  },
  debugInfo: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    textAlign: "center",
    border: "1px dashed #ccc",
  },
  debugText: {
    color: "#666",
    fontSize: "12px",
    marginBottom: "5px",
    fontFamily: "monospace",
  },
};

export default OTPVerificationPage;