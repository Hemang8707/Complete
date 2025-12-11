import React, { useState } from 'react';

const LaunchDemo = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyEmail: '',
    country: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Demo Created:', formData);
    // Add your demo creation logic here
  };

  return (
    <div className="demo-container">
      {/* Left Section - Redesigned */}
      <div className="left-section">
        <div className="content-wrapper">
          <div className="brand-header">
            <div className="logo-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6L9 12L3 18M9 6L15 12L9 18M15 6L21 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="main-heading">
              Experience the Future of<br />
              <span className="highlight">Digital Payments</span>
            </h1>
            <p className="subtitle">Create your personalized demo in seconds</p>
          </div>

          {/* Compact Phone Mockup */}
          <div className="phone-showcase">
            <div className="phone-device">
              <div className="phone-screen">
                <div className="screen-header">
                  <div className="status-bar">
                    <span className="time">9:41</span>
                    <div className="indicators">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  <h3 className="screen-title">TrnZio Wallet</h3>
                </div>

                <div className="card-display">
                  <div className="virtual-card">
                    <div className="card-chip"></div>
                    <div className="card-details-mini">
                      <div className="card-number">•••• 5656</div>
                      <div className="card-holder">JOHN DOE</div>
                    </div>
                  </div>
                </div>

                <div className="balance-section">
                  <div className="balance-label">Available Balance</div>
                  <div className="balance-amount">$3,250.00</div>
                </div>

                <div className="quick-stats">
                  <div className="stat-item">
                    <div className="stat-icon">💳</div>
                    <div className="stat-text">Credit Limit<br/><strong>$5,000</strong></div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📊</div>
                    <div className="stat-text">This Month<br/><strong>$1,750</strong></div>
                  </div>
                </div>
              </div>
              <div className="phone-bottom"></div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-badge">
              <span className="badge-icon">⚡</span>
              <span>Instant Setup</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">🔒</span>
              <span>Secure</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">🌍</span>
              <span>Global</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="right-section">
        <div className="form-container">
          <h2 className="form-title">Get Started Today</h2>
          <p className="form-description">Fill in your details to create a personalized demo</p>

          <div className="demo-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="companyEmail"
                placeholder="you@company.com"
                value={formData.companyEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="SG">Singapore</option>
                <option value="AE">UAE</option>
              </select>
            </div>

            <button onClick={handleSubmit} className="submit-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Launch Your Demo
            </button>

            <div className="form-footer">
              <p>🔒 Your information is safe and secure</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .demo-container {
          display: flex;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .left-section {
          flex: 0.9;
          background: linear-gradient(135deg, #0025ff 0%, #0066ff 100%);
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .left-section::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -100px;
          right: -100px;
        }

        .left-section::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          bottom: -50px;
          left: -50px;
        }

        .content-wrapper {
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .brand-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-badge {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          backdrop-filter: blur(10px);
        }

        .logo-badge svg {
          width: 32px;
          height: 32px;
        }

        .main-heading {
          font-size: 38px;
          font-weight: 800;
          color: white;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .highlight {
          background: linear-gradient(120deg, #ffffff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 400;
        }

        .phone-showcase {
          display: flex;
          justify-content: center;
          margin: 40px 0;
        }

        .phone-device {
          width: 220px;
          height: 440px;
          background: #1a1a1a;
          border-radius: 32px;
          padding: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 26px;
          overflow: hidden;
          padding: 16px;
        }

        .screen-header {
          margin-bottom: 16px;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          margin-bottom: 12px;
          color: #666;
        }

        .indicators {
          display: flex;
          gap: 4px;
        }

        .screen-title {
          font-size: 16px;
          font-weight: 700;
          color: #0025ff;
          text-align: center;
        }

        .card-display {
          margin: 20px 0;
        }

        .virtual-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 16px;
          color: white;
          position: relative;
          min-height: 100px;
        }

        .card-chip {
          width: 30px;
          height: 24px;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .card-details-mini {
          margin-top: 20px;
        }

        .card-number {
          font-size: 14px;
          letter-spacing: 2px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .card-holder {
          font-size: 10px;
          opacity: 0.9;
        }

        .balance-section {
          text-align: center;
          padding: 16px;
          background: #f8f9ff;
          border-radius: 12px;
          margin: 16px 0;
        }

        .balance-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }

        .balance-amount {
          font-size: 24px;
          font-weight: 700;
          color: #0025ff;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .stat-item {
          background: #f8f9ff;
          padding: 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-icon {
          font-size: 18px;
        }

        .stat-text {
          font-size: 9px;
          color: #666;
          line-height: 1.3;
        }

        .stat-text strong {
          color: #000;
          font-size: 11px;
        }

        .phone-bottom {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: #333;
          border-radius: 2px;
        }

        .features-grid {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }

        .feature-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 10px 20px;
          border-radius: 30px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-icon {
          font-size: 16px;
        }

        .right-section {
          flex: 1.1;
          padding: 60px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          max-width: 500px;
          width: 100%;
        }

        .form-title {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #000;
        }

        .form-description {
          font-size: 16px;
          color: #666;
          margin-bottom: 40px;
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select {
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s;
          background: white;
          color: #000;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0025ff;
          box-shadow: 0 0 0 4px rgba(0, 37, 255, 0.1);
        }

        .form-group input::placeholder {
          color: #999;
        }

        .form-group select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }

        .submit-btn {
          padding: 16px 32px;
          background: #0025ff;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background: #0020cc;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 37, 255, 0.3);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .form-footer {
          text-align: center;
          margin-top: 16px;
        }

        .form-footer p {
          font-size: 13px;
          color: #666;
        }

        @media (max-width: 1200px) {
          .demo-container {
            flex-direction: column;
          }

          .left-section {
            padding: 60px 40px;
          }

          .right-section {
            padding: 60px 40px;
          }

          .main-heading {
            font-size: 32px;
          }
        }

        @media (max-width: 768px) {
          .left-section {
            padding: 40px 20px;
          }

          .right-section {
            padding: 40px 20px;
          }

          .main-heading {
            font-size: 28px;
          }

          .phone-device {
            width: 200px;
            height: 400px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-title {
            font-size: 28px;
          }

          .features-grid {
            flex-wrap: wrap;
          }

          .feature-badge {
            font-size: 12px;
            padding: 8px 16px;
          }
        }

        @media (max-width: 480px) {
          .phone-device {
            width: 180px;
            height: 360px;
          }

          .main-heading {
            font-size: 24px;
          }

          .phone-showcase {
            margin: 30px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LaunchDemo;