import video1 from './assets/cards.mp4'
import background from './assets/background.mp4'
import SignIn from './SignIn';
import LaunchDemo from './launchdemo';
import Navbar from './Navbar'; // Import your navbar
import React from 'react';
import { Zap, Shield, Globe, TrendingUp, CreditCard, Check, Play } from 'lucide-react';

export default function TrnzioHomepage() {
  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(1400px 700px at 80% -10%, rgba(0, 37, 255, 0.18), transparent 60%), radial-gradient(1000px 600px at -20% 20%, rgba(77, 108, 255, 0.15), transparent 60%), #f7f9fc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#0b1220',
        lineHeight: 1.45,
        overflowX: 'hidden'
      }}>
        <style jsx global>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .container { 
            max-width: 1280px; 
            margin: 0 auto; 
            padding: 0 32px; 
            width: 100%;
            margin-top: 5rem;
          }
          a { color: inherit; text-decoration: none; }

          /* Slightly larger base font sizes and subtle spacing increases */
          .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 26px; border-radius: 999px; font-weight: 600; cursor: pointer;
            font-size: 16px; /* slightly larger */
            border: 1px solid rgba(0,0,0,0.08); background: white; color: #0b1220;
            transition: all .18s ease;
            white-space: nowrap;
          }
          .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
          .btn-primary {
            background: linear-gradient(135deg, #0025ff, #4d6cff);
            border: none; color: white;
            box-shadow: 0 10px 28px rgba(0,37,255,0.30);
          }
          .card {
            background: rgba(255,255,255,0.95);
            border: 1px solid rgba(0,0,0,0.09);
            border-radius: 20px;
            padding: 26px;
            box-shadow: 0 12px 36px rgba(16,24,40,0.08);
            transition: transform 0.28s;
          }
          .card:hover { transform: translateY(-6px); }
          .pop {
            outline: 3px solid #0025ff;
            box-shadow: 0 18px 44px rgba(0,37,255,0.28);
            transform: scale(1.02);
          }
          .icon-box {
            width: 50px; height: 50px; border-radius: 12px;
            background: linear-gradient(135deg, #0025ff, #4d6cff);
            display: grid; place-items: center; color: white; margin-bottom: 16px;
          }
           
          
          /* headings and summary sizes nudged up a bit */
          details summary { cursor: pointer; font-weight: 700; font-size: 1.10rem; }
          details[open] summary { margin-bottom: 10px; }

          /* RESPONSIVE STYLES */
          @media (max-width: 1200px) {
            .container {
              padding: 0 24px;
            }
          }

          @media (max-width: 1024px) {
            .hero-grid, .showcase, .pricing { 
              grid-template-columns: 1fr !important; 
              gap: 40px !important;
            }
            
            .features { 
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            
            .testimonials { 
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            
            /* Adjust hero video size */
            .hero-grid > div:last-child {
              width: 100% !important;
              height: 400px !important;
              margin: 0 auto;
            }
          }

          @media (max-width: 768px) {
            .container {
              padding: 0 20px;
            }
            
            .features, .testimonials, .solutions-grid { 
              grid-template-columns: 1fr !important;
            }
            
            .kpis, .hero-stats { 
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .faq-grid {
              grid-template-columns: 1fr !important;
            }
            
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
            }
            
            /* Adjust font sizes for mobile */
            h1 {
              font-size: clamp(2rem, 5vw, 3rem) !important;
            }
            
            h2 {
              font-size: clamp(1.8rem, 4vw, 2.5rem) !important;
            }
            
            .btn {
              padding: 12px 20px !important;
              font-size: 14px !important;
            }
            
            /* Adjust hero section */
            .hero-grid > div:last-child {
              height: 300px !important;
            }
            
            /* Adjust showcase section */
            .showcase-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
            }
            
            .showcase-video {
              width: 100% !important;
              height: 300px !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            
            /* Adjust pricing section */
            .pricing-grid {
              grid-template-columns: 1fr !important;
            }
            
            .pricing-video {
              width: 100% !important;
              height: 300px !important;
              margin-left: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .container {
              padding: 0 16px;
            }
            
            .kpis, .hero-stats { 
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            .hero-buttons {
              flex-direction: column !important;
              width: 100% !important;
            }
            
            .hero-buttons .btn {
              width: 100% !important;
              justify-content: center !important;
            }
            
            /* Adjust video containers */
            .hero-grid > div:last-child,
            .showcase-video,
            .pricing-video {
              height: 250px !important;
              border-radius: 16px !important;
            }
            
            /* Adjust card padding */
            .card {
              padding: 20px !important;
            }
            
            /* Adjust spacing */
            section {
              padding: 50px 0 !important;
            }
          }

          @media (max-width: 360px) {
            .btn {
              padding: 10px 16px !important;
              font-size: 13px !important;
            }
            
            .container {
              padding: 0 12px;
            }
          }
        `}</style>

        {/* Use your Navbar component */}
        <Navbar />

        {/* HERO */}
        <header style={{ padding: '60px 0 60px' }}>
          <div className="container">
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '64px', alignItems: 'center' }}>
              <div>
                <span style={{
                  display: 'inline-flex', gap: '10px', alignItems: 'center',
                  background: '#e6f0ff', color: '#0025ff', padding: '8px 16px',
                  borderRadius: '999px', fontSize: '15px', fontWeight: 600
                }}>
                  <Zap size={20} /> New: Instant virtual card issuance
                </span>

                <h1 style={{
                  fontSize: 'clamp(2.8rem, 4.8vw, 4.4rem)',
                  lineHeight: 1.06, letterSpacing: '-0.035em', margin: '18px 0 14px',
                  fontWeight: 800, color: '#4a4848ff'
                }}>
                  Instant Credit Cards.<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontSize: '1.03em'
                  }}>
                    Infinite Possibilities.
                  </span>
                </h1>

                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.16rem)', color: '#222', maxWidth: '56ch', marginBottom: '34px' }}>
                  Issue unlimited virtual cards in milliseconds. Full spend controls, real-time analytics, and global acceptance — all in one powerful platform.
                </p>

                {/* Increased gap between hero text and cards */}
                <div style={{ marginBottom: '26px' }} />


                <div className="hero-buttons" style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', marginTop: '4rem' }}>
                  <a href="#" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '15px' }}>Get Started Free</a>
                  <a href="#" className="btn" style={{ gap: '10px', padding: '14px 36px', fontSize: '15px' }}>
                    <Play size={18} /> Watch Demo
                  </a>
                </div>
              </div>

              {/* VIDEO MOCKUP */}
              <div style={{
                width: '140%',
                height: '720px',
                borderRadius: '36px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)'
              }}>
                <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                  <source src={video1} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </header>

        {/* FEATURES */}
        <section
          id="features"
          style={{
            padding: "90px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: 1,
              filter: "none",
            }}
          >
            <source src={background} type="video/mp4" />
          </video>

          <div
            className="container"
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                marginBottom: "18px",
                color: "#ffffff",
              }}
            >
              Everything you need to run cards at scale
            </h2>

            <p
              style={{
                fontSize: "clamp(0.9rem, 2vw, 1.08rem)",
                color: "#ffffff",
                maxWidth: "76ch",
                margin: "0 auto 32px",
                fontWeight: 500,
                textShadow: "0 3px 12px rgba(0,0,0,0.5)",
              }}
            >
              From instant issuance to advanced controls to real-time analytics —
              all in one unified platform.
            </p>

            <div style={{ marginBottom: "14px" }} />

            <div className="features"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "26px",
                marginBottom: "5rem",
                marginTop: "5rem",
              }}
            >
              {[
                { icon: <Zap />, title: "Tailored to Your Purchase", desc: "Trnzio gives customers instant access to multiple credit card options from top banks, right at checkout. Choose the card that delivers the maximum savings and benefits for your purchase." },
                { icon: <Shield />, title: "Maximize Every Offer, Every Time", desc: "From cashback to brand-exclusive discounts, Trnzio ensures you never miss a deal. Activate your card instantly and apply the offer to your purchase in one seamless flow." },
                { icon: <Globe />, title: "One Journey. Full Activation. Zero Complexity.", desc: "Apply → Get approved → Activate → Pay.A complete credit experience delivered in under a few minutes — powered by Trnzio." },
               
              ].map((f, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff",
                  }}
                >
                  <div className="icon-box">
                    {React.cloneElement(f.icon, { size: 20 })}
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(1.1rem, 2vw, 1.36rem)",
                      fontWeight: 700,
                      margin: "12px 0 8px",
                      color: "#ffffff",
                    }}
                  >
                    {f.title}
                  </h3>

                  <p style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.04rem)", color: "#e6e6e6" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS / SHOWCASE */}
        <section id="solutions" style={{ padding: '90px 0', background: '#fafbff',marginTop: '-2rem' }}>
          <div className="container">
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>
              Why Choose Trnzio?
            </h2>

            <p style={{ textAlign: 'center', color: '#666', maxWidth: '70ch', margin: '0 auto 28px', fontSize: 'clamp(1rem, 2vw, 2rem)',marginBottom: '3rem' }}>
              Join hundreds of companies transforming their payment experiences
            </p>

            <div className="solutions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '80px' }}>
              {[
                {
                  title: 'Lightning-Fast Deployment',
                  desc: 'Get your card program live in weeks, not months. Our streamlined onboarding accelerates your time to market.'
                },
                {
                  title: 'Enterprise-Grade Security',
                  desc: 'Built with security at its core. Bank-level encryption, fraud prevention, and compliance built-in.'
                },
                {
                  title: 'Transparent Pricing',
                  desc: 'No hidden fees or surprises. Clear, competitive pricing that scales with your business growth.'
                },
                {
                  title: 'Dedicated Support Team',
                  desc: 'Expert guidance every step of the way. From integration to optimization, we\'re here to help you succeed.'
                }
              ].map((card, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(10,20,50,0.04)',
                    borderTop: '4px solid transparent',
                    transition: 'border-color 200ms ease',
                    cursor: 'default',
                    minHeight: '260px' 
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderTop = '4px solid #0025ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderTop = '4px solid transparent')}
                >
                  <h3 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontWeight: 700, marginBottom: '14px' }}>
                    {card.title}
                  </h3>

                  <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.12rem)', color: '#444', lineHeight: 1.65 }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING/SHOWCASE */}
        <section id="pricing" style={{ padding: '50px 0', marginTop: '-3rem' }}>
          <div className="container">
            <div className="showcase-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '80px',
                alignItems: 'center'
              }}
            >

              {/* LEFT — BIGGER VIDEO */}
              <div className="pricing-video"
                style={{
                  width: '120%',
                  height: '620px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 22px 60px rgba(0,0,0,0.14)',
                  marginLeft: '-120px'
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                >
                  <source src={video1} type="video/mp4" />
                </video>
              </div>

              {/* RIGHT — TEXT */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#e6eeff',
                    color: '#0025ff',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                    borderRadius: '999px',
                    marginBottom: '20px'
                  }}
                >
                  Innovation in Action
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                    fontWeight: 800,
                    marginBottom: '18px',
                    lineHeight: 1.1
                  }}
                >
                  See How Trnzio Transforms Payment Experiences
                </h2>

                <p
                  style={{
                    fontSize: 'clamp(1rem, 1.5vw, 1.28rem)',
                    color: '#444',
                    marginBottom: '28px',
                    lineHeight: 1.7
                  }}
                >
                  Watch how our platform seamlessly integrates into your business,
                  delivering instant card issuance with enterprise-grade security
                  and real-time analytics.
                </p>

                {/* BULLETS */}
                <div style={{ display: 'grid', gap: '18px', marginBottom: '40px' }}>
                  {[
                    "Deploy virtual cards in seconds",
                    "Customize every aspect of your card program",
                    "Monitor transactions in real-time",
                    "Scale globally with confidence"
                  ].map((text, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          background: '#0025ff',
                          borderRadius: '50%',
                          boxShadow: '0 0 0 5px #e6eeff'
                        }}
                      />
                      <span style={{ fontSize: 'clamp(1rem, 1.5vw, 1.28rem)', fontWeight: 600, color: '#111' }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* BUTTON */}
                <a
                  href="#"
                  className="btn btn-primary"
                  style={{
                    padding: '16px 40px',
                    fontSize: '16px',
                    borderRadius: '10px'
                  }}
                >
                  Watch Full Demo →
                </a>
              </div>
            </div>
          </div>
        </section>

    

   
        <section id="faq" style={{ padding: '90px 0', marginTop: '-3rem' }}>
          <div className="container">
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, textAlign: 'center', marginBottom: '4rem' }}>
              Frequently Asked Questions
            </h2>
            <div className="faq-grid" style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr 1fr', maxWidth: '1000px', margin: '0 auto' }}>
              {[
                "How secure is Trnzio?",
                "Where can I issue cards?",
                "Can I set spending limits?",
                "Do you have an API?",
                "What payment methods do you support?",
                "How fast is card issuance?"
              ].map((q, i) => (
                <details key={i} className="card" style={{ padding: '16px' }}>
                  <summary style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)', fontWeight: 700 }}>{q}</summary>
                  <p style={{ marginTop: '10px', fontSize: 'clamp(0.9rem, 1.5vw, 1.0rem)', color: '#444' }}>
                    {i === 0 && "PCI DSS Level 1, tokenization, 3D Secure, HSM keys, SOC 2 Type II certified."}
                    {i === 1 && "150+ countries with local BINs, multi-currency, Apple Pay & Google Pay ready."}
                    {i === 2 && "Yes — per-card, per-day/month, MCC locks, velocity rules, real-time freeze."}
                    {i === 3 && "Full REST API, webhooks, SDKs (Node, Python, Go), sandbox included."}
                    {i === 4 && "All major card networks, Apple Pay, Google Pay, Samsung Pay, and more."}
                    {i === 5 && "Cards are issued in milliseconds — instantly available for use."}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
     <footer style={{ padding: '72px 0 32px', background: '#0a0d14', color: '#aaa' }}>
  <div className="container">
    <div
      className="footer-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
        gap: '40px',
        marginBottom: '36px'
      }}
    >
      {/* Brand */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            cursor: 'pointer'
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="32"
            height="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6L9 12L3 18"
              stroke="#566df1ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 6L15 12L9 18"
              stroke="#a13d07ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 6L21 12L15 18"
              stroke="#00A300"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.3px'
            }}
          >
            TrnZio
          </span>
        </div>

        <p style={{ fontSize: '14.5px', maxWidth: '380px', lineHeight: 1.6 }}>
          Instant virtual cards for the modern business era.
        </p>
      </div>

      {/* Product */}
      <div>
        <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
          Product
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13.5px'
          }}
        >
          <a href="#features">Features</a>
          <a href="#pricing">Solutions</a>
        </div>
      </div>

      {/* Company */}
      <div>
        <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
          Company
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13.5px'
          }}
        >
          <a href="#">About us</a>
          <a href="#">Why TrnZio</a>
        </div>
      </div>

      {/* Legal */}
      <div>
        <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
          Legal
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13.5px'
          }}
        >
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div
      style={{
        textAlign: 'center',
        fontSize: '13.5px',
        color: '#666'
      }}
    >
      © 2025 TrnZio. All rights reserved.
    </div>
  </div>

  <style>{`
    footer a {
      color: #aaa;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    footer a:hover {
      color: #ffffff;
    }

    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        row-gap: 32px;
      }
    }

    @media (max-width: 520px) {
      .footer-grid {
        grid-template-columns: 1fr;
        text-align: left;
      }
    }
  `}</style>
</footer>

      </div>
    </>
  );
}