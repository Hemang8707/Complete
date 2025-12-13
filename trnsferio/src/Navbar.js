import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import AboutUs from './Aboutus';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset states when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const dropdownMenus = {
    company: {
      sections: [
        {
          title: "Overview",
          items: [{ name: "About us", link: "/aboutus" }]
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
    
    if (window.location.pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown('company');
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 1000);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  useEffect(() => {
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
            <path d="M3 6L9 12L3 18"
                  stroke="#566df1ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round" />
            <path d="M9 6L15 12L9 18"
                  stroke="#a13d07ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  />
            <path d="M15 6L21 12L15 18"
                  stroke="#00A300"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round" />
          </svg>
          <span className="logo-text">TrnZio</span>
        </div>

        <div className="nav-links">
          <a href="#features" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('features');
          }}>Features</a>

          <a href="#solutions" className="nav-link" onClick={(e) => {
            e.preventDefault();
            handleLinkClick('solutions');
          }}>Solutions</a>

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
          <button className="btn nav-btn-secondary" onClick={() => navigate("/signin")}>Sign in</button>
          
          <button className="btn nav-btn-primary" onClick={() => navigate("/launchdemo")}>Launch Demo</button>
          
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
      
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      <style jsx global>{`
        /* Use global styles with high specificity to prevent overrides */
        .navbar {
          position: fixed !important;
          top: 1.25rem !important;
          left: 0 !important;
          right: 0 !important;
          background: rgba(255,255,255,0.94) !important;
          backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid rgba(0,0,0,0.08) !important;
          box-shadow: ${scrolled ? '0 0.25rem 1.25rem rgba(0,0,0,0.08)' : 'none'} !important;
          z-index: 1000 !important;
          padding: 0 2.5rem !important;
          transition: all 0.3s ease !important;
          margin: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          height: 4.375rem !important;
          display: flex !important;
          align-items: center !important;
          border-radius: 1rem !important;
          max-width: 87.5rem !important;
          margin-left: auto !important;
          margin-right: auto !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }

        .navbar.scrolled {
          top: 0 !important;
          border-radius: 0 0 1rem 1rem !important;
          width: 100% !important;
          max-width: 100% !important;
          left: 0 !important;
          transform: none !important;
        }

        .nav-content {
          max-width: 87.5rem !important;
          margin: 0 auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 1.25rem 0 !important;
          width: 100% !important;
        }

        .nav-logo {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          cursor: pointer !important;
          margin-right: auto !important;
        }

        .logo-icon {
          width: 2rem !important;
          height: 2rem !important;
          color: #3D0092 !important;
          flex-shrink: 0 !important;
        }

        .logo-text {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #000 !important;
          white-space: nowrap !important;
        }

        .nav-links {
          display: flex !important;
          gap: 1.75rem !important;
          align-items: center !important;
          font-size: 0.9375rem !important;
          margin-right: 20rem !important;
        }

        .nav-link {
          color: #222 !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          transition: color 0.2s ease !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.25rem !important;
          white-space: nowrap !important;
        }

        .nav-link:hover {
          color: #3D0092 !important;
        }

        .nav-link::after {
          content: '' !important;
          position: absolute !important;
          bottom: -1.5625rem !important;
          left: 0 !important;
          width: 0 !important;
          height: 0.1875rem !important;
          background: #3D0092 !important;
          transition: width 0.3s !important;
        }

        .nav-link:hover::after,
        .nav-link-dropdown:hover .nav-link::after {
          width: 100% !important;
        }

        .nav-link-dropdown {
          position: relative !important;
        }

        .dropdown-arrow-wrapper {
          display: flex !important;
          align-items: center !important;
          margin-left: 0.25rem !important;
        }

        .dropdown-arrow {
          width: 0.75rem !important;
          height: 0.5rem !important;
          transition: transform 0.3s !important;
        }

        .nav-link-dropdown:hover .dropdown-arrow {
          transform: rotate(180deg) !important;
        }

        .dropdown-menu {
          position: absolute !important;
          top: calc(100% + 1.5625rem) !important;
          left: 50% !important;
          background: white !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 0.625rem 2.5rem rgba(0, 0, 0, 0.1) !important;
          padding: 2rem !important;
          min-width: 37.5rem !important;
          animation: dropdownSlide 0.3s ease-out !important;
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
          transition: opacity 0.2s ease, transform 0.2s ease !important;
          z-index: 1001 !important;
        }

        .dropdown-content {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 2.5rem !important;
        }

        .dropdown-section {
          display: flex !important;
          flex-direction: column !important;
          gap: 1rem !important;
        }

        .dropdown-section-title {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          color: #999 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.03125rem !important;
          margin-bottom: 0.5rem !important;
        }

        .dropdown-list {
          list-style: none !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
        }

        .dropdown-item {
          color: #333 !important;
          text-decoration: none !important;
          font-size: 0.9375rem !important;
          font-weight: 500 !important;
          transition: color 0.3s !important;
          display: block !important;
          white-space: nowrap !important;
        }

        .dropdown-item:hover {
          color: #3D0092 !important;
        }

        .nav-actions {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          flex-shrink: 0 !important;
        }

        .nav-actions .btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 62.4375rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          font-size: 0.9375rem !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          background: white !important;
          color: #0b1220 !important;
          transition: all .18s ease !important;
          white-space: nowrap !important;
          min-height: 2.75rem !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        }

        .nav-actions .btn:hover {
          transform: translateY(-0.125rem) !important;
          box-shadow: 0 0.625rem 1.75rem rgba(0,0,0,0.12) !important;
        }

        .nav-actions .nav-btn-primary {
          background: linear-gradient(135deg, #0025ff, #4d6cff) !important;
          border: none !important;
          color: white !important;
          box-shadow: 0 0.625rem 1.75rem rgba(0,37,255,0.30) !important;
          font-size: 0.9375rem !important;
          min-height: 2.75rem !important;
          padding: 0.75rem 1.5rem !important;
        }

        .nav-actions .nav-btn-primary:hover {
          transform: translateY(-0.125rem) !important;
          box-shadow: 0 0.75rem 2rem rgba(0,37,255,0.40) !important;
        }

        .nav-actions .nav-btn-secondary {
          font-size: 0.9375rem !important;
          min-height: 2.75rem !important;
          padding: 0.75rem 1.5rem !important;
        }

        .hamburger {
          display: none !important;
          width: 2.75rem !important;
          height: 2.75rem !important;
          border-radius: 62.4375rem !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          background: white !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
        }

        .mobile-sidebar {
          position: fixed !important;
          top: 0 !important;
          right: -100% !important;
          width: 20rem !important;
          height: 100vh !important;
          background: white !important;
          box-shadow: -0.3125rem 0 1.5625rem rgba(0,0,0,0.15) !important;
          z-index: 1002 !important;
          transition: right 0.3s ease !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .mobile-sidebar.open {
          right: 0 !important;
        }

        .sidebar-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0,0,0,0.5) !important;
          z-index: 1001 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: all 0.3s ease !important;
        }

        .sidebar-overlay.open {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .sidebar-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 1.25rem !important;
          border-bottom: 1px solid #e5e5e5 !important;
        }

        .sidebar-logo {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          cursor: pointer !important;
        }

        .sidebar-logo-icon {
          width: 2rem !important;
          height: 2rem !important;
          color: #3D0092 !important;
          flex-shrink: 0 !important;
        }

        .sidebar-logo-text {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #000 !important;
          white-space: nowrap !important;
        }

        .sidebar-close {
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          color: #666 !important;
          padding: 0.5rem !important;
          border-radius: 0.375rem !important;
          transition: background-color 0.2s !important;
          flex-shrink: 0 !important;
        }

        .sidebar-close:hover {
          background-color: #f5f5f5 !important;
        }

        .sidebar-content {
          flex: 1 !important;
          padding: 1.25rem !important;
          overflow-y: auto !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }

        .sidebar-section {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
        }

        .sidebar-link {
          display: block !important;
          padding: 0.875rem 1rem !important;
          color: #222 !important;
          text-decoration: none !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
          transition: all 0.2s ease !important;
          white-space: nowrap !important;
        }

        .sidebar-link:hover {
          background-color: #f5f5f5 !important;
          color: #3D0092 !important;
        }

        .sidebar-dropdown {
          margin-top: 0.5rem !important;
        }

        .sidebar-dropdown-btn {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0.875rem 1rem !important;
          background: none !important;
          border: none !important;
          color: #222 !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          border-radius: 0.5rem !important;
          transition: background-color 0.2s !important;
          white-space: nowrap !important;
        }

        .sidebar-dropdown-btn:hover {
          background-color: #f5f5f5 !important;
        }

        .sidebar-dropdown-arrow {
          margin-left: 0.25rem !important;
          flex-shrink: 0 !important;
        }

        .sidebar-dropdown-content {
          margin-top: 0.5rem !important;
          padding-left: 1rem !important;
          border-left: 0.125rem solid #e5e5e5 !important;
        }

        .sidebar-dropdown-section {
          margin-bottom: 1rem !important;
        }

        .sidebar-dropdown-title {
          font-size: 0.75rem !important;
          color: #999 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.03125rem !important;
          margin-bottom: 0.5rem !important;
          font-weight: 600 !important;
        }

        .sidebar-dropdown-items {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.5rem !important;
        }

        .sidebar-dropdown-item {
          display: block !important;
          padding: 0.625rem 0.75rem !important;
          color: #333 !important;
          text-decoration: none !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s !important;
          white-space: nowrap !important;
        }

        .sidebar-dropdown-item:hover {
          background-color: #f0f0f0 !important;
          color: #3D0092 !important;
        }

        .sidebar-actions {
          padding: 1.25rem 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
        }

        .sidebar-btn {
          padding: 0.875rem 1.25rem !important;
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          cursor: pointer !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          background: white !important;
          color: #0b1220 !important;
          transition: all 0.2s !important;
          white-space: nowrap !important;
        }

        .sidebar-btn:hover {
          background-color: #f5f5f5 !important;
        }

        .sidebar-btn-primary {
          padding: 0.875rem 1.25rem !important;
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          cursor: pointer !important;
          border: none !important;
          background: linear-gradient(135deg, #0025ff, #4d6cff) !important;
          color: white !important;
          transition: all 0.2s !important;
          white-space: nowrap !important;
        }

        .sidebar-btn-primary:hover {
          opacity: 0.9 !important;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-0.625rem);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* RESPONSIVE STYLES */
        @media (max-width: 1200px) {
          .nav-content {
            padding: 1.25rem 1.5rem !important;
          }
          
          .navbar {
            max-width: calc(100% - 2.5rem) !important;
          }
          
          .nav-links {
            margin-right: 10rem !important;
            gap: 1.25rem !important;
          }
        }

        @media (max-width: 1024px) {
          .nav-links {
            margin-right: 5rem !important;
            gap: 1rem !important;
          }
          
          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.75rem 1.25rem !important;
            font-size: 0.875rem !important;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 1.25rem !important;
            height: 4.0625rem !important;
            top: 0.9375rem !important;
          }

          .nav-content {
            padding: 0.9375rem 0 !important;
            height: 3.75rem !important;
          }

          .nav-links {
            display: none !important;
          }

          .hamburger {
            display: flex !important;
          }

          .logo-text {
            font-size: 1.25rem !important;
          }

          .logo-icon {
            width: 1.75rem !important;
            height: 1.75rem !important;
          }

          .nav-actions {
            gap: 0.5rem !important;
          }

          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.75rem 1.25rem !important;
            font-size: 0.875rem !important;
            min-height: 2.5rem !important;
          }
          
          .mobile-sidebar {
            width: 17.5rem !important;
          }
        }

        @media (max-width: 640px) {
          .navbar {
            padding: 0 1rem !important;
            height: 3.75rem !important;
            top: 0.625rem !important;
          }

          .nav-content {
            padding: 0.625rem 0 !important;
          }

          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.625rem 1rem !important;
            font-size: 0.8125rem !important;
            min-height: 2.25rem !important;
          }

          .logo-text {
            font-size: 1.125rem !important;
          }

          .logo-icon {
            width: 1.5rem !important;
            height: 1.5rem !important;
          }
          
          .mobile-sidebar {
            width: 100% !important;
            max-width: 20rem !important;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 0 0.875rem !important;
            height: 3.5rem !important;
            top: 0.5rem !important;
            border-radius: 0.75rem !important;
          }

          .nav-content {
            padding: 0.5rem 0 !important;
          }

          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.5625rem 0.875rem !important;
            font-size: 0.75rem !important;
            min-height: 2rem !important;
          }

          .logo-text {
            font-size: 1rem !important;
          }

          .logo-icon {
            width: 1.375rem !important;
            height: 1.375rem !important;
          }

          .hamburger {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }

          .sidebar-header {
            padding: 1rem !important;
          }

          .sidebar-logo-text {
            font-size: 1.125rem !important;
          }

          .sidebar-logo-icon {
            width: 1.75rem !important;
            height: 1.75rem !important;
          }

          .sidebar-link {
            font-size: 0.9375rem !important;
            padding: 0.75rem 0.875rem !important;
          }

          .sidebar-btn,
          .sidebar-btn-primary {
            font-size: 0.9375rem !important;
            padding: 0.75rem 1rem !important;
          }
        }

        @media (max-width: 375px) {
          .navbar {
            padding: 0 0.75rem !important;
            height: 3.25rem !important;
            top: 0.375rem !important;
          }

          .nav-actions {
            gap: 0.375rem !important;
          }

          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.6875rem !important;
            min-height: 1.875rem !important;
          }

          .logo-text {
            font-size: 0.9375rem !important;
          }

          .logo-icon {
            width: 1.25rem !important;
            height: 1.25rem !important;
          }

          .hamburger {
            width: 2.25rem !important;
            height: 2.25rem !important;
          }
        }

        @media (max-width: 320px) {
          .navbar {
            padding: 0 0.625rem !important;
            height: 3rem !important;
            top: 0.3125rem !important;
          }

          .nav-actions .btn,
          .nav-actions .nav-btn-primary,
          .nav-actions .nav-btn-secondary {
            padding: 0.4375rem 0.625rem !important;
            font-size: 0.625rem !important;
            min-height: 1.75rem !important;
          }

          .logo-text {
            font-size: 0.875rem !important;
          }

          .logo-icon {
            width: 1.125rem !important;
            height: 1.125rem !important;
          }

          .hamburger {
            width: 2rem !important;
            height: 2rem !important;
          }

          .nav-actions {
            gap: 0.25rem !important;
          }

          .mobile-sidebar {
            width: 100% !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;