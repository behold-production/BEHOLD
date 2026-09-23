import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import './behold.css';
import BrandIcon from '../../components/common/BrandIcon';

/* ─── Inline FAQ ─────────────────────────────────────────────── */
function InlineFaq({ faqs, loading }) {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();

  const fallback = [
    { question: 'How does BEHOLD\'s therapy work?', answer: 'Therapy at BEHOLD begins with understanding what you are experiencing and what kind of support you need. You are provided with a safe and confidential space to talk openly with a qualified professional, without judgement.' },
    { question: 'What kind of support does BEHOLD provide?', answer: 'BEHOLD provides one-on-one psychological counselling, career mentoring, academic stress support, anxiety & depression therapy, and family counselling — both online and in-person.' },
    { question: 'Who can use BEHOLD\'s services?', answer: 'Anyone 13 and above can use BEHOLD. Students, professionals, parents, or anyone seeking mental wellness support are welcome on our platform.' },
    { question: 'Is my session private and confidential?', answer: 'Absolutely. All sessions are fully confidential. Our psychologists are bound by professional ethics and your data is always protected.' },
  ];

  const items = (!loading && faqs.length > 0) ? faqs : fallback;

  return (
    <div className="bh-faq-col-wrap">
      <div className="bh-faq-col-head">
        <p className="bh-eyebrow">FAQ</p>
        <h2 className="bh-h2">Common <span className="dot">Questions.</span></h2>
        <p className="bh-lead" style={{ marginTop: '12px', fontSize: '15px' }}>
          Everything you need to know about the product and billing.
        </p>
      </div>
      <div className="bh-faq-list">
        {items.map((faq, idx) => (
          <div key={idx} className={`bh-faq-item ${open === idx ? 'open' : ''}`}>
            <div className="bh-faq-q" onClick={() => setOpen(open === idx ? -1 : idx)}>
              <span className="bh-faq-q-text">{faq.question}</span>
              <span className="bh-faq-chevron">+</span>
            </div>
            <div className="bh-faq-ans">
              <p className="bh-faq-ans-text">{faq.answer || faq.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/faqs')}
        style={{ marginTop: '28px', fontSize: '14px', fontWeight: 700, color: '#00b4c8', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        View all FAQs →
      </button>
    </div>
  );
}

/* ─── Inline Blog ────────────────────────────────────────────── */
function InlineBlog({ blogs, loading }) {
  const navigate = useNavigate();

  const fallback = [
    { category: 'Therapy & Mental Wellbeing', title: 'How to Find the Right Psychologist or Therapist: A Complete Guide', slug: null },
    { category: 'Anxiety & Stress', title: 'Anxiety vs Stress: What\'s the Difference and When Should You Seek Help?', slug: null },
    { category: 'Mental Health', title: 'Feeling Tired All Day and Always in a Low Mood — Is It a Sign of Depression?', slug: null },
  ];

  const items = (!loading && blogs.length > 0) ? blogs : fallback;

  return (
    <div>
      <div className="bh-blog-col-head">
        <div>
          <p className="bh-eyebrow">INSIGHTS</p>
          <h2 className="bh-h2">Latest <span className="dot">Insights.</span></h2>
          <p className="bh-lead" style={{ marginTop: '12px', fontSize: '15px' }}>Expert knowledge and guidance from our team.</p>
        </div>
        <button className="bh-blog-explore" onClick={() => navigate('/blog')}>
          Explore Blog →
        </button>
      </div>
      <div className="bh-blog-list">
        {items.map((post, idx) => (
          <div key={idx} className="bh-blog-item" onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}>
            <div className="bh-blog-thumb">
              {(post.coverImage || post.image) ? (
                <img src={post.coverImage || post.image} alt={post.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#edfbfc,#d4f7f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📄</div>
              )}
            </div>
            <div>
              <div className="bh-blog-cat">{post.category || 'Mental Health'}</div>
              <div className="bh-blog-title">{post.title}</div>
              <span className="bh-blog-read">Read Article →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Inline Contact Form ────────────────────────────────────── */
function InlineContact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) { setErr('Please fill all required fields.'); setStatus('error'); return; }
    setStatus('loading'); setErr('');
    try {
      const res = await ApiService.submitInquiry(form);
      if (res?.success) { setStatus('success'); setForm({ name: '', phone: '', email: '', message: '' }); }
      else throw new Error(res?.message || 'Submission failed.');
    } catch (ex) { setErr(ex.message || 'Something went wrong.'); setStatus('error'); }
  };

  if (status === 'success') return (
    <div className="bh-form-success">
      <div className="bh-form-success-icon">✓</div>
      <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Message Sent!</h3>
      <p style={{ color: '#6b7a8d', fontSize: '14px' }}>Thank you! Our team will get back to you shortly.</p>
      <button onClick={() => setStatus('idle')} style={{ color: '#00b4c8', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>
        Send another message
      </button>
    </div>
  );

  return (
    <form onSubmit={submit}>
      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1b2a', marginBottom: '28px' }}>Send us a Message</h3>
      <div className="bh-form-row">
        <div className="bh-form-group">
          <label className="bh-form-label">Full Name *</label>
          <input className="bh-form-input" name="name" value={form.name} onChange={handle} placeholder="John Doe" required />
        </div>
        <div className="bh-form-group">
          <label className="bh-form-label">Phone Number *</label>
          <input className="bh-form-input" name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" required />
        </div>
      </div>
      <div className="bh-form-group">
        <label className="bh-form-label">Email Address</label>
        <input className="bh-form-input" type="email" name="email" value={form.email} onChange={handle} placeholder="john@example.com" />
      </div>
      <div className="bh-form-group">
        <label className="bh-form-label">Your Message *</label>
        <textarea className="bh-form-textarea" name="message" value={form.message} onChange={handle} placeholder="How can we help you today?" required />
      </div>
      {status === 'error' && <div className="bh-form-error">{err}</div>}
      <div className="bh-form-footer">
        <span className="bh-form-note">We respond within 24 hours.</span>
        <button type="submit" className="bh-form-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Send Message →'}
        </button>
      </div>
    </form>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function BeholdHome({ onOpenAuth, onOpenBooking, siteSettings }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);

  const siteName = siteSettings?.siteName || 'BEHOLD';

  useEffect(() => {
    ApiService.getCounsellors({ limit: 4 })
      .then(r => { if (r?.success && Array.isArray(r.data)) setCounsellors(r.data.slice(0, 4)); })
      .catch(e => console.warn(e))
      .finally(() => setLoading(false));

    ApiService.getFaqs()
      .then(r => { if (r?.success && Array.isArray(r.data)) setFaqs(r.data.slice(0, 4)); })
      .catch(e => console.warn(e))
      .finally(() => setFaqLoading(false));

    ApiService.getBlogs({ limit: 3 })
      .then(r => { if (r?.success && Array.isArray(r.data)) setBlogs(r.data.slice(0, 3)); })
      .catch(e => console.warn(e))
      .finally(() => setBlogLoading(false));
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const book = (e) => { e.preventDefault(); if (onOpenBooking) onOpenBooking(); else navigate('/booking'); };
  const auth = (e) => { e.preventDefault(); if (onOpenAuth) onOpenAuth(); else navigate('/login'); };

  return (
    <div className="bh" id="home">

      {/* ═══ NAVBAR ═══ */}
      <header className="bh-nav">
        <div className="bh-wrap bh-nav-inner">
          <a href="/" onClick={e => { e.preventDefault(); scrollTo('home'); }} className="bh-logo">
            <BrandIcon className="bh-logo-icon" />
            {siteName}<span className="bh-logo-dot">.</span>
          </a>

          <nav className="bh-nav-links">
            {[['home','Home'],['experts','Experts'],['services','Services'],['about','About Us'],['faqs','Blog']].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}
                className={`bh-nav-link ${id === 'home' ? 'active' : ''}`}>{label}</a>
            ))}
          </nav>

          <div className="bh-nav-cta">
            <button className="bh-btn bh-btn-cyan" onClick={book} style={{ height: '40px', padding: '0 22px', borderRadius: '10px' }}>
              Book Session
            </button>
            <button className="bh-btn bh-btn-dark" onClick={auth} style={{ height: '40px', padding: '0 22px', borderRadius: '10px' }}>
              Log In
            </button>
          </div>

          <button className="bh-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`bh-mobile-nav ${menuOpen ? 'open' : ''}`}>
          {[['home','Home'],['experts','Experts'],['services','Services'],['about','About Us'],['faqs','Blog']].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}
              className={id === 'home' ? 'active' : ''}>{label}</a>
          ))}
          <div className="bh-mobile-nav-btns">
            <button className="bh-btn bh-btn-cyan" onClick={book}>Book Session</button>
            <button className="bh-btn bh-btn-dark" onClick={auth}>Log In</button>
          </div>
        </div>
      </header>

      <main>

        {/* ═══ HERO ═══ */}
        <section className="bh-hero" id="hero">
          <div className="bh-wrap bh-hero-grid">

            {/* Left */}
            <div>
              <div className="bh-hero-badge">
                <span className="bh-hero-badge-dot" />
                <span>India's Trusted Mental Wellness Platform</span>
              </div>
              <h1 className="bh-hero-title">
                You Deserve<br />
                To <span className="accent">Feel Better</span>
              </h1>
              <p className="bh-hero-sub">
                Book a session with certified psychologists, from the comfort of your home.
                Take the first step towards a happier, healthier you.
              </p>
              <div className="bh-hero-actions">
                <button className="bh-btn bh-btn-cyan" onClick={book}>Book a Session →</button>
                <button className="bh-btn bh-btn-outline" onClick={e => { e.preventDefault(); scrollTo('experts'); }}>
                  Find a Psychologist
                </button>
              </div>
              <div className="bh-hero-stats">
                <div>
                  <div className="bh-hero-stat-num">5,000+</div>
                  <div className="bh-hero-stat-lbl">People Helped</div>
                </div>
                <div className="bh-stat-divider" />
                <div>
                  <div className="bh-hero-stat-num">50+</div>
                  <div className="bh-hero-stat-lbl">Expert Therapists</div>
                </div>
                <div className="bh-stat-divider" />
                <div>
                  <div className="bh-hero-stat-num">4.9★</div>
                  <div className="bh-hero-stat-lbl">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="bh-hero-visual">
              <div className="bh-hero-card-main">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85"
                  alt="Therapist"
                />
                <div className="bh-float-card bh-float-quote">
                  <div className="bh-float-quote-icon">❝</div>
                  <strong>"It's okay to ask for help"</strong>
                  <small>Better mental health brings a brighter tomorrow.</small>
                </div>
                <div className="bh-float-card bh-float-people">
                  <div className="bh-float-people-avatars">
                    <img src="https://i.pravatar.cc/80?img=47" alt="user" />
                    <img src="https://i.pravatar.cc/80?img=12" alt="user" />
                    <img src="https://i.pravatar.cc/80?img=32" alt="user" />
                  </div>
                  <div className="bh-float-people-text">
                    <strong>5,000+</strong>
                    <small>People trusted us</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE STRIP ═══ */}
        <section className="bh-feat-strip" id="services">
          <div className="bh-wrap bh-feat-grid">
            {[
              { icon: '🖥️', title: 'Online & In-Person', desc: 'Choose what\'s comfortable for you' },
              { icon: '🏅', title: 'Verified Experts', desc: 'Licensed and experienced professionals' },
              { icon: '🗓️', title: 'Flexible Timings', desc: 'Book sessions at your convenience' },
              { icon: '🔒', title: '100% Confidential', desc: 'Your privacy is our priority' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bh-feat-item">
                <div className="bh-feat-icon-box">{icon}</div>
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="bh-section bh-hiw" id="how-it-works">
          <div className="bh-wrap">
            <div className="bh-hiw-header">
              <p className="bh-eyebrow">GET STARTED</p>
              <h2 className="bh-h2">How It <span className="dot">Works.</span></h2>
              <p className="bh-lead" style={{ marginTop: '14px', fontSize: '16px' }}>
                Getting support is simple and takes just a few minutes.
              </p>
            </div>
            <div className="bh-hiw-grid">
              <div className="bh-hiw-connector" />
              {[
                { n: '1', title: 'Find a Psychologist', desc: 'Browse profiles, specializations, and reviews to find the right expert for you.' },
                { n: '2', title: 'Book a Session', desc: 'Select a convenient date, time and mode — online or in-person.' },
                { n: '3', title: 'Start Your Journey', desc: 'Join the session and take a meaningful step towards a better, healthier you.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="bh-hiw-step">
                  <div className="bh-hiw-num">{n}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ EXPERTS ═══ */}
        <section className="bh-section bh-experts" id="experts">
          <div className="bh-wrap">
            <div className="bh-experts-top">
              <div className="bh-experts-top-text">
                <p className="bh-eyebrow">MEET OUR EXPERTS</p>
                <h2 className="bh-h2">Find the Right<br />Psychologist for <span className="dot">You.</span></h2>
                <p className="bh-lead" style={{ marginTop: '12px', fontSize: '15px' }}>
                  Our certified professionals are here to support you through life's challenges.
                </p>
              </div>
              <button className="bh-btn-ghost" onClick={() => navigate('/booking')}>
                View All Experts →
              </button>
            </div>

            <div className="bh-experts-grid">
              {loading
                ? [1,2,3,4].map(i => (
                  <div key={i} className="bh-expert-card">
                    <div style={{ height: '200px' }} className="bh-skel" />
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="bh-skel" style={{ height: '16px', width: '65%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '12px', width: '45%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '12px', width: '90%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '12px', width: '80%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '42px', borderRadius: '10px', marginTop: '12px' }} />
                    </div>
                  </div>
                ))
                : counsellors.length > 0
                  ? counsellors.map(c => (
                    <article key={c._id || c.id} className="bh-expert-card">
                      <div className="bh-expert-photo">
                        {c.profilePic
                          ? <img src={c.profilePic} alt={c.name} />
                          : <div className="bh-expert-photo-placeholder">{c.name?.charAt(0) || '?'}</div>
                        }
                        <button className="bh-expert-fav" aria-label="Favourite">♡</button>
                        <span className="bh-expert-badge">{c.specialization || 'Psychologist'}</span>
                      </div>
                      <div className="bh-expert-body">
                        <h3 className="bh-expert-name">{c.name}</h3>
                        <p className="bh-expert-spec">{c.specialization || 'Clinical Psychologist'}</p>
                        {c.bio && <p className="bh-expert-desc">{c.bio}</p>}
                        <div className="bh-expert-meta">
                          {c.experience && (
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                              {c.experience} years experience
                            </p>
                          )}
                          <div className="bh-expert-rating">
                            <span className="bh-expert-star">★</span>
                            <strong>4.9</strong>
                            <span>({(c.name?.length || 5) * 12 + 20} reviews)</span>
                          </div>
                          <div className="bh-expert-tags">
                            {(c.tags || ['Anxiety', 'Stress']).slice(0, 2).map((t, i) => (
                              <span key={i} className="bh-tag">{t}</span>
                            ))}
                          </div>
                          <button className="bh-expert-btn" onClick={book}>Book a Session</button>
                        </div>
                      </div>
                    </article>
                  ))
                  : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '56px', color: '#94a3b8', fontSize: '15px' }}>
                      No experts found at the moment. Please check back soon.
                    </div>
                  )
              }
            </div>
          </div>
        </section>

        {/* ═══ WHY BEHOLD ═══ */}
        <section className="bh-section bh-why" id="about">
          <div className="bh-wrap bh-why-grid">
            <div className="bh-why-left">
              <p className="bh-eyebrow" style={{ color: '#00d4e8' }}>WHY CHOOSE {siteName.toUpperCase()}</p>
              <h2 className="bh-h2" style={{ color: 'white' }}>
                More Than Just<br />A Booking <span className="dot">Platform.</span>
              </h2>
              <p className="bh-why-lead">
                We believe mental health care should be accessible, affordable, and stigma-free.
                Our platform connects you with trusted psychologists who truly care about your well-being.
              </p>
            </div>
            <div className="bh-why-reasons">
              {[
                { icon: '❤️', cls: 'c1', title: 'Trusted & Verified Professionals', desc: 'All our psychologists are licensed and background-checked for your safety.' },
                { icon: '🎓', cls: 'c2', title: 'Wide Range of Specializations', desc: 'From anxiety to career guidance, find the right support for every challenge.' },
                { icon: '💸', cls: 'c3', title: 'Affordable & Transparent Pricing', desc: 'No hidden costs. Quality mental health care within your reach.' },
                { icon: '🤝', cls: 'c4', title: 'A Safe & Supportive Community', desc: 'Resources, workshops and a community that truly understands you.' },
              ].map(({ icon, cls, title, desc }) => (
                <div key={title} className="bh-why-reason">
                  <div className={`bh-why-icon ${cls}`}>{icon}</div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="bh-section bh-testi" id="reviews">
          <div className="bh-wrap">
            <div className="bh-testi-header">
              <p className="bh-eyebrow">REAL STORIES</p>
              <h2 className="bh-h2">What Our Users <span className="dot">Say.</span></h2>
            </div>
            <div className="bh-testi-grid">
              {[
                { quote: `"${siteName} made it so easy to find the right therapist. I finally feel heard and supported."`, name: 'Priya S.', img: 'https://i.pravatar.cc/80?img=49' },
                { quote: '"The sessions have really helped me manage my anxiety. Highly recommend this platform!"', name: 'Arjun K.', img: 'https://i.pravatar.cc/80?img=11' },
                { quote: '"Professional, easy to use, and truly caring. A great platform for mental health support."', name: 'Sneha M.', img: 'https://i.pravatar.cc/80?img=45' },
              ].map(({ quote, name, img }) => (
                <div key={name} className="bh-testi-card">
                  <div className="bh-testi-stars">★★★★★</div>
                  <p className="bh-testi-quote">{quote}</p>
                  <div className="bh-testi-user">
                    <img src={img} alt={name} />
                    <div>
                      <div className="bh-testi-user-name">{name}</div>
                      <div className="bh-testi-user-tag">Verified User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ + BLOG ═══ */}
        <section className="bh-section bh-faq-blog" id="faqs">
          <div className="bh-wrap bh-faq-blog-grid">
            <InlineFaq faqs={faqs} loading={faqLoading} />
            <InlineBlog blogs={blogs} loading={blogLoading} />
          </div>
        </section>

        {/* ═══ CONTACT ═══ */}
        <section className="bh-section bh-contact" id="contact">
          <div className="bh-wrap">
            <div className="bh-contact-card">
              <div className="bh-contact-left">
                <div className="bh-contact-left-title">
                  Get in <span className="dot">Touch.</span>
                </div>
                <p className="bh-contact-left-desc">
                  Have questions about our services, booking process, or anything else? We'd love to hear from you.
                </p>
                <div className="bh-contact-info">
                  {[
                    { icon: '📞', label: 'Call Us', val: '+91 99999 99999' },
                    { icon: '✉️', label: 'Email Us', val: 'hello@behold.co.in' },
                    { icon: '📍', label: 'Location', val: 'Kochi, Kerala, India' },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="bh-contact-info-row">
                      <div className="bh-contact-info-icon">{icon}</div>
                      <div>
                        <div className="bh-contact-info-label">{label}</div>
                        <div className="bh-contact-info-val">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bh-contact-right">
                <InlineContact />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section className="bh-cta-wrap">
          <div className="bh-wrap">
            <div className="bh-cta-banner">
              <div>
                <h2>Take the First Step Today</h2>
                <p>Your mental well-being matters. Start your journey towards a healthier, happier you.</p>
              </div>
              <button className="bh-btn bh-btn-cyan" onClick={book} style={{ flexShrink: 0, height: '52px', padding: '0 36px', fontSize: '15px', borderRadius: '14px' }}>
                Book a Session →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bh-footer">
        <div className="bh-wrap bh-footer-main">
          <div>
            <a href="/" onClick={e => { e.preventDefault(); scrollTo('home'); }} className="bh-footer-logo">
              <BrandIcon style={{ width: '28px', height: '28px', color: '#00d4e8', marginRight: '8px' }} />
              {siteName}<span style={{ color: '#00d4e8' }}>.</span>
            </a>
            <p className="bh-footer-tagline">Empowering Minds. Elevating Lives.</p>
          </div>
          <div className="bh-footer-col">
            <h4>Platform</h4>
            <a href="#home" onClick={e => { e.preventDefault(); scrollTo('home'); }}>Home</a>
            <a href="#experts" onClick={e => { e.preventDefault(); scrollTo('experts'); }}>Find a Psychologist</a>
            <a href="#how-it-works" onClick={e => { e.preventDefault(); scrollTo('how-it-works'); }}>How it Works</a>
            <a href="#faqs" onClick={e => { e.preventDefault(); scrollTo('faqs'); }}>FAQ &amp; Blog</a>
          </div>
          <div className="bh-footer-col">
            <h4>Company</h4>
            <a href="#about" onClick={e => { e.preventDefault(); scrollTo('about'); }}>About Us</a>
            <a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
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
        <div className="bh-wrap bh-footer-bottom">
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
