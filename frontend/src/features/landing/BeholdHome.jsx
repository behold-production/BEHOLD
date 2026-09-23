import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import './behold.css';
import BrandIcon from '../../components/common/BrandIcon';
import FaqBlogSection from './FaqBlogSection';
import ContactInquirySection from './ContactInquirySection';

export default function BeholdHome({ onOpenAuth, onOpenBooking, siteSettings }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  const siteName = siteSettings?.siteName || 'BEHOLD';

  useEffect(() => {
    ApiService.getCounsellors({ limit: 4 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCounsellors(res.data.slice(0, 4));
        }
      })
      .catch((err) => console.warn('Failed to fetch counsellors:', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (onOpenAuth) onOpenAuth();
    else navigate('/login');
  };

  return (
    <div className="behold-theme">
      {/* ── NAVBAR ── */}
      <header className="bh-nav">
        <div className="bh-container bh-nav-inner">
          <a href="/" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="bh-logo">
            <BrandIcon className="bh-logo-icon" />
            {siteName}
          </a>

          <nav className="bh-nav-links" aria-label="Main navigation">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="active">Home</a>
            <a href="#psychologists" onClick={(e) => { e.preventDefault(); scrollTo('psychologists'); }}>Find a Psychologist</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How it Works</a>
            <a href="#faqs" onClick={(e) => { e.preventDefault(); scrollTo('faqs'); }}>FAQ &amp; Blog</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
          </nav>

          <div className="bh-nav-actions">
            <button className="bh-nav-login" onClick={handleAuth}>Log in</button>
            <button className="bh-nav-signup" onClick={handleAuth}>Sign Up →</button>
          </div>

          <button className="bh-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`bh-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>Home</a>
          <a href="#psychologists" onClick={(e) => { e.preventDefault(); scrollTo('psychologists'); }}>Find a Psychologist</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How it Works</a>
          <a href="#faqs" onClick={(e) => { e.preventDefault(); scrollTo('faqs'); }}>FAQ &amp; Blog</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
          <div className="bh-mobile-btn" style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="bh-nav-login" onClick={handleAuth} style={{ flex: 1 }}>Log in</button>
            <button className="bh-nav-signup" onClick={handleAuth} style={{ flex: 1 }}>Sign Up →</button>
          </div>
        </div>
      </header>

      <main id="home">

        {/* ── HERO ── */}
        <section className="bh-hero">
          <div className="bh-container bh-hero-inner">
            <div className="bh-hero-copy">
              <p className="bh-eyebrow">Elevating Minds. Empowering Lives.</p>
              <h1 className="bh-hero-h1">
                You Deserve<br />
                To <span className="highlight">Feel Better</span>
              </h1>
              <p className="bh-hero-lead">
                Book a session with certified psychologists, from the comfort of your home.
                Take the first step towards a happier, healthier you.
              </p>
              <div className="bh-hero-actions">
                <button className="bh-btn-primary" onClick={handleBook}>
                  Book a Session →
                </button>
                <button className="bh-btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo('psychologists'); }}>
                  Find a Psychologist
                </button>
              </div>
              <div className="bh-hero-trust">
                <span className="bh-trust-item">
                  <span className="bh-trust-check">✓</span> Verified Professionals
                </span>
                <span className="bh-trust-item">
                  <span className="bh-trust-check">✓</span> Secure &amp; Private
                </span>
                <span className="bh-trust-item">
                  <span className="bh-trust-check">✓</span> Flexible Scheduling
                </span>
              </div>
            </div>

            <div className="bh-hero-visual">
              <div className="bh-hero-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85"
                  alt="Person relaxing peacefully"
                  loading="eager"
                />
                <div className="bh-quote-card">
                  <strong>"It's okay to ask for help"</strong>
                  <small>Better mental health brings a brighter tomorrow.</small>
                  <span className="bh-quote-heart">♥</span>
                </div>
                <div className="bh-people-card">
                  <div className="bh-avatars">
                    <img src="https://i.pravatar.cc/80?img=47" alt="User" />
                    <img src="https://i.pravatar.cc/80?img=12" alt="User" />
                    <img src="https://i.pravatar.cc/80?img=32" alt="User" />
                  </div>
                  <div>
                    <strong>5000+</strong>
                    <small>People trusted us</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES STRIP ── */}
        <section className="bh-features">
          <div className="bh-container bh-features-grid">
            <div className="bh-feat">
              <div className="bh-feat-icon">🖥️</div>
              <h3>Online &amp; In-Person</h3>
              <p>Choose what's comfortable for you</p>
            </div>
            <div className="bh-feat">
              <div className="bh-feat-icon">🏅</div>
              <h3>Verified Experts</h3>
              <p>Licensed and experienced professionals</p>
            </div>
            <div className="bh-feat">
              <div className="bh-feat-icon">🗓️</div>
              <h3>Flexible Timings</h3>
              <p>Book sessions at your convenience</p>
            </div>
            <div className="bh-feat">
              <div className="bh-feat-icon">🔒</div>
              <h3>100% Confidential</h3>
              <p>Your privacy is our priority</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="bh-section" id="how-it-works">
          <div className="bh-container">
            <div style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
              <p className="bh-eyebrow">GET STARTED</p>
              <h2 className="bh-h2">How It Works</h2>
              <p className="bh-lead">Getting support is simple and takes just a few minutes.</p>
            </div>

            <div className="bh-steps-grid">
              <div className="bh-step">
                <div className="bh-step-num">1</div>
                <h3>Find a Psychologist</h3>
                <p>Browse profiles and choose the right expert for you.</p>
              </div>
              <div className="bh-step">
                <div className="bh-step-num">2</div>
                <h3>Book a Session</h3>
                <p>Select a convenient date, time and mode.</p>
              </div>
              <div className="bh-step">
                <div className="bh-step-num">3</div>
                <h3>Start Your Journey</h3>
                <p>Join the session and take a step towards a better you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MEET OUR EXPERTS ── */}
        <section className="bh-section" id="psychologists" style={{ background: '#f8fafc', paddingTop: '80px' }}>
          <div className="bh-container">
            <div className="bh-experts-head">
              <div>
                <p className="bh-eyebrow">MEET OUR EXPERTS</p>
                <h2 className="bh-h2">Find the Right Psychologist for You</h2>
                <p className="bh-lead" style={{ marginTop: '8px' }}>Our certified professionals are here to support you through life's challenges.</p>
              </div>
              <button className="bh-btn-ghost" onClick={() => navigate('/booking')} style={{ flexShrink: 0 }}>
                View All →
              </button>
            </div>

            <div className="bh-doctors-grid">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bh-doctor-card">
                    <div className="bh-doctor-photo bh-skeleton" style={{ height: '180px' }} />
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="bh-skeleton" style={{ height: '16px', borderRadius: '4px', width: '70%' }} />
                      <div className="bh-skeleton" style={{ height: '12px', borderRadius: '4px', width: '50%' }} />
                      <div className="bh-skeleton" style={{ height: '12px', borderRadius: '4px', width: '90%' }} />
                      <div className="bh-skeleton" style={{ height: '12px', borderRadius: '4px', width: '80%' }} />
                      <div className="bh-skeleton" style={{ height: '40px', borderRadius: '100px', marginTop: '8px' }} />
                    </div>
                  </div>
                ))
              ) : counsellors.length > 0 ? (
                counsellors.map((c) => (
                  <article key={c._id || c.id} className="bh-doctor-card">
                    <div className="bh-doctor-photo">
                      {c.profilePic ? (
                        <img src={c.profilePic} alt={c.name} />
                      ) : (
                        <div className="bh-doctor-photo-placeholder">
                          {c.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <button className="bh-doctor-fav" aria-label="Favourite">♡</button>
                    </div>
                    <div className="bh-doctor-body">
                      <h3 className="bh-doctor-name">{c.name}</h3>
                      <p className="bh-doctor-spec">{c.specialization || 'Clinical Psychologist'}</p>
                      {c.bio && <p className="bh-doctor-desc">{c.bio}</p>}
                      {c.experience && (
                        <p className="bh-doctor-spec">{c.experience} years experience</p>
                      )}
                      <div className="bh-doctor-rating">
                        <span className="bh-rating-star">★</span>
                        <span className="bh-rating-val">4.9</span>
                        <span className="bh-rating-count">({(c.name?.length || 5) * 12 + 20} reviews)</span>
                      </div>
                      <div className="bh-doctor-tags">
                        {(c.tags || ['Anxiety', 'Stress']).slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="bh-tag">{tag}</span>
                        ))}
                      </div>
                      <button className="bh-doctor-btn" onClick={handleBook}>Book a Session</button>
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' }}>
                  No experts found at the moment. Please check back soon.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE BEHOLD ── */}
        <section className="bh-section bh-why" id="about">
          <div className="bh-container bh-why-grid">
            <div className="bh-why-copy">
              <p className="bh-eyebrow">WHY CHOOSE {siteName.toUpperCase()}</p>
              <h2 className="bh-h2">More Than Just<br />A Booking Platform</h2>
              <p className="bh-lead">
                We believe that mental health care should be accessible, affordable, and stigma-free.
                Our platform connects you with trusted psychologists who truly care about your well-being.
              </p>
            </div>

            <div className="bh-reasons">
              <div className="bh-reason">
                <div className="bh-reason-icon">❤️</div>
                <div>
                  <h4>Trusted &amp; Verified Professionals</h4>
                  <p>All our psychologists are licensed and background-checked.</p>
                </div>
              </div>
              <div className="bh-reason">
                <div className="bh-reason-icon blue">🎓</div>
                <div>
                  <h4>Wide Range of Specializations</h4>
                  <p>From anxiety to career guidance, find the right support.</p>
                </div>
              </div>
              <div className="bh-reason">
                <div className="bh-reason-icon green">💸</div>
                <div>
                  <h4>Affordable &amp; Transparent Pricing</h4>
                  <p>No hidden costs. Quality care within your reach.</p>
                </div>
              </div>
              <div className="bh-reason">
                <div className="bh-reason-icon orange">🤝</div>
                <div>
                  <h4>A Safe &amp; Supportive Community</h4>
                  <p>Resources, workshops and a community that understands you.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="bh-section" id="reviews">
          <div className="bh-container">
            <p className="bh-eyebrow">REAL STORIES</p>
            <h2 className="bh-h2">What Our Users Say</h2>
            <div className="bh-testi-grid">
              <div className="bh-testi-card">
                <p className="bh-testi-quote">"{siteName} made it so easy to find the right therapist. I finally feel heard and supported."</p>
                <div className="bh-testi-user">
                  <img src="https://i.pravatar.cc/80?img=49" alt="Priya S." />
                  <div>
                    <div className="bh-testi-name">Priya S.</div>
                    <div className="bh-testi-label">Verified User</div>
                  </div>
                  <span className="bh-testi-stars">★★★★★</span>
                </div>
              </div>
              <div className="bh-testi-card">
                <p className="bh-testi-quote">"The sessions have really helped me manage my anxiety. Highly recommend this platform!"</p>
                <div className="bh-testi-user">
                  <img src="https://i.pravatar.cc/80?img=11" alt="Arjun K." />
                  <div>
                    <div className="bh-testi-name">Arjun K.</div>
                    <div className="bh-testi-label">Verified User</div>
                  </div>
                  <span className="bh-testi-stars">★★★★★</span>
                </div>
              </div>
              <div className="bh-testi-card">
                <p className="bh-testi-quote">"Professional, easy to use, and truly caring. A great platform for mental health support."</p>
                <div className="bh-testi-user">
                  <img src="https://i.pravatar.cc/80?img=45" alt="Sneha M." />
                  <div>
                    <div className="bh-testi-name">Sneha M.</div>
                    <div className="bh-testi-label">Verified User</div>
                  </div>
                  <span className="bh-testi-stars">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ & BLOG ── */}
        <div id="faqs">
          <FaqBlogSection />
        </div>

        {/* ── CONTACT ── */}
        <div id="contact">
          <ContactInquirySection />
        </div>

        {/* ── CTA BANNER ── */}
        <section className="bh-section" style={{ paddingTop: '0' }}>
          <div className="bh-container">
            <div className="bh-cta-banner">
              <div>
                <h2>Take the First Step Today</h2>
                <p>Your mental well-being matters. Book a session now and start your journey.</p>
              </div>
              <button className="bh-btn-primary" onClick={handleBook} style={{ flexShrink: 0 }}>
                Book a Session →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bh-footer">
        <div className="bh-container bh-footer-main">
          <div className="bh-footer-brand">
            <a href="/" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="bh-logo">
              <BrandIcon className="bh-logo-icon" />
              {siteName}
            </a>
            <p className="bh-footer-tagline">Empowering Minds. Elevating Lives.</p>
          </div>
          <div className="bh-footer-col">
            <h4>Platform</h4>
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>Home</a>
            <a href="#psychologists" onClick={(e) => { e.preventDefault(); scrollTo('psychologists'); }}>Find a Psychologist</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How it Works</a>
            <a href="#faqs" onClick={(e) => { e.preventDefault(); scrollTo('faqs'); }}>FAQ &amp; Blog</a>
          </div>
          <div className="bh-footer-col">
            <h4>Company</h4>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About Us</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
          <div className="bh-footer-col">
            <h4>Contact</h4>
            <a href="tel:+919999999999">+91 99999 99999</a>
            <a href="mailto:hello@behold.co.in">hello@behold.co.in</a>
            <a>Kochi, Kerala, India</a>
          </div>
        </div>
        <div className="bh-container bh-footer-bottom">
          <span>© {new Date().getFullYear()} {siteSettings?.siteCopyright || 'BEHOLD Ltd'}. All rights reserved.</span>
          <div className="bh-footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
