import React from 'react';
import { Zap, Shield, Globe, Users, Target, Award, Heart, Clock, CheckCircle, Star } from 'lucide-react';
import Navbar from './Navbar';

export default function AboutUs() {
  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(1400px 700px at 80% -10%, rgba(0, 37, 255, 0.12), transparent 60%), radial-gradient(1000px 600px at -20% 20%, rgba(77, 108, 255, 0.10), transparent 60%), #f7f9fc',
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

          /* Consistent button styles */
          .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 26px; border-radius: 999px; font-weight: 600; cursor: pointer;
            font-size: 16px;
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
          .icon-box {
            width: 50px; height: 50px; border-radius: 12px;
            background: linear-gradient(135deg, #0025ff, #4d6cff);
            display: grid; place-items: center; color: white; margin-bottom: 16px;
          }

          /* RESPONSIVE STYLES */
          @media (max-width: 1200px) {
            .container {
              padding: 0 24px;
            }
          }

          @media (max-width: 768px) {
            .container {
              padding: 0 20px;
            }
            
            .hero-grid, .mission-grid, .values-grid, .team-grid { 
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            
            .benefits-grid {
              grid-template-columns: 1fr !important;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            
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
          }

          @media (max-width: 480px) {
            .container {
              padding: 0 16px;
            }
            
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
            
            .hero-buttons {
              flex-direction: column !important;
              width: 100% !important;
            }
            
            .hero-buttons .btn {
              width: 100% !important;
            }
          }
        `}</style>

        <Navbar />

        {/* HERO SECTION */}
        <header style={{ padding: '100px 0 80px' }}>
          <div className="container">
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div>
                <span style={{
                  display: 'inline-flex', gap: '10px', alignItems: 'center',
                  background: '#e6f0ff', color: '#0025ff', padding: '8px 16px',
                  borderRadius: '999px', fontSize: '15px', fontWeight: 600,
                  marginBottom: '20px'
                }}>
                  <Users size={20} /> About TrnZio
                </span>

                <h1 style={{
                  fontSize: 'clamp(2.8rem, 4.8vw, 4.4rem)',
                  lineHeight: 1.06, letterSpacing: '-0.035em', margin: '18px 0 14px',
                  fontWeight: 800, color: '#4a4848ff'
                }}>
                  Redefining Credit<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontSize: '1.03em'
                  }}>
                    for the Digital Era
                  </span>
                </h1>

                <p style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.28rem)', 
                  color: '#444', 
                  maxWidth: '56ch', 
                  marginBottom: '34px',
                  lineHeight: 1.7 
                }}>
                  TrnZio is revolutionizing how consumers access and use credit. We bridge the gap between 
                  high-intent purchases and optimal credit options, delivering instant access to the best 
                  cards and offers exactly when they matter most.
                </p>

                <div className="hero-buttons" style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                  <a href="#mission" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '15px' }}>Our Mission</a>
                  <a href="#why-choose" className="btn" style={{ gap: '10px', padding: '14px 36px', fontSize: '15px' }}>
                    Why Choose Us
                  </a>
                </div>
              </div>

              {/* GRAPHIC/ELEMENTS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
              }}>
                <div className="card" style={{ 
                  background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
                  color: 'white',
                  padding: '30px',
                  gridColumn: 'span 2'
                }}>
                  <div className="icon-box" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <Zap size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '12px 0 8px' }}>
                    Instant Access
                  </h3>
                  <p>Credit when you need it, where you need it</p>
                </div>
                
                <div className="card" style={{ padding: '20px' }}>
                  <div className="icon-box" style={{ width: '40px', height: '40px' }}>
                    <Shield size={20} />
                  </div>
                  <p style={{ fontWeight: 600 }}>Bank-Level Security</p>
                </div>
                
                <div className="card" style={{ padding: '20px' }}>
                  <div className="icon-box" style={{ width: '40px', height: '40px' }}>
                    <Globe size={20} />
                  </div>
                  <p style={{ fontWeight: 600 }}>Global Network</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MISSION SECTION */}
        <section id="mission" style={{ padding: '80px 0', background: '#fafbff' }}>
          <div className="container">
            <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  color: '#0025ff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px'
                }}>
                  Our Vision
                </span>
                
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  marginBottom: '24px',
                  lineHeight: 1.1
                }}>
                  One Platform.<br />
                  Unlimited Credit Possibilities.
                </h2>
                
                <p style={{ 
                  fontSize: 'clamp(1rem, 1.5vw, 1.18rem)', 
                  color: '#444', 
                  marginBottom: '32px',
                  lineHeight: 1.7 
                }}>
                  We envision a world where credit access is instant, intelligent, and integrated into every 
                  purchase decision. Where consumers never have to compromise on value, and businesses can 
                  offer personalized financial solutions seamlessly.
                </p>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '40px' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0025ff' }}>100+</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Bank Partners</div>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: '#e0e0e0' }}></div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0025ff' }}>1M+</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Cards Issued</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="card" style={{ padding: '40px' }}>
                  <div className="icon-box">
                    <Target size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '12px 0 16px' }}>
                    Our Mission
                  </h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#444' }}>
                    To democratize access to premium credit offerings by connecting consumers with the 
                    perfect card for every purchase, eliminating friction, and maximizing value through 
                    intelligent, instant decisioning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE TRNZIO SECTION */}
        <section id="why-choose" style={{ padding: '100px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
              <span style={{
                display: 'inline-flex', gap: '10px', alignItems: 'center',
                background: '#e6f0ff', color: '#0025ff', padding: '8px 20px',
                borderRadius: '999px', fontSize: '15px', fontWeight: 600,
                marginBottom: '20px'
              }}>
                <Award size={20} /> Why Choose TrnZio
              </span>
              
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                marginBottom: '24px',
                lineHeight: 1.1
              }}>
                Revolutionizing Credit Access
              </h2>
              
              <p style={{ 
                fontSize: 'clamp(1rem, 1.5vw, 1.18rem)', 
                color: '#666',
                lineHeight: 1.7 
              }}>
                We're not just another credit platform. We're the bridge between your purchase intent and 
                optimal credit value.
              </p>
            </div>

            <div className="benefits-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '30px',
              marginBottom: '60px'
            }}>
              {[
                {
                  icon: <Zap />,
                  title: 'Instant Card Issuance',
                  description: 'Get approved and start using your credit card immediately. No waiting, no delays.',
                  gradient: 'linear-gradient(135deg, #0025ff, #4d6cff)'
                },
                {
                  icon: <Star />,
                  title: 'Best Offers in One Place',
                  description: 'Never miss cashback, discounts, or brand deals again. We aggregate all offers.',
                  gradient: 'linear-gradient(135deg, #ff6b00, #ff8c00)'
                },
                {
                  icon: <Globe />,
                  title: 'Wide Bank Network',
                  description: 'Access cards from multiple leading banks through one seamless gateway.',
                  gradient: 'linear-gradient(135deg, #00a300, #00cc00)'
                },
                {
                  icon: <Heart />,
                  title: 'Streamlined Experience',
                  description: 'From application to payment — all in one simple, frictionless journey.',
                  gradient: 'linear-gradient(135deg, #ff00cc, #ff33cc)'
                },
                {
                  icon: <Shield />,
                  title: 'Secure & Compliant',
                  description: 'Built with industry-leading fintech standards and privacy controls.',
                  gradient: 'linear-gradient(135deg, #9900ff, #cc33ff)'
                },
                {
                  icon: <Clock />,
                  title: 'Optimized for Major Purchases',
                  description: 'Travel, electronics, jewelry, dining — get the best value on every major spend.',
                  gradient: 'linear-gradient(135deg, #0099cc, #00ccff)'
                }
              ].map((benefit, index) => (
                <div key={index} className="card" style={{ 
                  padding: '30px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div 
                    className="icon-box"
                    style={{ 
                      background: benefit.gradient,
                      marginBottom: '20px'
                    }}
                  >
                    {React.cloneElement(benefit.icon, { size: 24 })}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    marginBottom: '12px',
                    color: '#111'
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: '#444',
                    lineHeight: 1.6
                  }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* STATS SECTION */}
            <div className="stats-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '30px',
              marginTop: '80px'
            }}>
              {[
                { number: '99.9%', label: 'Uptime', icon: <CheckCircle size={24} /> },
                { number: '< 60s', label: 'Card Issuance', icon: <Clock size={24} /> },
                { number: '150+', label: 'Countries', icon: <Globe size={24} /> },
                { number: '0', label: 'Hidden Fees', icon: <Shield size={24} /> }
              ].map((stat, index) => (
                <div key={index} className="card" style={{ 
                  textAlign: 'center',
                  padding: '30px'
                }}>
                  <div style={{ 
                    color: '#0025ff',
                    marginBottom: '12px'
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
                    fontWeight: 600
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section style={{ padding: '80px 0', background: '#fafbff' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                marginBottom: '24px',
                lineHeight: 1.1
              }}>
                Built for Trust. Designed for Speed.
              </h2>
              
              <p style={{ 
                fontSize: 'clamp(1rem, 1.5vw, 1.18rem)', 
                color: '#666',
                lineHeight: 1.7 
              }}>
                Our core values shape everything we do, from product development to customer support.
              </p>
            </div>

            <div className="values-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '30px' 
            }}>
              {[
                {
                  title: 'Customer First',
                  description: 'Every feature, every update is designed with our users needs at the forefront.'
                },
                {
                  title: 'Transparency',
                  description: 'Clear pricing, straightforward terms, and honest communication always.'
                },
                {
                  title: 'Innovation',
                  description: 'Constantly pushing boundaries to deliver better credit experiences.'
                },
                {
                  title: 'Security',
                  description: 'Enterprise-grade security isn’t an add-on — it’s built into our foundation.'
                }
              ].map((value, index) => (
                <div key={index} className="card" style={{ 
                  padding: '30px',
                  background: 'white',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0025ff';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '16px'
                  }}>
                    0{index + 1}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    marginBottom: '12px',
                    color: '#111'
                  }}>
                    {value.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#444',
                    lineHeight: 1.6
                  }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section style={{ padding: '100px 0' }}>
          <div className="container">
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, #0025ff, #4d6cff)',
              color: 'white',
              padding: '60px',
              textAlign: 'center',
              borderRadius: '24px'
            }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                marginBottom: '20px',
                lineHeight: 1.1
              }}>
                Join the Credit Revolution
              </h2>
              
              <p style={{ 
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', 
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto 40px',
                lineHeight: 1.6
              }}>
                Experience the future of credit access. Get started with TrnZio today and unlock instant 
                value on every purchase.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/" className="btn" style={{ 
                  background: 'white',
                  color: '#0025ff',
                  padding: '16px 40px',
                  fontSize: '16px'
                }}>
                  Back to Home
                </a>
                <a href="/launchdemo" className="btn" style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '16px 40px',
                  fontSize: '16px'
                }}>
                  Launch Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '72px 0 32px', background: '#0a0d14', color: '#aaa' }}>
          <div className="container">
            <div className="footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
              gap: '40px',
              marginBottom: '36px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                    <path d="M3 6L9 12L3 18" stroke="#566df1ff" strokeWidth="3" />
                    <path d="M9 6L15 12L9 18" stroke="#a13d07ff" strokeWidth="3" />
                    <path d="M15 6L21 12L15 18" stroke="#00A300" strokeWidth="3" />
                  </svg>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>
                    TrnZio
                  </span>
                </div>
                <p style={{ fontSize: '14.5px', maxWidth: '380px', lineHeight: 1.6 }}>
                  Instant virtual cards for the modern business era.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
                  About
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  <a href="/about">Our Mission</a>
                  <a href="/about#why-choose">Why TrnZio</a>
                </div>
              </div>

              <div>
                <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
                  Product
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  <a href="/#features">Features</a>
                  <a href="/#pricing">Solutions</a>
                </div>
              </div>

              <div>
                <h4 style={{ color: 'white', fontSize: '14.5px', marginBottom: '10px' }}>
                  Legal
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms of Service</a>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#666' }}>
              © 2025 TrnZio. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}