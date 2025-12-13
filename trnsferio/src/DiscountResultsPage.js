import React, { useState, useEffect } from "react";
import { api, API_BASE } from './api'; // Import API helper

const DiscountResultsPage = ({ resultData, onBackToForm }) => {
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sidebarOffer, setSidebarOffer] = useState(null); // Track which offer is shown in sidebar
  const [showSidebar, setShowSidebar] = useState(false); // Control sidebar visibility

  // Primary design tokens copied from FormPage
  const PRIMARY = "#4d6cff";
  const PRIMARY_DARK = "#3a5bef";
  const ACCENT = "#667eea";
  const CARD_BORDER = "rgba(77, 108, 255, 0.15)";
  const GREY_BORDER = "rgba(0, 0, 0, 0.08)"; // Added grey border color

  // Debug logging
  useEffect(() => {
    console.log("Result Data:", resultData);
    if (resultData && resultData.allOffers) {
      console.log("All Offers with Card Info:", resultData.allOffers.map(offer => ({
        bank: offer.bank,
        cardLimit: offer.cardLimit,
        exactCardInfo: offer.exactCardInfo,
        exactLimit: offer.exactLimit
      })));
    }
    if (resultData && resultData.customerBanks) {
      console.log("Customer Banks:", resultData.customerBanks);
    }
  }, [resultData]);

  // ADDED MISSING FUNCTION HERE
  const handleProceedWithSelectedOffer = async () => {
    setProcessingPayment(true);
    
    try {
      const selectedOffer = resultData.allOffers && resultData.allOffers[selectedOfferIndex] 
        ? resultData.allOffers[selectedOfferIndex] 
        : resultData.offerDetails;
      
      const currentDiscount = selectedOffer ? selectedOffer.discount : resultData.discount;
      const currentFinalPrice = selectedOffer ? selectedOffer.finalPrice : resultData.finalPrice;

      const paymentData = {
        amount: currentFinalPrice,
        discount: currentDiscount,
        selectedOffer: selectedOffer,
        customerData: {
          mobile: resultData.mobileNo,
          brand: resultData.brand,
          model: resultData.model
        }
      };

      // Try to process payment via API
      try {
        const paymentResult = await api.processPayment(paymentData);
        console.log("Payment initiated:", paymentResult);
      } catch (apiError) {
        console.log("API payment processing failed (using fallback):", apiError.message);
      }

      // Simulate payment processing
      setTimeout(() => {
        setProcessingPayment(false);
        alert(`Payment Gateway Integration\n\nSelected Offer: ${selectedOffer?.bank || 'Standard'} Bank\nAmount: ₹${currentFinalPrice?.toLocaleString()}\nDiscount Applied: ₹${currentDiscount?.toLocaleString() || 0}\n\n🔒 Redirecting to secure payment gateway...`);
      }, 2500);

    } catch (error) {
      console.error("Payment processing error:", error);
      setProcessingPayment(false);
      alert("Payment processing encountered an issue. Please try again.");
    }
  };

  if (!resultData) {
    return (
      <div className="discount-container">
        <div className="discount-box">
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>No results to display</h3>
          <button 
            onClick={onBackToForm} 
            className="discount-button primary"
          >
            Back to Form
          </button>
        </div>

        <style>{`
          .discount-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom, #ffffff 0%, #f6f8ff 50%, #ffffff 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px 20px;
          }

          .discount-box {
            width: 100%;
            max-width: 560px;
            background: rgba(255,255,255,0.98);
            border-radius: 20px;
            padding: 2.25rem;
            box-shadow: 0 20px 60px ${CARD_BORDER};
            border-top: 8px solid ${PRIMARY};
            border-right: 2px solid ${GREY_BORDER};
            border-bottom: 2px solid ${GREY_BORDER};
            border-left: 2px solid ${GREY_BORDER};
            text-align: center;
          }

          .discount-button {
            padding: 12px 24px;
            background: ${PRIMARY};
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            transition: all 0.25s ease;
            box-shadow: 0 10px 30px rgba(77,108,255,0.2);
          }

          .discount-button.primary:hover {
            transform: translateY(-3px);
            background: ${PRIMARY_DARK};
            box-shadow: 0 14px 36px rgba(58,91,239,0.25);
          }
        `}</style>
      </div>
    );
  }

  // Check for specific scenarios
  const isNoCreditCardScenario = resultData.noOffersReason === "no_credit_card";
  const isNotRegistered = resultData.noOffersReason === "not_registered";
  const isConnectionError = resultData.noOffersReason === "connection_error" || 
                            resultData.noOffersReason === "network_error" ||
                            resultData.noOffersReason === "server_error" ||
                            resultData.noOffersReason === "endpoint_error";
  const isNoOffersScenario = isNoCreditCardScenario || isNotRegistered || isConnectionError || 
                            (!resultData.success && resultData.discount === 0);

  const handleProceedToPayment = async () => {
    setProcessingPayment(true);
    
    try {
      const paymentData = {
        amount: resultData.finalPrice || resultData.basePrice,
        discount: resultData.discount || 0,
        selectedOffer: selectedOfferIndex !== null && resultData.allOffers 
          ? resultData.allOffers[selectedOfferIndex] 
          : resultData.offerDetails,
        customerData: {
          mobile: resultData.mobileNo,
          brand: resultData.brand,
          model: resultData.model
        }
      };

      // Try to log payment attempt via API (if available)
      try {
        await api.logPaymentAttempt(paymentData);
      } catch (apiError) {
        console.log("Payment logging failed (offline mode):", apiError.message);
      }

      // Simulate payment gateway redirect
      setTimeout(() => {
        setProcessingPayment(false);
        alert(`Payment Gateway Integration\n\nAmount: ₹${(resultData.finalPrice || resultData.basePrice)?.toLocaleString()}\nDiscount Applied: ₹${resultData.discount?.toLocaleString() || 0}\n\nThis would redirect to your payment processor.\n\n🔒 Secure Payment Gateway`);
      }, 2000);

    } catch (error) {
      console.error("Payment processing error:", error);
      setProcessingPayment(false);
      alert("Payment processing encountered an issue. Please try again.");
    }
  };

  if (isNoOffersScenario) {
    return (
      <div className="discount-page-container">
        <div className="background-effect"></div>
        <div className="no-offers-wrapper">
          <div className="discount-card">

            <div className="discount-header error">
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                {isNoCreditCardScenario ? "💳" : 
                isNotRegistered ? "🔍" : 
                isConnectionError ? "🌐" : "😔"}
              </div>
              <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "800", color: "#fff" }}>
                {isNoCreditCardScenario ? "No offers available for your card" : 
                isNotRegistered ? "Registration Required" : 
                isConnectionError ? "Connection Issue" : "No Offers Available"}
              </h2>
              <p style={{ margin: "8px 0 0 0", fontSize: "15px", opacity: "0.95", color: "rgba(255,255,255,0.95)" }}>
                {isNoCreditCardScenario ? "Limited discount options available" : 
                isNotRegistered ? "Please register your bank details" : 
                isConnectionError ? "Working in offline mode" : "Keep checking for future offers"}
              </p>
            </div>

            {/* Content */}
            <div className="discount-content">
              {/* Connection Status Info */}
              {isConnectionError && (
                <div className="info-box warning">
                  <div style={{ fontSize: "20px", marginBottom: "10px" }}>🔧</div>
                  <strong style={{ color: PRIMARY, display: "block", marginBottom: "8px" }}>
                    Offline Mode Active
                  </strong>
                  <div style={{ fontSize: "14px", color: PRIMARY, lineHeight: "1.4" }}>
                    Unable to fetch live discounts. You can proceed with standard pricing, 
                    or try again when connection is restored.
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="message-box">
                <div style={{ 
                  whiteSpace: "pre-line", 
                  lineHeight: "1.6",
                  fontSize: "14px",
                  color: "#333",
                  textAlign: "left"
                }}>
                  {resultData.message}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="pricing-box">
                <h3 style={{ 
                  margin: "0 0 12px 0", 
                  color: "#333", 
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: "800"
                }}>
                  Pricing Details
                </h3>

                <div className="price-row">
                  <span style={{ fontSize: "15px", color: "#666" }}>Base Price:</span>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#333" }}>
                    ₹{resultData.basePrice?.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="price-row">
                  <span style={{ fontSize: "15px", color: "#666" }}>Discount:</span>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#999" }}>
                    ₹0
                  </span>
                </div>

                <div className="price-row total">
                  <span style={{ fontSize: "17px", color: "#333", fontWeight: "800" }}>
                    Final Price:
                  </span>
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#333" }}>
                    ₹{resultData.finalPrice?.toLocaleString() || resultData.basePrice?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={handleProceedToPayment}
                  disabled={processingPayment}
                  className={`discount-button primary ${processingPayment ? 'processing' : ''}`}
                >
                  {processingPayment ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="spinner"></div>
                      Processing...
                    </span>
                  ) : (
                    `Proceed to Payment - ₹${resultData.finalPrice?.toLocaleString() || resultData.basePrice?.toLocaleString() || '0'}`
                  )}
                </button>

                <button
                  onClick={onBackToForm}
                  disabled={processingPayment}
                  className="discount-button secondary"
                >
                  Check Another Product
                </button>
              </div>

              {/* API Info */}
              {isConnectionError && (
                <div className="tech-info">
                  <strong>🔧 Technical Info:</strong><br />
                  API Base: {API_BASE}<br />
                  Status: Offline Mode Active
                </div>
              )}

              {/* Customer Banks Info (if available) */}
              {resultData.customerBanks && resultData.customerBanks.length > 0 && (
                <div className="banks-info">
                  <strong>Your Registered Cards:</strong><br />
                  {resultData.customerBanks.map((bank, index) => (
                    <div key={index} style={{ margin: "3px 0" }}>
                      • {typeof bank === 'object' ? bank.name : bank}
                      {/* Show the exact card limit from baningcredentials */}
                      {bank.exactLimit !== undefined && bank.exactLimit !== null && (
                        <span style={{ color: PRIMARY, fontSize: "12px", marginLeft: "8px", fontWeight: "700" }}>
                          (Limit: ₹{parseFloat(bank.exactLimit).toLocaleString()})
                        </span>
                      )}
                      {/* Fallback to cardLimit if exactLimit not available */}
                      {(!bank.exactLimit && bank.cardLimit !== undefined && bank.cardLimit !== null) && (
                        <span style={{ color: PRIMARY, fontSize: "12px", marginLeft: "8px", fontWeight: "700" }}>
                          (Limit: ₹{bank.cardLimit.toLocaleString()})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
        .discount-page-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: linear-gradient(to bottom, #ffffff 0%, #f7f9ff 40%, #ffffff 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            position: relative;
          }

          .background-effect {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 40vh;
            background: linear-gradient(180deg, ${PRIMARY}33 0%, transparent 100%);
            z-index: 0;
            pointer-events: none;
          }

          .no-offers-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 680px;
            position: relative;
            z-index: 10;
          }

          .discount-card {
            width: 100%;
            background: white;
            border-radius: 18px;
            box-shadow: 0 20px 60px ${CARD_BORDER};
            overflow: hidden;
            position: relative;
            border-top: 8px solid ${PRIMARY};
            border-right: 2px solid ${GREY_BORDER};
            border-bottom: 2px solid ${GREY_BORDER};
            border-left: 2px solid ${GREY_BORDER};
          }

          .discount-header {
            padding: 22px;
            text-align: center;
            background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK});
            color: white;
          }

          .discount-content {
            padding: 26px;
          }

          .info-box {
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
            text-align: center;
            border: 1px solid rgba(77,108,255,0.08);
          }

          .info-box.warning {
            background: linear-gradient(135deg, #f8fbff, #f2f7ff);
            border: 1px solid rgba(102,126,234,0.12);
          }

          .message-box {
            background: #fbfdff;
            border: 1px solid #eef3ff;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 18px;
          }

          .pricing-box {
            background: #fbfdff;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
            border: 1px solid #eef3ff;
          }

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f4ff;
          }

          .price-row.total {
            padding: 12px 0 6px 0;
            margin-top: 8px;
            border-bottom: none;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 8px;
            flex-wrap: wrap;
          }

          .discount-button {
            padding: 12px 22px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.25s ease;
            position: relative;
            min-width: 220px;
          }

          .discount-button.primary {
            background: linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK});
            color: white;
            box-shadow: 0 12px 36px rgba(77,108,255,0.18);
          }

          .discount-button.primary:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 16px 42px rgba(58,91,239,0.22);
          }

          .discount-button.secondary {
            background: linear-gradient(90deg, #6c757d, #495057);
            color: white;
            box-shadow: 0 8px 26px rgba(0,0,0,0.06);
          }

          .discount-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 2px solid white;
            animation: spin 1s linear infinite;
            margin-right: 8px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .tech-info {
            margin-top: 18px;
            padding: 12px;
            background: #fbfdff;
            border-radius: 8px;
            font-size: 13px;
            text-align: center;
            border: 1px solid #eef3ff;
          }

          .banks-info {
            margin-top: 16px;
            padding: 12px;
            background: #fbfdff;
            border-radius: 8px;
            font-size: "13px";
            border: 1px solid #eef3ff;
          }
        `}</style>
      </div>
    );
  }

  // Rest of the existing code for normal discount scenarios
  const selectedOffer = resultData.allOffers && resultData.allOffers[selectedOfferIndex] 
    ? resultData.allOffers[selectedOfferIndex] 
    : resultData.offerDetails;

  const hasDiscount = resultData.discount > 0;
  const hasMultipleOffers = resultData.allOffers && resultData.allOffers.length > 1;
  const isError = resultData.message && (
    resultData.message.includes("Error") || 
    resultData.message.includes("not found") ||
    resultData.message.includes("No discount")
  );

  // Calculate pricing based on selected offer
  const currentDiscount = selectedOffer ? selectedOffer.discount : resultData.discount;
  const currentFinalPrice = selectedOffer ? selectedOffer.finalPrice : resultData.finalPrice;

  const handleOfferSelect = (index) => {
    setSelectedOfferIndex(index);
    // If the selected offer is already in sidebar, keep it open
    if (sidebarOffer && sidebarOffer.index === index) {
      return;
    }
    // Otherwise, close the sidebar when selecting a new offer
    setShowSidebar(false);
    setSidebarOffer(null);
  };

  const handleViewFeatures = (index, e) => {
    e.stopPropagation(); // Prevent card selection when clicking the button
    
    const offer = resultData.allOffers[index];
    
    // If clicking the same offer's button, toggle the sidebar
    if (sidebarOffer && sidebarOffer.index === index && showSidebar) {
      setShowSidebar(false);
      setSidebarOffer(null);
    } else {
      // Otherwise, open sidebar with new offer
      setSidebarOffer({
        index,
        offer: offer
      });
      setShowSidebar(true);
    }
  };

  const handleViewSelectedFeatures = (e) => {
    e.stopPropagation();
    
    // If the selected offer is already in sidebar, toggle it
    if (sidebarOffer && sidebarOffer.index === selectedOfferIndex && showSidebar) {
      setShowSidebar(false);
      setSidebarOffer(null);
    } else {
      // Otherwise, open sidebar with selected offer
      setSidebarOffer({
        index: selectedOfferIndex,
        offer: selectedOffer
      });
      setShowSidebar(true);
    }
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setSidebarOffer(null);
  };

  // Helper function to get card limit from exactCardInfo
  const getCardLimit = (offer) => {
    if (!offer) return 0;
    
    // Try multiple ways to get the card limit
    const possibleLimits = [
      offer.cardLimit,                // Direct cardLimit
      offer.exactCardLimit,           // exactCardLimit field
      offer.exactCardInfo?.cardLimit, // From exactCardInfo object
      offer.exactCardInfo?.parsedCardLimit, // parsed version
      offer.exactLimit,               // From customer banks
      0                              // Default fallback
    ];
    
    for (const limit of possibleLimits) {
      if (limit !== undefined && limit !== null) {
        const parsed = parseFloat(limit);
        if (!isNaN(parsed) && parsed > 0) {
          console.log(`🔍 Found card limit for ${offer.bank || offer.bankName}: ${parsed} from field: ${Object.keys(offer).find(k => offer[k] === limit)}`);
          return parsed;
        }
      }
    }
    
    return 0;
  };

  return (
    <div className="discount-page-container">
      <div className="background-effect"></div>
      <style>
        {`
          .discount-page-container {
            min-height: 100vh;
            padding: 24px;
            background: linear-gradient(to bottom, #ffffff 0%, #f7f9ff 30%, #ffffff 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            position: relative;
            display: flex;
            justify-content: center;
            transition: padding 0.3s ease;
          }

          .background-effect {
            position: fixed;
            top: 10px;
            left: 0;
            right: 0;
            height: 28vh;
            background: linear-gradient(180deg, ${PRIMARY}22 0%, transparent 100%);
            z-index: 0;
            pointer-events: none;
          }

          .main-content-wrapper {
            display: flex;
            width: 100%;
            max-width: 1200px;
            gap: 24px;
            position: relative;
            z-index: 10;
          }

          .main-content {
            flex: 1;
            min-width: 0; /* Prevents flex item from overflowing */
          }

          .discount-card-main {
            background: white;
            border-radius: 18px;
            box-shadow: 0 20px 60px ${CARD_BORDER};
            overflow: hidden;
            position: relative;
            margin-bottom: 20px;
            z-index: 10;
            border-top: 8px solid ${PRIMARY};
            border-right: 2px solid ${GREY_BORDER};
            border-bottom: 2px solid ${GREY_BORDER};
            border-left: 2px solid ${GREY_BORDER};
          }

          .offer-card {
            transition: all 0.25s cubic-bezier(0.2, 0.9, 0.2, 1);
            background: white;
            border-radius: 12px;
            padding: 18px;
            cursor: pointer;
            position: relative;
            border-top: 1px solid #eef3ff;
            border-right: 2px solid ${GREY_BORDER};
            border-bottom: 2px solid ${GREY_BORDER};
            border-left: 2px solid ${GREY_BORDER};
          }

          .offer-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 14px 40px rgba(77,108,255,0.12);
            border-top-color: ${ACCENT};
            border-right-color: ${ACCENT};
            border-bottom-color: ${ACCENT};
            border-left-color: ${ACCENT};
          }

          .discount-button {
            padding: 12px 28px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.25s ease;
            position: relative;
            overflow: hidden;
            margin: 8px;
          }

          .discount-button.primary {
            background: linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK});
            color: white;
            box-shadow: 0 12px 36px rgba(77,108,255,0.18);
          }

          .discount-button.primary:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 16px 42px rgba(58,91,239,0.22);
          }

          .discount-button.secondary {
            background: linear-gradient(90deg, #6c757d, #495057);
            color: white;
            box-shadow: 0 8px 26px rgba(0,0,0,0.06);
          }

          .discount-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 2px solid white;
            animation: spin 1s linear infinite;
            margin-right: 8px;
          }

          .discount-header.success {
            background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK});
          }

          .discount-content-main {
            padding: 26px;
          }

          .view-features-btn {
            padding: 6px 12px;
            background: rgba(77, 108, 255, 0.1);
            color: ${PRIMARY};
            border: 1px solid ${PRIMARY};
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s ease;
            margin-left: 10px;
          }

          .view-features-btn:hover {
            background: rgba(77, 108, 255, 0.2);
            transform: translateY(-2px);
          }

          /* Sidebar Styles */
          .features-sidebar {
            position: sticky;
            top: 24px;
            width: 320px;
            height: fit-content;
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            background: white;
            border-radius: 18px;
            box-shadow: 0 20px 60px ${CARD_BORDER};
            border-top: 8px solid ${PRIMARY};
            border-right: 2px solid ${GREY_BORDER};
            border-bottom: 2px solid ${GREY_BORDER};
            border-left: 2px solid ${GREY_BORDER};
            animation: slideIn 0.3s ease;
            z-index: 20;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .sidebar-header {
            padding: 20px;
            background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK});
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .sidebar-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 800;
          }

          .close-sidebar-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          }

          .close-sidebar-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
          }

          .sidebar-content {
            padding: 20px;
          }

          .offer-badge {
            display: inline-block;
            background: linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK});
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 12px;
          }

          .features-list {
            margin: 0;
            padding-left: 20px;
            font-size: 14px;
            color: #555;
            line-height: 1.6;
          }

          .features-list li {
            margin-bottom: 8px;
          }

          .card-limit-highlight {
            background: rgba(77, 108, 255, 0.08);
            padding: 12px;
            border-radius: 8px;
            margin: 16px 0;
            border-left: 4px solid ${PRIMARY};
          }

          .terms-note {
            margin-top: 20px;
            padding: 12px;
            background: #f8fbff;
            border-radius: 8px;
            font-size: 12px;
            color: #888;
            font-style: italic;
            border: 1px solid #eef3ff;
          }

          /* Responsive adjustments */
          @media (max-width: 1024px) {
            .main-content-wrapper {
              flex-direction: column;
            }
            
            .features-sidebar {
              width: 100%;
              position: static;
              margin-top: 20px;
            }
          }
        `}
      </style>
      
      <div className="main-content-wrapper">
        <div className="main-content">
          {/* All Offers Comparison */}
          {hasMultipleOffers && (
            <div className="discount-card-main" style={{ 
              opacity: processingPayment ? 0.6 : 1,
              pointerEvents: processingPayment ? "none" : "auto"
            }}>
              <div className="discount-content-main">
                <h3 style={{ 
                  textAlign: "center", 
                  margin: "0 0 20px 0", 
                  color: "#333", 
                  fontSize: "20px",
                  fontWeight: "800"
                }}>
                  🔥 All Available Offers Comparison
                </h3>

                <div style={{ display: "grid", gap: "14px" }}>
                  {resultData.allOffers.map((offer, index) => {
                    const cardLimit = getCardLimit(offer);
                    return (
                      <div 
                        key={index}
                        onClick={() => handleOfferSelect(index)}
                        className="offer-card"
                        style={{
                          background: selectedOfferIndex === index
                            ? "linear-gradient(135deg, #f7f9ff, #eef6ff)"
                            : "white",
                          borderTop: selectedOfferIndex === index
                            ? `2px solid ${PRIMARY}`
                            : "1px solid #eef3ff",
                          borderRight: selectedOfferIndex === index
                            ? `2px solid ${PRIMARY}`
                            : `2px solid ${GREY_BORDER}`,
                          borderBottom: selectedOfferIndex === index
                            ? `2px solid ${PRIMARY}`
                            : `2px solid ${GREY_BORDER}`,
                          borderLeft: selectedOfferIndex === index
                            ? `2px solid ${PRIMARY}`
                            : `2px solid ${GREY_BORDER}`,
                          transform: selectedOfferIndex === index ? "scale(1.01)" : "scale(1)"
                        }}
                      >
                        {offer.isBestOffer && (
                          <div style={{
                            position: "absolute",
                            top: "-10px",
                            right: "20px",
                            background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "14px",
                            fontSize: "12px",
                            fontWeight: "800"
                          }}>
                            🏆 BEST OFFER
                          </div>
                        )}

                        {selectedOfferIndex === index && (
                          <div style={{
                            position: "absolute",
                            top: "-10px",
                            left: "20px",
                            background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "14px",
                            fontSize: "12px",
                            fontWeight: "800"
                          }}>
                            ✓ SELECTED
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ 
                              margin: "0 0 8px 0", 
                              color: selectedOfferIndex === index ? PRIMARY : "#333",
                              fontSize: "16px",
                              fontWeight: "800"
                            }}>
                              {offer.isPersonalized ? "🌟 " : "💳 "}{offer.bank} Bank
                            </h4>
                            <p style={{ 
                              margin: "0 0 10px 0", 
                              color: "#666", 
                              fontSize: "14px",
                              lineHeight: "1.4"
                            }}>
                              {offer.discountName}
                            </p>
                            <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
                              {offer.isPersonalized ? "Personalized for you" : "Standard offer"} • 
                              {offer.discountType === 'percentage' 
                                ? ` ${offer.discountValue}% discount`
                                : ` ₹${offer.discountValue} flat discount`}
                            </div>
                            
                            {/* Card Limit Section - ALWAYS SHOWS */}
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              marginTop: "8px",
                              flexWrap: "wrap",
                              gap: "8px"
                            }}>
                              {/* Card Limit always shows, even if 0 */}
                              <div style={{ 
                                fontSize: "13px", 
                                color: "#666", 
                                fontWeight: "600",
                                padding: "6px 10px",
                                background: "rgba(77, 108, 255, 0.08)",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center"
                              }}>
                                <span style={{ marginRight: "6px" }}>💳</span>
                                Card Limit: ₹{cardLimit.toLocaleString()}
                              </div>
                              
                              {/* View Features Button */}
                              <button 
                                className="view-features-btn"
                                onClick={(e) => handleViewFeatures(index, e)}
                              >
                                {sidebarOffer && sidebarOffer.index === index && showSidebar ? "Hide Features" : "View Features"}
                              </button>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", marginLeft: "20px" }}>
                            <div style={{ 
                              fontSize: "18px", 
                              fontWeight: "900", 
                              color: selectedOfferIndex === index ? PRIMARY : "#666",
                              marginBottom: "6px"
                            }}>
                              -₹{offer.discount.toLocaleString()}
                            </div>
                            <div style={{ 
                              fontSize: "15px", 
                              color: "#999",
                              textDecoration: "line-through"
                            }}>
                              ₹{resultData.basePrice.toLocaleString()}
                            </div>
                            <div style={{ 
                              fontSize: "20px", 
                              fontWeight: "900", 
                              color: selectedOfferIndex === index ? PRIMARY : "#333"
                            }}>
                              ₹{offer.finalPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          marginTop: "10px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: selectedOfferIndex === index ? PRIMARY : "#999",
                          fontStyle: "italic"
                        }}>
                          {selectedOfferIndex === index ? "Currently selected" : "Click to select this offer"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Results Card */}
          <div className="discount-card-main" style={{ 
            opacity: processingPayment ? 0.8 : 1,
            pointerEvents: processingPayment ? "none" : "auto"
          }}>
            {/* Header */}
            <div className={`discount-header ${hasDiscount && !isError ? 'success' : 'error'}`}>
              <div style={{ fontSize: "48px", marginBottom: "10px",textAlign: "center" }}>
                {hasDiscount && !isError ? "🎉" : "😔"}
              </div>
              <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "800",textAlign: "center",color: "#fff" }}>
                {hasDiscount && !isError ? "Great News!" : "No Offers Available"}
              </h2>
              <p style={{ margin: "8px 0 0 0", fontSize: "15px", opacity: "0.95",textAlign: "center",color: "rgba(255,255,255,0.95)" }}>
                {hasDiscount && !isError 
                  ? hasMultipleOffers 
                    ? `${resultData.allOffers.length} offers found! ${selectedOffer?.isBestOffer ? "Showing the best one." : "Custom selection active."}`
                    : "You've got a fantastic discount!" 
                  : "Keep checking for future offers"}
              </p>
            </div>

            {/* Main Content */}
            <div className="discount-content-main">
              {/* Selected Offer Details */}
              {hasDiscount && !isError && selectedOffer && (
                <div style={{
                  background: "linear-gradient(135deg, #f7f9ff, #eef6ff)",
                  borderTop: "1px solid #eef6ff",
                  borderRight: `2px solid ${GREY_BORDER}`,
                  borderBottom: `2px solid ${GREY_BORDER}`,
                  borderLeft: `2px solid ${GREY_BORDER}`,
                  borderRadius: "12px",
                  padding: "18px",
                  marginBottom: "20px",
                  textAlign: "center",
                  position: "relative"
                }}>
                  {selectedOffer.isBestOffer && (
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      right: "20px",
                      background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                      color: "white",
                      padding: "6px 14px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}>
                      🏆 BEST OFFER
                    </div>
                  )}
                  <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                    {selectedOffer.isPersonalized ? "🌟" : "💳"}
                  </div>
                  <h3 style={{ 
                    color: PRIMARY, 
                    margin: "0 0 8px 0", 
                    fontSize: "18px",
                    fontWeight: "900"
                  }}>
                    Currently Selected: {selectedOffer.bank} Bank
                  </h3>
                  <p style={{ 
                    color: PRIMARY_DARK, 
                    margin: "0", 
                    fontSize: "14px",
                    fontWeight: "700"
                  }}>
                    {selectedOffer.isPersonalized ? "🌟 Personalized Offer" : "🎯 Standard Offer"}
                  </p>
                  
                  {/* Card Limit Display for Selected Offer */}
                  {selectedOffer && (
                    <div style={{ 
                      margin: "10px 0",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 14px",
                      background: "rgba(77, 108, 255, 0.08)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#666",
                      fontWeight: "600"
                    }}>
                      <span style={{ marginRight: "8px" }}>💳</span>
                      Card Limit: ₹{getCardLimit(selectedOffer).toLocaleString()}
                      <button 
                        className="view-features-btn"
                        onClick={handleViewSelectedFeatures}
                        style={{ marginLeft: "12px" }}
                      >
                        {sidebarOffer && sidebarOffer.index === selectedOfferIndex && showSidebar ? "Hide Features" : "View Features"}
                      </button>
                    </div>
                  )}
                  
                  <p style={{ 
                    color: "#666", 
                    margin: getCardLimit(selectedOffer) && getCardLimit(selectedOffer) > 0 ? "12px 0 0 0" : "8px 0 0 0", 
                    fontSize: "13px"
                  }}>
                    {selectedOffer.discountName}
                  </p>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div style={{
                background: "#fbfdff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                borderTop: "1px solid #eef6ff",
                borderRight: `2px solid ${GREY_BORDER}`,
                borderBottom: `2px solid ${GREY_BORDER}`,
                borderLeft: `2px solid ${GREY_BORDER}`
              }}>
                <h3 style={{ 
                  margin: "0 0 16px 0", 
                  color: "#333", 
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "900"
                }}>
                  💰 Pricing Details
                </h3>

                <div>
                  {/* Base Price */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f6ff"
                  }}>
                    <span style={{ fontSize: "15px", color: "#666" }}>Base Price:</span>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "#333" }}>
                      ₹{resultData.basePrice?.toLocaleString() || '0'}
                    </span>
                  </div>

                  {/* Selected Discount */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f6ff"
                  }}>
                    <span style={{ fontSize: "15px", color: "#666" }}>
                      Selected Discount:
                    </span>
                    <span style={{ 
                      fontSize: "18px", 
                      fontWeight: "900", 
                      color: currentDiscount > 0 ? PRIMARY : "#999" 
                    }}>
                      {currentDiscount > 0 ? `-₹${currentDiscount?.toLocaleString()}` : "₹0"}
                    </span>
                  </div>

                  {/* Final Price */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0 6px 0",
                    marginTop: "10px"
                  }}>
                    <span style={{ fontSize: "17px", color: "#333", fontWeight: "900" }}>
                      Final Price:
                    </span>
                    <span style={{ 
                      fontSize: "22px", 
                      fontWeight: "900", 
                      color: currentDiscount > 0 ? PRIMARY : "#333"
                    }}>
                      ₹{currentFinalPrice?.toLocaleString() || resultData.basePrice?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Savings Highlight */}
                {currentDiscount > 0 && !isError && (
                  <div style={{
                    background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                    color: "white",
                    padding: "14px",
                    borderRadius: "10px",
                    textAlign: "center",
                    marginTop: "16px",
                    fontWeight: "800",
                    borderTop: "1px solid rgba(255,255,255,0.3)",
                    borderRight: "2px solid rgba(255,255,255,0.3)",
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    borderLeft: "2px solid rgba(255,255,255,0.3)"
                  }}>
                    <div style={{ fontSize: "18px", marginBottom: "6px" }}>
                      💰
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "900" }}>
                      You save: ₹{currentDiscount?.toLocaleString()}!
                    </div>
                    {selectedOffer?.isBestOffer && (
                      <div style={{ fontSize: "13px", marginTop: "6px", opacity: "0.95" }}>
                        This is your best available offer
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: "center", marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={onBackToForm}
                  disabled={processingPayment}
                  className="discount-button secondary"
                  style={{ minWidth: 200 }}
                >
                  Check Another Product
                </button>

                {currentDiscount > 0 && !isError && (
                  <button
                    onClick={handleProceedWithSelectedOffer}
                    disabled={processingPayment}
                    className={`discount-button primary ${processingPayment ? 'processing' : ''}`}
                    style={{ minWidth: 220 }}
                  >
                    {processingPayment ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="spinner"></div>
                        Processing...
                      </span>
                    ) : (
                      `Proceed with ${selectedOffer?.bank} Bank`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Banks */}
          {resultData.customerBanks && resultData.customerBanks.length > 0 && (
            <div className="discount-card-main" style={{ 
              marginTop: "18px",
              borderTop: `8px solid ${PRIMARY}`,
              borderRight: `2px solid ${GREY_BORDER}`,
              borderBottom: `2px solid ${GREY_BORDER}`,
              borderLeft: `2px solid ${GREY_BORDER}`
            }}>
              <div className="discount-content-main">
                <h4 style={{ margin: "0 0 12px 0", color: PRIMARY, textAlign: "center", fontWeight: "900" }}>
                  🏦 Your Registered Banks
                </h4>
                <div style={{ textAlign: "center" }}>
                  {resultData.customerBanks.map((bank, index) => (
                    <div key={index} style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #f7f9ff, #eef6ff)",
                      padding: "8px 14px",
                      margin: "6px",
                      borderRadius: "18px",
                      fontSize: "14px",
                      color: PRIMARY,
                      border: `2px solid ${GREY_BORDER}`,
                      fontWeight: "800"
                    }}>
                      {typeof bank === 'object' ? bank.name : bank}
                      {typeof bank === 'object' && (
                        <span style={{ 
                          display: "block", 
                          fontSize: "11px", 
                          marginTop: "4px", 
                          color: "#666",
                          fontWeight: "600" 
                        }}>
                          Limit: ₹{(bank.exactLimit ? parseFloat(bank.exactLimit) : 
                            (bank.cardLimit || 0)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Sidebar */}
        {showSidebar && sidebarOffer && sidebarOffer.offer && (
          <div className="features-sidebar">
            <div className="sidebar-header">
              <h3>🎯 Offer Features</h3>
              <button className="close-sidebar-btn" onClick={handleCloseSidebar}>
                ×
              </button>
            </div>
            
            <div className="sidebar-content">
              {/* Offer Type Badge */}
              <div className="offer-badge">
                {sidebarOffer.offer.isPersonalized ? "🌟 Personalized Offer" : "💳 Standard Offer"}
              </div>
              
              <h4 style={{ 
                margin: "0 0 12px 0", 
                color: PRIMARY,
                fontSize: "16px",
                fontWeight: "800"
              }}>
                {sidebarOffer.offer.bank} Bank
              </h4>
              
              <p style={{ 
                color: "#666", 
                margin: "0 0 16px 0", 
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
                {sidebarOffer.offer.discountName}
              </p>
              
              {/* Card Limit Highlight */}
              <div className="card-limit-highlight">
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: PRIMARY
                }}>
                  <span style={{ marginRight: "8px" }}>💳</span>
                  Available Card Limit
                </div>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "900", 
                  color: "#333",
                  textAlign: "center"
                }}>
                  ₹{getCardLimit(sidebarOffer.offer).toLocaleString()}
                </div>
              </div>
              
              <h5 style={{ 
                margin: "20px 0 12px 0", 
                color: "#333",
                fontSize: "15px",
                fontWeight: "800"
              }}>
                Key Features
              </h5>
              
              <ul className="features-list">
                <li>Instant discount application at checkout</li>
                <li>Valid on all transactions with {sidebarOffer.offer.bank} Bank</li>
                {sidebarOffer.offer.discountType === 'percentage' ? (
                  <li>{sidebarOffer.offer.discountValue}% discount on total purchase amount</li>
                ) : (
                  <li>Flat ₹{sidebarOffer.offer.discountValue} discount on purchase</li>
                )}
                {sidebarOffer.offer.isPersonalized && (
                  <li>Personalized offer exclusively for you</li>
                )}
                <li>No additional processing fees</li>
                <li>Instant confirmation upon payment</li>
                <li>Wide acceptance across all major merchants</li>
                <li>Secure transaction with bank-grade encryption</li>
                <li>No hidden charges or fees</li>
                <li>Real-time transaction tracking</li>
              </ul>
              
              <div className="terms-note">
                Terms & Conditions apply. Offer valid today only. Discount subject to availability and card limit. Bank reserves the right to modify or withdraw the offer at any time.
              </div>
              
              {/* Selected Status */}
              {sidebarOffer.index === selectedOfferIndex && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(77, 108, 255, 0.08)",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: PRIMARY
                }}>
                  ✓ Currently Selected Offer
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountResultsPage;