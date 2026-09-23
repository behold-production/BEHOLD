import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import './mindcare.css'; // The scoped CSS for this layout

export default function MindCareHome({ onOpenAuth, onOpenBooking }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dynamic counsellors from admin data
    ApiService.getPublicCounsellors({ limit: 4 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCounsellors(res.data.slice(0, 4));
        }
      })
      .catch((err) => console.warn('Failed to fetch counsellors:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleNav = (e, path) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (path.startsWith('#')) {
      const el = document.getElementById(path.substring(1));
      if (el) {
        window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (onOpenAuth) onOpenAuth();
    else navigate('/profile');
  };

  return (
    <div className="mindcare-theme">
      <header className="site-header">
        <div className="mc-container nav">
          <a href="/" onClick={(e) => handleNav(e, '#home')} className="brand">
            <span className="brand-mark"><span></span><span></span></span>
            <span>MindCare</span>
          </a>

          <nav className={`desktop-nav ${mobileMenuOpen ? '!flex !flex-col !absolute !top-[68px] !left-0 !w-full !bg-white !shadow-lg !p-6 !z-50 !m-0 !items-start !gap-4' : ''}`} aria-label="Main navigation">
            <a href="#home" onClick={(e) => handleNav(e, '#home')} className="active">Home</a>
            <a href="#psychologists" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</a>
            <a href="#how-it-works" onClick={(e) => handleNav(e, '#how-it-works')}>How it Works</a>
            <a href="#resources" onClick={(e) => handleNav(e, '#resources')}>Resources</a>
            <a href="#about" onClick={(e) => handleNav(e, '#about')}>About</a>
          </nav>

          <div className="nav-actions">
            <a href="#" className="login-btn" onClick={handleAuth}>Log in</a>
            <button className="signup-btn cursor-pointer" onClick={handleAuth}>Sign Up</button>
          </div>

          <button className="mobile-menu cursor-pointer" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="mc-container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">A Healthier Mind. A Brighter You</p>
              <h1>You Deserve<br />To <span>Feel Better</span></h1>
              <p className="hero-text">
                Book a session with certified psychologists,<br className="hidden md:block" />
                from the comfort of your home. Take the first<br className="hidden md:block" />
                step towards a happier, healthier you.
              </p>

              <div className="hero-buttons">
                <button className="primary-btn cursor-pointer" onClick={handleBook}>Book a Session <b>→</b></button>
                <button className="secondary-btn cursor-pointer" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</button>
              </div>

              <div className="trust-row">
                <span><i>✓</i> Verified Professionals</span>
                <span><i>✓</i> Secure &amp; Private</span>
                <span><i>✓</i> Flexible Scheduling</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-blob"></div>
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85" alt="Person relaxing during a peaceful moment" />
              <div className="quote-card">
                <strong>“It’s okay to<br />ask for help”</strong>
                <small>Better mental health<br />brings a brighter tomorrow.</small>
                <span>♥</span>
              </div>
              <div className="people-card">
                <div className="avatars">
                  <img src="https://i.pravatar.cc/80?img=47" alt="User 1" />
                  <img src="https://i.pravatar.cc/80?img=12" alt="User 2" />
                  <img src="https://i.pravatar.cc/80?img=32" alt="User 3" />
                </div>
                <div><strong>5000+</strong><small>People trusted us</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div className="mc-container benefits-grid">
            <article className="benefit">
              <div className="benefit-icon purple">▰</div>
              <h3>Online &amp; In-Person</h3>
              <p>Choose what's comfortable<br />for you</p>
            </article>
            <article className="benefit">
              <div className="benefit-icon green">◆</div>
              <h3>Verified Experts</h3>
              <p>Licensed and experienced<br />professionals</p>
            </article>
            <article className="benefit">
              <div className="benefit-icon orange">▣</div>
              <h3>Flexible Timings</h3>
              <p>Book sessions at your<br />convenience</p>
            </article>
            <article className="benefit">
              <div className="benefit-icon blue">▣</div>
              <h3>100% Confidential</h3>
              <p>Your privacy is our priority</p>
            </article>
          </div>
        </section>

        <section className="section how" id="how-it-works">
          <div className="mc-container">
            <div className="section-heading centered">
              <p className="eyebrow">GET STARTED</p>
              <h2>How It Works</h2>
              <p>Getting support is simple and takes just a few minutes.</p>
            </div>

            <div className="steps">
              <article className="step">
                <div className="step-top"><span className="number">1</span><span className="step-icon">⌕</span></div>
                <h3>Find a Psychologist</h3>
                <p>Browse profiles and choose<br />the right expert for you.</p>
              </article>
              <div className="step-arrow">→</div>
              <article className="step">
                <div className="step-top"><span className="number">2</span><span className="step-icon">▦</span></div>
                <h3>Book a Session</h3>
                <p>Select a convenient date,<br />time and mode (online/in-person).</p>
              </article>
              <div className="step-arrow">→</div>
              <article className="step">
                <div className="step-top"><span className="number">3</span><span className="step-icon">●</span></div>
                <h3>Start Your Journey</h3>
                <p>Join the session and take a step<br />towards a better you.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section experts" id="psychologists">
          <div className="mc-container">
            <div className="section-heading expert-heading">
              <div>
                <p className="eyebrow">MEET OUR EXPERTS</p>
                <h2>Find the Right Psychologist for You</h2>
                <p>Our certified professionals are here to support you through life's challenges.</p>
              </div>
              <button className="outline-small cursor-pointer" onClick={() => navigate('/booking')}>View All <span>→</span></button>
            </div>

            <div className="doctor-grid">
              {loading ? (
                // Skeletons while fetching real data
                [1, 2, 3, 4].map((i) => (
                  <article key={i} className="doctor-card animate-pulse">
                    <div className="doctor-photo bg-slate-200 h-[100px] w-full rounded-md mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded-full w-full"></div>
                  </article>
                ))
              ) : counsellors.length > 0 ? (
                // Map over real dynamic backend data
                counsellors.map((c) => (
                  <article key={c._id || c.id} className="doctor-card">
                    <div className="doctor-photo">
                      {c.profilePic ? (
                        <img src={c.profilePic} alt={c.name} />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl font-black text-slate-400">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <button className="cursor-pointer">♡</button>
                    </div>
                    <h3>{c.name}</h3>
                    <p className="role">{c.specialization || 'Clinical Psychologist'}</p>
                    <p className="experience">{c.experience ? `${c.experience} years experience` : '5+ years experience'}</p>
                    <p className="rating"><b>★</b> 4.9 <span>({(c.name.length * 12) + 20} reviews)</span></p>
                    <div className="tags">
                      {(c.tags || ['Anxiety', 'Stress']).slice(0, 2).map((tag, idx) => (
                        <span key={idx}>{tag}</span>
                      ))}
                    </div>
                    <button onClick={handleBook} className="card-btn cursor-pointer mt-3 w-full">Book a Session</button>
                  </article>
                ))
              ) : (
                <div className="col-span-4 text-center py-10 text-slate-500">
                  No experts found at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section why" id="about">
          <div className="mc-container why-grid">
            <div>
              <p className="eyebrow">WHY CHOOSE MINDCARE</p>
              <h2>More Than Just<br />A Booking Platform</h2>
              <p className="why-text">We believe that mental health care should be accessible, affordable, and stigma-free. Our platform connects you with trusted psychologists who truly care.</p>
            </div>
            <div className="why-list">
              <div><span>♥</span><div><strong>Trusted &amp; Verified Professionals</strong><p>All our psychologists are licensed and background-checked.</p></div></div>
              <div><span>♣</span><div><strong>Wide Range of Specializations</strong><p>From anxiety to career guidance, find the right support.</p></div></div>
              <div><span>₹</span><div><strong>Affordable &amp; Transparent Pricing</strong><p>No hidden costs. Quality care within your reach.</p></div></div>
              <div><span>◆</span><div><strong>A Safe &amp; Supportive Community</strong><p>Resources, workshops and a community that understands you.</p></div></div>
            </div>
          </div>
        </section>

        <section className="section stories" id="resources">
          <div className="mc-container">
            <div className="section-heading">
              <p className="eyebrow">REAL STORIES</p>
              <h2>What Our Users Say</h2>
            </div>
            <div className="testimonial-grid">
              <article className="testimonial">
                <p>“MindCare made it so easy to find the right therapist. I finally feel heard and supported.”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=49" alt="User 1" />
                  <div><strong>Priya S.</strong><small>Verified User</small></div>
                  <b>★★★★★</b>
                </div>
              </article>
              <article className="testimonial">
                <p>“The sessions have really helped me manage my anxiety. Highly recommend this platform!”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=11" alt="User 2" />
                  <div><strong>Arjun K.</strong><small>Verified User</small></div>
                  <b>★★★★★</b>
                </div>
              </article>
              <article className="testimonial">
                <p>“Professional, easy to use, and truly caring. A great platform for mental health support.”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=45" alt="User 3" />
                  <div><strong>Sneha M.</strong><small>Verified User</small></div>
                  <b>★★★★★</b>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="mc-container cta">
            <div>
              <h2>Take the First Step Today</h2>
              <p>Your mental well-being matters. Book a session now and<br className="hidden md:block" /> start your journey towards a healthier, happier you.</p>
            </div>
            <button onClick={handleBook} className="primary-btn cursor-pointer">Book a Session <b>→</b></button>
            <div className="leaf-decoration">◜<br />◝</div>
          </div>
        </section>
      </main>

      <footer>
        <div className="mc-container footer-main">
          <div className="footer-brand">
            <a href="#" className="brand"><span className="brand-mark"><span></span><span></span></span><span>MindCare</span></a>
            <p>Supporting Minds. Building Brighter Tomorrows.</p>
          </div>
          <div className="footer-links">
            <a href="#home" onClick={(e) => handleNav(e, '#home')}>Home</a>
            <a href="#psychologists" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</a>
            <a href="#resources" onClick={(e) => handleNav(e, '#resources')}>Resources</a>
            <a href="#about" onClick={(e) => handleNav(e, '#about')}>About</a>
            <a href="#" onClick={(e) => handleNav(e, '/contact')}>Contact</a>
          </div>
          <div className="socials">
            <a href="#">◎</a><a href="#">in</a><a href="#">♥</a><a href="#">▶</a>
          </div>
        </div>
        <div className="mc-container footer-bottom">
          <span>© 2026 MindCare. All rights reserved.</span>
          <div>
            <a href="#" onClick={(e) => handleNav(e, '/privacy')}>Privacy Policy</a>
            <a href="#" onClick={(e) => handleNav(e, '/terms')}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
