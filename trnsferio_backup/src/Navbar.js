import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  // Refs for hover timeout
  const dropdownTimeoutRef = useRef(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dropdownMenus = {
    company: {
      sections: [
        {
          title: "Overview",
          items: [{ name: "About us", link: "#" }]
        },
        {
          title: "Learn more",
          items: [{ name: "Why Trnzio", link: "#" }]
        }
      ]
    }
  };

  const handleLinkClick = (sectionId) => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
    
    // Check if we're already on the homepage
    if (window.location.pathname === '/') {
      // If already on homepage, just scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If not on homepage, navigate to homepage then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Increased timeout for navigation to complete
    }
  };

  // Handle mouse enter with immediate open
  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown('company');
  };

  // Handle mouse leave with 1 second delay
  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 1000); // 1 second delay
  };

  // Also handle mouse enter on dropdown menu itself
  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">

            {/* Arrow 1 - Blue (#0025ff) */}
            <path d="M3 6L9 12L3 18"
                  stroke="#566df1ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round" />

            {/* Arrow 2 - Green (#00A300) */}
            <path d="M9 6L15 12L9 18"
                  stroke="#a13d07ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  />

            {/* Arrow 3 - Purple (#3D0092) */}
            <path d="M15 6L21 12L15 18"
                  stroke="#00A300"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round" />

          </svg>
          <span className="logo-text">TrnZio</span>
        </div>

        <div className="nav-links">
          {/* Added Features link from homepage */}
          <a href="#features" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('features');
          }}>Features</a>

          {/* Added Solutions link from homepage */}
          <a href="#solutions" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('solutions');
          }}>Solutions</a>

          {/* Added Pricing link from homepage */}
          <a href="#pricing" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('pricing');
          }}>Pricing</a>

          {/* Added FAQ link from homepage */}
          <a href="#faq" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('faq');
          }}>FAQ</a>

          {/* Your existing Company dropdown */}
          <div
            className="nav-link-dropdown"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <a href="#company" className="nav-link" onClick={(e) => e.preventDefault()}>
              Company
              <span className="dropdown-arrow-wrapper">
                <svg className="dropdown-arrow" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
            </a>
            

            {activeDropdown === 'company' && (
              <div 
                className="dropdown-menu" 
                role="menu" 
                aria-label="Company"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="dropdown-content">
                  {dropdownMenus.company.sections.map((section, idx) => (
                    <div key={idx} className="dropdown-section">
                      {section.title && <h3 className="dropdown-section-title">{section.title}</h3>}
                      <ul className="dropdown-list">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <a href={item.link} className="dropdown-item">{item.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn" onClick={() => navigate("/signin")}>Sign in</button>
          
          <button className="btn btn-primary" style={{ fontSize: '15px' }} onClick={() => navigate("/launchdemo")}>Launch Demo</button>
          
          {/* Mobile hamburger menu */}
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Sidebar Menu */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate("/")}>
            <svg className="sidebar-logo-icon" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6L9 12L3 18" stroke="#566df1ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 6L15 12L9 18" stroke="#a13d07ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 6L21 12L15 18" stroke="#00A300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sidebar-logo-text">TrnZio</span>
          </div>
          <button className="sidebar-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <a href="#features" className="sidebar-link" onClick={(e) => {
              e.preventDefault();
              handleLinkClick('features');
            }}>Features</a>
            
            <a href="#solutions" className="sidebar-link" onClick={(e) => {
              e.preventDefault();
              handleLinkClick('solutions');
            }}>Solutions</a>
            
            <a href="#pricing" className="sidebar-link" onClick={(e) => {
              e.preventDefault();
              handleLinkClick('pricing');
            }}>Pricing</a>
            
            <a href="#faq" className="sidebar-link" onClick={(e) => {
              e.preventDefault();
              handleLinkClick('faq');
            }}>FAQ</a>
            
            {/* Company dropdown in sidebar */}
            <div className="sidebar-dropdown">
              <button 
                className="sidebar-dropdown-btn" 
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              >
                <span>Company</span>
                <span className="sidebar-dropdown-arrow">
                  {mobileDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              
              {mobileDropdownOpen && (
                <div className="sidebar-dropdown-content">
                  {dropdownMenus.company.sections.map((section, idx) => (
                    <div key={idx} className="sidebar-dropdown-section">
                      {section.title && <h4 className="sidebar-dropdown-title">{section.title}</h4>}
                      <div className="sidebar-dropdown-items">
                        {section.items.map((item, itemIdx) => (
                          <a 
                            key={itemIdx} 
                            href={item.link} 
                            className="sidebar-dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              setMobileDropdownOpen(false);
                            }}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="sidebar-actions">
            <button className="sidebar-btn" onClick={() => {
              setMobileMenuOpen(false);
              navigate("/signin");
            }}>Sign in</button>
            
            <button className="sidebar-btn-primary" onClick={() => {
              setMobileMenuOpen(false);
              navigate("/launchdemo");
            }}>Launch Demo</button>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      <style jsx>{`
        /* Reset any global styles that might affect navbar */
        .navbar {
          position: fixed !important;
          top: 20px !important; /* Moved 20px down from top */
          left: 0 !important;
          right: 0 !important;
          background: rgba(255,255,255,0.94) !important;
          backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid rgba(0,0,0,0.08) !important;
          box-shadow: ${scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'} !important;
          z-index: 1000 !important;
          padding: 0 40px !important;
          transition: all 0.3s ease !important;
          margin: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          height: 70px; /* Slightly reduced height */
          display: flex;
          align-items: center;
          border-radius: 16px; /* Added rounded corners */
          max-width: 1400px; /* Max width for centered effect */
          margin-left: auto !important;
          margin-right: auto !important;
          left: 50% !important;
          transform: translateX(-50%) !important; /* Center horizontally */
        }

        /* When scrolled, make it stick to top */
        .navbar.scrolled {
          top: 0 !important;
          border-radius: 0 0 16px 16px; /* Only bottom rounded when at top */
          width: 100% !important;
          max-width: 100% !important;
          left: 0 !important;
          transform: none !important;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          width: 100%;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          margin-right: auto;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: #3D0092;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #000;
        }

        .nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
          font-size: 15px;
          margin-right: 20rem;
        }

        .nav-link {
          color: #222;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link:hover {
          color: #3D0092;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -25px;
          left: 0;
          width: 0;
          height: 3px;
          background: #3D0092;
          transition: width 0.3s;
        }

        .nav-link:hover::after,
        .nav-link-dropdown:hover .nav-link::after {
          width: 100%;
        }

        .nav-link-dropdown {
          position: relative;
        }

        .dropdown-arrow-wrapper {
          display: flex;
          align-items: center;
          margin-left: 4px;
        }

        .dropdown-arrow {
          width: 12px;
          height: 8px;
          transition: transform 0.3s;
        }

        .nav-link-dropdown:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 25px);
          left: 50%;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 32px;
          min-width: 600px;
          animation: dropdownSlide 0.3s ease-out;
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 1001;
        }

        .dropdown-content {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }

        .dropdown-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dropdown-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .dropdown-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dropdown-item {
          color: #333;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.3s;
          display: block;
        }

        .dropdown-item:hover {
          color: #3D0092;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 26px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          color: #0b1220;
          transition: all .18s ease;
          white-space: nowrap;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.12);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          border: none;
          color: white;
          box-shadow: 0 10px 28px rgba(0,37,255,0.30);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,37,255,0.40);
        }

        .hamburger {
          display: none;
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Mobile Sidebar Styles */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 320px;
          height: 100vh;
          background: white;
          box-shadow: -5px 0 25px rgba(0,0,0,0.15);
          z-index: 1002;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .mobile-sidebar.open {
          right: 0;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e5e5e5;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          color: #3D0092;
        }

        .sidebar-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #000;
        }

        .sidebar-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .sidebar-close:hover {
          background-color: #f5f5f5;
        }

        .sidebar-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-link {
          display: block;
          padding: 14px 16px;
          color: #222;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background-color: #f5f5f5;
          color: #3D0092;
        }

        .sidebar-dropdown {
          margin-top: 8px;
        }

        .sidebar-dropdown-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: none;
          border: none;
          color: #222;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .sidebar-dropdown-btn:hover {
          background-color: #f5f5f5;
        }

        .sidebar-dropdown-arrow {
          margin-left: 4px;
        }

        .sidebar-dropdown-content {
          margin-top: 8px;
          padding-left: 16px;
          border-left: 2px solid #e5e5e5;
        }

        .sidebar-dropdown-section {
          margin-bottom: 16px;
        }

        .sidebar-dropdown-title {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .sidebar-dropdown-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-dropdown-item {
          display: block;
          padding: 10px 12px;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .sidebar-dropdown-item:hover {
          background-color: #f0f0f0;
          color: #3D0092;
        }

        .sidebar-actions {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-btn {
          padding: 14px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          color: #0b1220;
          transition: all 0.2s;
        }

        .sidebar-btn:hover {
          background-color: #f5f5f5;
        }

        .sidebar-btn-primary {
          padding: 14px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0025ff, #4d6cff);
          color: white;
          transition: all 0.2s;
        }

        .sidebar-btn-primary:hover {
          opacity: 0.9;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* REMOVED body padding-top - each page should handle its own padding */

        /* RESPONSIVE STYLES */
        @media (max-width: 1200px) {
          .nav-content {
            padding: 20px 24px;
          }
          
          .navbar {
            max-width: calc(100% - 40px) !important;
          }
        }

        @media (max-width: 1024px) {
          .nav-links {
            margin-right: 10rem;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 20px !important;
            height: 65px;
            top: 15px !important; /* Slightly less offset on mobile */
            max-width: calc(100% - 30px) !important;
          }

          .nav-content {
            padding: 15px 0;
            height: 60px;
          }

          .nav-links {
            display: none;
          }

          .hamburger {
            display: flex;
          }

          .logo-text {
            font-size: 20px;
          }

          .logo-icon {
            width: 28px;
            height: 28px;
          }

          .nav-actions {
            gap: 8px;
          }

          .btn {
            padding: 12px 20px;
            font-size: 14px;
          }
          
          .mobile-sidebar {
            width: 280px;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 0 16px !important;
            height: 60px;
            top: 10px !important; /* Less offset on small screens */
            max-width: calc(100% - 20px) !important;
          }

          .nav-content {
            padding: 10px 0;
          }

          .btn {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .mobile-sidebar {
            width: 100%;
            max-width: 320px;
          }
        }

        @media (max-width: 360px) {
          .navbar {
            padding: 0 12px !important;
            height: 55px;
            top: 8px !important;
            max-width: calc(100% - 16px) !important;
          }

          .nav-actions {
            gap: 6px;
          }

          .btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .hamburger {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;