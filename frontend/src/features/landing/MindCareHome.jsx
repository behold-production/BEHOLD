import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import './mindcare.css'; // The scoped CSS for this layout (now containing V2 styles)
import BrandIcon from '../../components/common/BrandIcon';
import FaqBlogSection from './FaqBlogSection';
import ContactInquirySection from './ContactInquirySection';

export default function MindCareHome({ onOpenAuth, onOpenBooking, siteSettings, navigateToSection }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dynamic counsellors from admin data
    ApiService.getCounsellors({ limit: 4 })
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

  const siteName = siteSettings?.siteName || 'BEHOLD';

  return (
    <div className="behold-theme">
      <header className="site-header">
        <div className="container nav">
          <a href="/" onClick={(e) => handleNav(e, '#home')} className="logo !flex !items-center !gap-2">
            <BrandIcon className="w-6 h-6 text-[#00e5ff]" />
            <span className="font-bold tracking-tight text-xl text-slate-900">{siteName}</span>
          </a>

          <nav className={`main-nav ${mobileMenuOpen ? '!flex !flex-col !absolute !top-[68px] !left-0 !w-full !bg-white !shadow-lg !p-6 !z-50 !m-0 !items-start !gap-4' : ''}`} aria-label="Main navigation">
            <a href="#home" onClick={(e) => handleNav(e, '#home')} className="active">Home</a>
            <a href="#psychologists" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</a>
            <a href="#how-it-works" onClick={(e) => handleNav(e, '#how-it-works')}>How it Works</a>
            <a href="#faqs" onClick={(e) => handleNav(e, '#faqs')}>FAQ & Blog</a>
            <a href="#about" onClick={(e) => handleNav(e, '#about')}>About</a>
          </nav>

          <div className="nav-actions">
            <a href="#" className="btn-outline" onClick={handleAuth}>Log in</a>
            <button className="btn-solid cursor-pointer" onClick={handleAuth}>Sign Up</button>
          </div>

          <button className="menu cursor-pointer" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Elevating Minds. Empowering Lives.</p>
              <h1>You Deserve<br />To <span>Feel Better</span></h1>
              <p className="lead">
                Book a session with certified psychologists,<br className="hidden md:block" />
                from the comfort of your home. Take the first<br className="hidden md:block" />
                step towards a happier, healthier you.
              </p>

              <div className="actions">
                <button className="btn-solid pill cursor-pointer" onClick={handleBook}>Book a Session <b>→</b></button>
                <button className="btn-outline pill cursor-pointer" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</button>
              </div>

              <div className="hero-trust">
                <span><i>✓</i> Verified Professionals</span>
                <span><i>✓</i> Secure &amp; Private</span>
                <span><i>✓</i> Flexible Scheduling</span>
              </div>
            </div>

            <div className="visual">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85" alt="Person relaxing during a peaceful moment" />
              <div className="quote">
                <strong>“It’s okay to<br />ask for help”</strong>
                <small>Better mental health<br />brings a brighter tomorrow.</small>
                <b>♥</b>
              </div>
              <div className="people">
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

        <section className="feature-strip">
          <div className="container feature-grid">
            <div className="feature">
              <div className="icon-circle">▰</div>
              <h3>Online &amp; In-Person</h3>
              <p>Choose what's comfortable<br />for you</p>
            </div>
            <div className="feature">
              <div className="icon-circle">◆</div>
              <h3>Verified Experts</h3>
              <p>Licensed and experienced<br />professionals</p>
            </div>
            <div className="feature">
              <div className="icon-circle">▣</div>
              <h3>Flexible Timings</h3>
              <p>Book sessions at your<br />convenience</p>
            </div>
            <div className="feature">
              <div className="icon-circle">▣</div>
              <h3>100% Confidential</h3>
              <p>Your privacy is our priority</p>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-head center">
              <p className="eyebrow">GET STARTED</p>
              <h2>How It Works</h2>
              <p className="lead">Getting support is simple and takes just a few minutes.</p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-top"><span className="num">1</span><span className="step-icon">⌕</span></div>
                <h3>Find a Psychologist</h3>
                <p>Browse profiles and choose<br />the right expert for you.</p>
              </div>
              <div className="arrow">→</div>
              <div className="step">
                <div className="step-top"><span className="num">2</span><span className="step-icon">▦</span></div>
                <h3>Book a Session</h3>
                <p>Select a convenient date,<br />time and mode.</p>
              </div>
              <div className="arrow">→</div>
              <div className="step">
                <div className="step-top"><span className="num">3</span><span className="step-icon">●</span></div>
                <h3>Start Your Journey</h3>
                <p>Join the session and take a step<br />towards a better you.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '10px' }} id="psychologists">
          <div className="container">
            <div className="expert-head">
              <div>
                <p className="eyebrow">MEET OUR EXPERTS</p>
                <h2>Find the Right Psychologist for You</h2>
                <p className="lead">Our certified professionals are here to support you through life's challenges.</p>
              </div>
              <button className="small-outline cursor-pointer" onClick={() => navigate('/booking')}>View All <span>→</span></button>
            </div>

            <div className="doctors">
              {loading ? (
                // Skeletons while fetching real data
                [1, 2, 3, 4].map((i) => (
                  <article key={i} className="doctor animate-pulse">
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
                  <article key={c._id || c.id} className="doctor">
                    <div className="doctor-photo">
                      {c.profilePic ? (
                        <img src={c.profilePic} alt={c.name} />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl font-black text-slate-400">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <button className="heart cursor-pointer">♡</button>
                    </div>
                    <h3>{c.name}</h3>
                    <p className="muted">{c.specialization || 'Clinical Psychologist'}</p>
                    <p className="muted">{c.experience ? `${c.experience} years experience` : '5+ years experience'}</p>
                    <p className="rating"><b>★</b> 4.9 <span>({(c.name.length * 12) + 20} reviews)</span></p>
                    <div className="tags">
                      {(c.tags || ['Anxiety', 'Stress']).slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
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

        <section className="section" id="about">
          <div className="container two-col">
            <div className="why-copy">
              <p className="eyebrow">WHY CHOOSE {siteName.toUpperCase()}</p>
              <h2>More Than Just<br />A Booking Platform</h2>
              <p className="lead">We believe that mental health care should be accessible, affordable, and stigma-free. Our platform connects you with trusted psychologists who truly care about your well-being.</p>
            </div>
            <div className="reason-list">
              <div className="reason">
                <span className="icon-circle">♥</span>
                <div><strong>Trusted &amp; Verified Professionals</strong><p>All our psychologists are licensed and background-checked.</p></div>
              </div>
              <div className="reason">
                <span className="icon-circle">♣</span>
                <div><strong>Wide Range of Specializations</strong><p>From anxiety to career guidance, find the right support.</p></div>
              </div>
              <div className="reason">
                <span className="icon-circle">₹</span>
                <div><strong>Affordable &amp; Transparent Pricing</strong><p>No hidden costs. Quality care within your reach.</p></div>
              </div>
              <div className="reason">
                <span className="icon-circle">◆</span>
                <div><strong>A Safe &amp; Supportive Community</strong><p>Resources, workshops and a community that understands you.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="reviews">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">REAL STORIES</p>
              <h2>What Our Users Say</h2>
            </div>
            <div className="testimonials">
              <div className="testimonial">
                <p>“{siteName} made it so easy to find the right therapist. I finally feel heard and supported.”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=49" alt="User 1" />
                  <div><strong>Priya S.</strong><small>Verified User</small></div>
                  <span className="stars">★★★★★</span>
                </div>
              </div>
              <div className="testimonial">
                <p>“The sessions have really helped me manage my anxiety. Highly recommend this platform!”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=11" alt="User 2" />
                  <div><strong>Arjun K.</strong><small>Verified User</small></div>
                  <span className="stars">★★★★★</span>
                </div>
              </div>
              <div className="testimonial">
                <p>“Professional, easy to use, and truly caring. A great platform for mental health support.”</p>
                <div className="reviewer">
                  <img src="https://i.pravatar.cc/80?img=45" alt="User 3" />
                  <div><strong>Sneha M.</strong><small>Verified User</small></div>
                  <span className="stars">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ & Blog Section */}
        <div id="faqs">
          <FaqBlogSection />
        </div>

        {/* Dynamic Contact Section */}
        <div id="contact">
          <ContactInquirySection />
        </div>

        <section className="section" style={{ paddingTop: '5px' }}>
          <div className="container cta">
            <div>
              <h2>Take the First Step Today</h2>
              <p>Your mental well-being matters. Book a session now and start your journey towards a healthier, happier you.</p>
            </div>
            <button className="btn-solid cursor-pointer" onClick={handleBook}>Book a Session <b>→</b></button>
            <div className="leaf">◜<br />◝</div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-main">
          <div>
            <a href="/" onClick={(e) => handleNav(e, '#home')} className="logo !flex !items-center !gap-2">
              <BrandIcon className="w-6 h-6 text-[#00e5ff]" />
              <span className="font-bold tracking-tight text-xl text-slate-900">{siteName}</span>
            </a>
            <div style={{ fontSize: '10px', color: '#898b9d', marginTop: '5px', fontWeight: '500' }}>
              Empowering Minds. Elevating Lives.
            </div>
          </div>
          <div className="footer-links">
            <a href="#home" onClick={(e) => handleNav(e, '#home')}>Home</a>
            <a href="#psychologists" onClick={(e) => handleNav(e, '#psychologists')}>Find a Psychologist</a>
            <a href="#faqs" onClick={(e) => handleNav(e, '#faqs')}>FAQ & Blog</a>
            <a href="#about" onClick={(e) => handleNav(e, '#about')}>About</a>
            <a href="#contact" onClick={(e) => handleNav(e, '#contact')}>Contact</a>
          </div>
          <div className="social">
            <a href="#">◎</a><a href="#">in</a><a href="#">♥</a><a href="#">▶</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} {siteSettings?.siteCopyright || 'BEHOLD Ltd'}. All rights reserved.</span>
          <div>
            <a href="#" onClick={(e) => handleNav(e, '/privacy')}>Privacy Policy</a>
            <a href="#" onClick={(e) => handleNav(e, '/terms')}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
