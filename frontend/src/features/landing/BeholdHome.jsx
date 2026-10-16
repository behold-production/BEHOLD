import React, { useState, useEffect, useRef, useMemo } from 'react';
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



/* ─── Static Curated Fallback Data ────────────────────────────── */
const DOCTORS_DATA = {
  aarav: {
    id: "aarav",
    name: "Dr. Aarav Mehta",
    role: "Clinical Psychologist",
    title: "Ph.D. Clinical Psychology • 12+ yrs",
    exp: 12,
    langs: "English, Hindi",
    rating: 4.9,
    reviews: 120,
    price: 1500,
    sessions: "1,400+",
    tags: ["Anxiety", "Stress", "CBT", "Corporate Burnout"],
    specs: ["Anxiety", "Stress"],
    about: "Dr. Mehta specialises in Cognitive Behavioural Therapy and somatic grounding, guiding clients through anxiety, panic patterns and major life transitions with personalised protocols.",
    seed: "AM",
    color: "345143",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  ananya: {
    id: "ananya",
    name: "Ananya Iyer",
    role: "Licensed Family Therapist",
    title: "Family & Relationship Lead • 8+ yrs",
    exp: 8,
    langs: "English, Tamil",
    rating: 4.8,
    reviews: 85,
    price: 1200,
    sessions: "950+",
    tags: ["Couples", "Communication", "Family Systems"],
    specs: ["Relationships", "Couples"],
    about: "Ananya creates a calm, neutral space where partners dismantle defensive cycles and rebuild trust through non-violent communication frameworks.",
    seed: "AI",
    color: "ce8e6c",
    avatar: "https://images.unsplash.com/photo-1594824813575-d1e57c6b735d?auto=format&fit=crop&w=300&q=80"
  },
  meera: {
    id: "meera",
    name: "Dr. Meera Nambiar",
    role: "Neuro-Psychiatrist",
    title: "Neuro-Psychiatrist & Lead • 14+ yrs",
    exp: 14,
    langs: "English, Malayalam, Hindi",
    rating: 5.0,
    reviews: 210,
    price: 1800,
    sessions: "2,200+",
    tags: ["Integrative Psychiatry", "Trauma Recovery", "Sleep Care"],
    specs: ["Depression", "Anxiety"],
    about: "Dr. Meera leads integrative neuropsychiatry programmes focused on holistic mental health, sleep restoration and nervous system regulation.",
    seed: "MN",
    color: "6b8e7b",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80"
  },
  rohit: {
    id: "rohit",
    name: "Dr. Rohit Sen",
    role: "Stress & Career Counsellor",
    title: "Executive & Student Coach • 10+ yrs",
    exp: 10,
    langs: "English, Hindi",
    rating: 4.9,
    reviews: 95,
    price: 1400,
    sessions: "1,100+",
    tags: ["Career", "Burnout", "Stress"],
    specs: ["Stress", "Career"],
    about: "Helping professionals and students overcome burnout, imposter syndrome, and corporate anxiety with tailored stress management protocols.",
    seed: "RS",
    color: "ce8e6c",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  }
};

const SERVICES = [
  { id: "individual", name: "Individual Therapy", price: 1500, meta: "50 min • Online / Offline", desc: "One-on-one session for personal growth, anxiety management and recovery." },
  { id: "couples", name: "Couples Therapy", price: 2500, meta: "60 min • Online / Offline", desc: "For partners who want to improve communication and heal dynamics safely." },
  { id: "group", name: "Group Session", price: 800, meta: "90 min • Online / Offline", desc: "A supportive small group guided by an expert clinical lead." }
];

const PROMOS = {
  SAFEPEACE20: { type: "flat", value: 300, label: "SAFEPEACE20 (₹300 off)" },
  FIRSTSESSION: { type: "flat", value: 500, label: "FIRSTSESSION (₹500 off)" },
  BEHOLD10: { type: "pct", value: 10, label: "BEHOLD10 (10% off)" }
};

const SLOT_GROUPS = [
  { label: "Morning", times: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"] },
  { label: "Afternoon", times: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"] },
  { label: "Evening", times: ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"] }
];

/* Helper formatters */
const inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtDate = d => d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
const fmtShort = d => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const nowLabel = () => {
  const d = new Date();
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

function slotsFor(date) {
  const d = date || new Date();
  const seed = d.getDate() * 7 + d.getMonth() * 3;
  return SLOT_GROUPS.map(g => ({
    label: g.label,
    times: g.times.map((t, i) => ({ t, taken: (seed + i * 5) % 9 === 0 }))
  }));
}

function replyFor(text) {
  const t = text.toLowerCase();
  if (/breath|4-7-8|4–7–8/.test(t)) return "Wonderful. Inhale quietly for 4 counts, hold for 7, exhale slowly for 8. Repeat four times and notice your body settling.";
  if (/anxi|panic|nervous|surge|scared/.test(t)) return "I hear you, Priya. Feel your feet on the floor, unclench your jaw and let your shoulders drop. You are safe right now.";
  if (/time|confirm|reschedul|session|when/.test(t)) return "Your session is locked in our calendar. You can review your bookings anytime in the Sessions tab or reschedule if needed.";
  if (/calm|better|helped|thank/.test(t)) return "I'm glad to hear that. Noticing small wins builds lasting resilience. Keep honouring your pace.";
  return "Thank you for sharing that. Naming what you feel without judgement is an important step. Let's explore it more in our next session.";
}

/* Normalizer: converts Behold API counsellor object into mobile app doctor shape */
function normalizeDoctor(c, index = 0) {
  if (!c) return null;
  const id = String(c._id || c.id || `c-${index}`);
  const name = c.name || c.displayName || "Licensed Psychologist";
  const role = c.specialization || c.qualification || "Clinical Psychologist";
  const exp = Number(c.experience) || 5;
  const langs = Array.isArray(c.languages) ? c.languages.join(", ") : (c.languages || "English, Hindi");
  const rating = Number(c.rating) || 4.9;
  const reviews = Number(c.reviewCount || c.reviewsCount) || ((name.length || 5) * 6 + 18);
  const price = Number(c.hourlyRate || c.fee || c.pricing) || 1500;
  const sessions = c.totalSessions ? `${c.totalSessions}+` : `${((exp * 120) + 200).toLocaleString()}+`;

  let tags = [];
  if (Array.isArray(c.tags) && c.tags.length > 0) tags = c.tags;
  else if (Array.isArray(c.specializations) && c.specializations.length > 0) tags = c.specializations;
  else if (typeof c.specialization === "string") tags = [c.specialization];
  else tags = ["Anxiety", "Stress", "Therapy"];

  const specs = tags.slice(0, 2);
  const cleanBio = c.bio 
    ? c.bio.replace(/^(Clinical Expertise and Background\s*)+/gi, "").trim()
    : `${name} is an experienced psychologist providing evidence-based mental healthcare with personalised protocols.`;

  const fallbackAvatars = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1594824813575-d1e57c6b735d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  ];
  const avatar = c.profilePic || c.avatar || fallbackAvatars[index % fallbackAvatars.length];

  return {
    id,
    name,
    role,
    title: `${c.qualification || role} • ${exp}+ yrs`,
    exp,
    langs,
    rating,
    reviews,
    price,
    sessions,
    tags,
    specs,
    about: cleanBio,
    avatar,
    raw: c
  };
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function BeholdHome({ onOpenAuth, onOpenBooking, onBookTherapist, siteSettings }) {
  const navigate = useNavigate();

  // Desktop/Tablet API State
  const [menuOpen, setMenuOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);

  // Mobile Application State (Workflow router)
  const [mobileScreen, setMobileScreen] = useState('home');
  const [historyStack, setHistoryStack] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS_DATA.aarav);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    const tomorrow = new Date(d); tomorrow.setDate(d.getDate() + 1);
    return tomorrow;
  });
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [sessionMode, setSessionMode] = useState('Online Video');
  const [promoCode, setPromoCode] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState({ text: '', type: '' });
  const [payMethod, setPayMethod] = useState('upi');
  const [selectedUpi, setSelectedUpi] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardFields, setCardFields] = useState({ num: '', exp: '', cvv: '' });
  const [cardErr, setCardErr] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [unreadNotifs, setUnreadNotifs] = useState(2);
  const [notifsRead, setNotifsRead] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('behold_dark') === '1'; } catch (e) { return false; }
    }
    return false;
  });
  const [bookings, setBookings] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [mobileSearch, setMobileSearch] = useState('');
  const [mobileFilter, setMobileFilter] = useState('All');
  const [chatKey, setChatKey] = useState('aarav');
  const [chatMessages, setChatMessages] = useState({
    aarav: [
      { from: "in", text: "Hello Priya, how have you been feeling since our last session?", time: "10:15 AM" },
      { from: "out", text: "I've felt lighter, but the anxiety returned slightly last night.", time: "10:18 AM" },
      { from: "in", text: "That's perfectly normal. Try the 4–7–8 breathing we practised whenever you feel the surge.", time: "10:20 AM" }
    ],
    ananya: [
      { from: "in", text: "Hi Priya, let's proceed with the schedule for next week.", time: "Yesterday" }
    ]
  });
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const confettiCanvasRef = useRef(null);
  const chatLogRef = useRef(null);
  const siteName = siteSettings?.siteName || 'BEHOLD';

  /* Initial data loading from Behold API */
  useEffect(() => {
    ApiService.getCounsellors({ limit: 12 })
      .then(r => {
        if (r?.success && Array.isArray(r.data) && r.data.length > 0) {
          setCounsellors(r.data);
        }
      })
      .catch(e => console.warn(e))
      .finally(() => setLoading(false));

    ApiService.getFaqs()
      .then(r => { if (r?.success && Array.isArray(r.data)) setFaqs(r.data.slice(0, 4)); })
      .catch(e => console.warn(e))
      .finally(() => setFaqLoading(false));

    ApiService.getBlogs({ limit: 4 })
      .then(r => { if (r?.success && Array.isArray(r.data)) setBlogs(r.data.slice(0, 4)); })
      .catch(e => console.warn(e))
      .finally(() => setBlogLoading(false));
  }, []);

  /* Map API counsellors into mobileDoctors list with curated fallback */
  const mobileDoctors = useMemo(() => {
    if (counsellors && counsellors.length > 0) {
      return counsellors.map((c, i) => normalizeDoctor(c, i));
    }
    return Object.values(DOCTORS_DATA);
  }, [counsellors]);

  const primaryDoctor = mobileDoctors[0] || DOCTORS_DATA.aarav;

  /* Keep selectedDoctor synced with primaryDoctor when ready */
  useEffect(() => {
    if (mobileDoctors.length > 0 && (!selectedDoctor || !mobileDoctors.some(d => d.id === selectedDoctor.id))) {
      setSelectedDoctor(mobileDoctors[0]);
    }
  }, [mobileDoctors]);

  /* Confetti effect on booking confirmation */
  useEffect(() => {
    if (mobileScreen === 'done' && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current;
      const wrap = canvas.parentElement;
      if (!wrap) return;
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth || 360, h = wrap.clientHeight || 600;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const colors = ["#345143", "#ce8e6c", "#e4b895", "#6b8e7b", "#fdf7f2", "#bd7d5b"];
      const parts = Array.from({ length: 55 }, () => ({
        x: w / 2 + (Math.random() - 0.5) * 80, y: h * 0.28,
        vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 7 - 3,
        s: Math.random() * 6 + 4, c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 6, va: Math.random() * 0.2 + 0.05
      }));
      const start = performance.now();
      let reqId;
      function frame(now) {
        const t = now - start;
        ctx.clearRect(0, 0, w, h);
        parts.forEach(p => {
          p.vy += 0.18; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
          ctx.save(); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 1800) / 1000);
          ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.7); ctx.restore();
        });
        if (t < 2800) reqId = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, w, h);
      }
      reqId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(reqId);
    }
  }, [mobileScreen]);

  /* Scroll chat to end */
  useEffect(() => {
    if (mobileScreen === 'chat' && chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [mobileScreen, chatMessages, isTyping]);

  /* Toast Helper */
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2400);
  };

  /* Navigation in Mobile Workflow */
  const goMobile = (screen, options = {}) => {
    if (!options.replace && mobileScreen !== screen) {
      setHistoryStack(prev => [...prev, mobileScreen]);
    }
    setMobileScreen(screen);
  };

  const backMobile = () => {
    if (historyStack.length > 0) {
      const nextStack = [...historyStack];
      const prevScreen = nextStack.pop();
      setHistoryStack(nextStack);
      setMobileScreen(prevScreen);
    } else {
      setMobileScreen('home');
    }
  };

  /* Select and open a doctor */
  const openDoctor = (doc, andBook = false) => {
    setSelectedDoctor(doc);
    if (andBook) {
      setSelectedService({
        ...SERVICES[0],
        price: doc.price || 1500
      });
      goMobile('b1');
    } else {
      goMobile('profile');
    }
  };

  /* Pricing calculations */
  const computePrice = () => {
    const base = selectedDoctor?.price || selectedService?.price || 1500;
    let discount = 0;
    if (promoCode && PROMOS[promoCode]) {
      const p = PROMOS[promoCode];
      discount = p.type === 'flat' ? Math.min(base, p.value) : Math.round((base * p.value) / 100);
    }
    const total = Math.max(0, base - discount);
    return { base, discount, total };
  };

  /* Promo handlers */
  const handleApplyPromo = (code) => {
    const c = (code || promoInput).trim().toUpperCase();
    if (!c) {
      setPromoMsg({ text: 'Please enter a coupon code', type: 'err' });
      return;
    }
    if (PROMOS[c]) {
      setPromoCode(c);
      setPromoMsg({ text: `Coupon '${c}' applied!`, type: 'ok' });
      showToast(`🎉 ${PROMOS[c].label} applied`);
    } else {
      setPromoCode(null);
      setPromoMsg({ text: 'Invalid promo code. Try SAFEPEACE20', type: 'err' });
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    setPromoInput('');
    setPromoMsg({ text: '', type: '' });
  };

  /* Payment Simulation */
  const handlePay = () => {
    if (payMethod === 'card') {
      const cleanNum = cardFields.num.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setCardErr('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardFields.exp || cardFields.exp.length < 4) {
        setCardErr('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (!cardFields.cvv || cardFields.cvv.length < 3) {
        setCardErr('Please enter valid 3-digit CVV');
        return;
      }
      setCardErr('');
    }

    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      const { total } = computePrice();
      const newBooking = {
        id: "BH-" + Math.floor(100000 + Math.random() * 900000),
        doctor: selectedDoctor?.name || primaryDoctor.name,
        service: selectedService.name,
        when: `${selectedDate ? fmtShort(selectedDate) : 'Tomorrow'} • ${selectedTime}`,
        mode: sessionMode,
        paid: total
      };
      setBookings(prev => [newBooking, ...prev]);
      goMobile('done', { replace: true });
    }, 1200);
  };

  /* Add to Google Calendar */
  const handleAddToCalendar = () => {
    if (!selectedDate) return;
    const [t, ap] = selectedTime.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 50 * 60000);
    const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const docName = selectedDoctor?.name || primaryDoctor.name;
    const url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(`Behold: ${selectedService.name} with ${docName}`) +
      "&dates=" + fmt(start) + "/" + fmt(end) +
      "&details=" + encodeURIComponent(`Mode: ${sessionMode}\nBooking ID: BH-982410`);
    window.open(url, "_blank", "noopener");
    showToast("Opening Google Calendar…");
  };

  /* Send Chat Message */
  const handleSendChat = (text) => {
    const msg = (text || chatInput).trim();
    if (!msg) return;
    const time = nowLabel();
    const activeKey = chatKey;
    setChatMessages(prev => ({
      ...prev,
      [activeKey]: [...(prev[activeKey] || []), { from: "out", text: msg, time }]
    }));
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply = replyFor(msg);
      setChatMessages(prev => ({
        ...prev,
        [activeKey]: [...(prev[activeKey] || []), { from: "in", text: reply, time: nowLabel() }]
      }));
    }, 1100);
  };

  /* Toggle Dark Mode */
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', next);
      try { localStorage.setItem('behold_dark', next ? '1' : '0'); } catch (e) {}
    }
  };

  /* Desktop smooth scroll helper */
  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  /* Desktop booking / auth triggers */
  const book = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
  };

  const auth = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onOpenAuth) onOpenAuth();
    else navigate('/login');
  };

  const goToProfile = (c) => {
    const id = c?._id || c?.id;
    if (id) {
      navigate(`/advisor/${id}`);
    } else {
      navigate('/booking');
    }
  };

  const handleBookCard = (e, c) => {
    e.preventDefault();
    e.stopPropagation();
    const id = c?._id || c?.id;
    if (onBookTherapist && id) {
      onBookTherapist(id);
    } else if (onOpenBooking) {
      onOpenBooking();
    } else {
      navigate('/booking');
    }
  };

  /* Filter Doctors list for mobile */
  const filteredDoctors = mobileDoctors.filter(d => {
    const matchFilter = mobileFilter === 'All' || d.specs.includes(mobileFilter) || d.tags.includes(mobileFilter);
    if (!matchFilter) return false;
    if (!mobileSearch.trim()) return true;
    const q = mobileSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q) || d.tags.join(" ").toLowerCase().includes(q);
  });

  const { base, discount, total } = computePrice();
  const shouldShowTabBar = ['home', 'explore', 'sessions', 'msgs', 'me', 'done'].includes(mobileScreen);

  return (
    <div className={`bh ${dark ? 'dark' : ''}`} id="home">

      {/* ================================================================
          DESKTOP & TABLET LANDING PAGE (Normal Behold Design as Before)
          Active for screen width > 640px
          ================================================================ */}
      <div className="bh-desktop-landing">
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
                    <div style={{ height: '160px' }} className="bh-skel" />
                    <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="bh-skel" style={{ height: '15px', width: '60%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '11px', width: '40%', borderRadius: '6px' }} />
                      <div className="bh-skel" style={{ height: '36px', width: '100%', borderRadius: '6px', margin: '4px 0' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '8px', marginTop: 'auto' }}>
                        <div className="bh-skel" style={{ height: '36px', borderRadius: '10px' }} />
                        <div className="bh-skel" style={{ height: '36px', borderRadius: '10px' }} />
                      </div>
                    </div>
                  </div>
                ))
                : counsellors.length > 0
                  ? counsellors.map(c => {
                    const advisorId = c._id || c.id;
                    const cleanBio = c.bio 
                      ? c.bio.replace(/^(Clinical Expertise and Background\s*)+/gi, '').trim()
                      : `${c.name} is an experienced psychologist providing evidence-based mental healthcare.`;

                    return (
                      <article 
                        key={advisorId} 
                        className="bh-expert-card"
                        onClick={() => goToProfile(c)}
                        title={`Click to view ${c.name}'s profile`}
                      >
                        <div className="bh-expert-photo">
                          {c.profilePic
                            ? <img src={c.profilePic} alt={c.name} loading="lazy" />
                            : <div className="bh-expert-photo-placeholder">{c.name?.charAt(0) || '?'}</div>
                          }
                          <button 
                            className="bh-expert-fav" 
                            aria-label="Favourite"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            ♡
                          </button>
                          <span className="bh-expert-badge">{c.specialization || 'Clinical Psychologist'}</span>
                        </div>

                        <div className="bh-expert-body">
                          <div className="bh-expert-name-row">
                            <h3 className="bh-expert-name">{c.name}</h3>
                          </div>

                          <div className="bh-expert-rating-row">
                            <div className="bh-expert-rating">
                              <span className="bh-expert-star">★</span>
                              <strong>4.9</strong>
                              <span>({(c.name?.length || 5) * 6 + 18})</span>
                            </div>
                            <span className="bh-expert-exp-badge">
                              {c.experience ? `${c.experience}+ yrs` : 'Verified'}
                            </span>
                          </div>

                          <p className="bh-expert-desc" title={cleanBio}>
                            {cleanBio}
                          </p>

                          <div className="bh-expert-meta">
                            <div className="bh-expert-tags">
                              {(c.tags && c.tags.length > 0 ? c.tags : ['Therapy', 'Anxiety']).slice(0, 2).map((t, i) => (
                                <span key={i} className="bh-tag">{t}</span>
                              ))}
                            </div>

                            <div className="bh-expert-actions">
                              <button 
                                type="button"
                                className="bh-expert-view-btn" 
                                onClick={(e) => { e.stopPropagation(); goToProfile(c); }}
                              >
                                View Profile →
                              </button>
                              <button 
                                type="button"
                                className="bh-expert-book-btn" 
                                onClick={(e) => handleBookCard(e, c)}
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
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

      {/* ================================================================
          MOBILE APPLICATION CONTAINER (Screen width <= 640px ONLY)
          Full Sanctuary design system connected to real Behold data
          ================================================================ */}
      <div className="bh-mobile-app-root">

        {/* Global Toast */}
        <div className={`toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">
          {toastMsg}
        </div>

        {/* ── SCREEN 1: HOME ── */}
        {mobileScreen === 'home' && (
          <section className="screen active" aria-label="Home">
            <div className="screen-scroll">
              {/* Home Header */}
              <div className="home-head">
                <button className="home-hello" onClick={() => goMobile('me')} aria-label="Open profile">
                  <img
                    className="avatar"
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Priya&backgroundColor=ce8e6c&textColor=ffffff"
                    alt=""
                  />
                  <div style={{ textAlign: 'left' }}>
                    <small>Warm welcome,</small>
                    <strong id="homeName">Priya</strong>
                  </div>
                </button>
                <button className="icon-btn" onClick={() => goMobile('notif')} aria-label="Notifications" style={{ position: 'relative' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadNotifs > 0 && !notifsRead && (
                    <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta)' }} />
                  )}
                </button>
              </div>

              {/* Daily Affirmation Card */}
              <div className="affirm">
                <span className="tag">Daily Affirmation</span>
                <p>"Breathe in peace, let go of the noise. Just 5 minutes of mindful breathing can reset your nervous system."</p>
              </div>

              {/* Next Appointment Card (Features primary Behold counsellor) */}
              {primaryDoctor && (
                <>
                  <h3 className="section-title">Your Next Appointment</h3>
                  <div className="card">
                    <div className="row" style={{ marginBottom: '12px' }}>
                      <button className="row-start" onClick={() => openDoctor(primaryDoctor)} style={{ textAlign: 'left' }}>
                        <img className="avatar" src={primaryDoctor.avatar} alt={primaryDoctor.name} />
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{primaryDoctor.name}</div>
                          <div className="muted small">{primaryDoctor.role}</div>
                        </div>
                      </button>
                      <span className="tag" style={{ background: 'var(--line)', color: 'var(--ink-2)' }}>Today</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--line)', marginBottom: '12px' }} />
                    <div className="row">
                      <span className="muted small">Session at 10:30 AM</span>
                      <button className="btn-mini" onClick={() => { setSelectedDoctor(primaryDoctor); setChatKey(primaryDoctor.id); goMobile('chat'); }}>Join Session</button>
                    </div>
                  </div>
                </>
              )}

              {/* Wellness Tools 2x2 Grid */}
              <h3 className="section-title">Wellness Tools</h3>
              <div className="tools">
                <button className="tool" onClick={() => goMobile('explore')}>Book Session</button>
                <button className="tool" onClick={() => goMobile('explore')}>Find Therapist</button>
                <button className="tool" onClick={() => showToast('Guided relaxation audio unlocked')}>Resources</button>
                <button className="tool sos" onClick={() => showToast('24/7 Crisis Helpline: 14416 / 1800-599-0019')}>SOS Help</button>
              </div>

              {/* Curated For You (Real Behold Blogs from API) */}
              <h3 className="section-title">Curated For You</h3>
              <div className="curation">
                {blogs && blogs.length > 0 ? (
                  blogs.slice(0, 4).map((b, idx) => (
                    <button key={b._id || idx} className="card" onClick={() => navigate(b.slug ? `/blog/${b.slug}` : '/blog')}>
                      <div className="curation-art" style={{ overflow: 'hidden', background: '#edf3f0' }}>
                        {(b.coverImage || b.image) ? (
                          <img src={b.coverImage || b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>{idx === 0 ? '🌊' : idx === 1 ? '🌿' : '✨'}</span>
                        )}
                      </div>
                      <div className="curation-body">
                        <h4 style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</h4>
                        <span>{b.readTime || '5 min read'} • {b.category || 'Editorial'}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <>
                    <button className="card" onClick={() => navigate('/blog')}>
                      <div className="curation-art" style={{ background: 'linear-gradient(135deg,#dbe8e1,#f1ece2)' }}>🌊</div>
                      <div className="curation-body">
                        <h4>Mindfulness for Anxiety</h4><span>12 min listen • Guided</span>
                      </div>
                    </button>
                    <button className="card" onClick={() => navigate('/blog')}>
                      <div className="curation-art" style={{ background: 'linear-gradient(135deg,#f6e4d6,#edf3f0)' }}>🌿</div>
                      <div className="curation-body">
                        <h4>Overcoming Burnout</h4><span>8 min read • Editorial</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── SCREEN 2: EXPLORE (Find Therapists) ── */}
        {mobileScreen === 'explore' && (
          <section className="screen active" aria-label="Explore therapists">
            <div className="screen-scroll">
              <h1 className="large-title">Explore</h1>

              {/* Search Box */}
              <div className="search-row">
                <label className="search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e9991" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search therapists, specialities…"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    aria-label="Search therapists"
                  />
                  {mobileSearch && (
                    <button type="button" onClick={() => setMobileSearch('')} style={{ color: '#8e9991', background: 'none', border: 'none', cursor: 'pointer' }}>
                      ✕
                    </button>
                  )}
                </label>
              </div>

              {/* Category Filter Chips */}
              <div className="chip-row">
                {['All', 'Anxiety', 'Depression', 'Stress', 'Relationships'].map((filter) => (
                  <button
                    key={filter}
                    className={`chip ${mobileFilter === filter ? 'active' : ''}`}
                    onClick={() => setMobileFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <h3 className="section-title">Available Doctors</h3>
              <div id="doctorList">
                {filteredDoctors.map(d => (
                  <div key={d.id} className="card doc-card" onClick={() => openDoctor(d)}>
                    <div className="doc-top">
                      <img className="avatar" src={d.avatar} alt={d.name} />
                      <div className="meta">
                        <div className="doc-name-row">
                          <span className="doc-name">{d.name}</span>
                          <span className="badge">{d.specs[0]}</span>
                        </div>
                        <div className="doc-role">{d.role}</div>
                        <div className="stars">★ {d.rating} ({d.reviews} reviews)</div>
                      </div>
                    </div>
                    <p className="doc-bio" style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.about}
                    </p>
                    <div className="doc-bottom">
                      <div>
                        <div className="doc-exp">{d.exp} yrs exp • {d.langs}</div>
                        <div className="doc-fee">{inr(d.price)}<small>/hr</small></div>
                      </div>
                      <button
                        className="btn-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDoctor(d, true);
                        }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <p className="empty" style={{ display: 'block', textAlign: 'center', padding: '40px 10px', color: 'var(--muted)' }}>
                    No therapists match your search.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── SCREEN 3: THERAPIST PROFILE ── */}
        {mobileScreen === 'profile' && selectedDoctor && (
          <section className="screen active" aria-label="Therapist profile">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Therapist</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="profile-hero">
                <img className="avatar lg" src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                <h2>{selectedDoctor.name}</h2>
                <p>{selectedDoctor.title}</p>
                <div className="stars" style={{ marginTop: '6px' }}>★ {selectedDoctor.rating} ({selectedDoctor.reviews} reviews)</div>
              </div>

              <div className="stat-grid">
                <div className="stat"><small>Sessions</small><strong>{selectedDoctor.sessions}</strong></div>
                <div className="stat"><small>Consultation</small><strong>{inr(selectedDoctor.price)}/hr</strong></div>
              </div>

              <h3 className="section-title">Specialities</h3>
              <div className="tags">
                {selectedDoctor.tags.map((t, idx) => (
                  <span key={idx} className="tag">{t}</span>
                ))}
              </div>

              <h3 className="section-title">About</h3>
              <p className="muted" style={{ fontSize: '13.5px', lineHeight: 1.6 }}>{selectedDoctor.about}</p>

              <h3 className="section-title">Reviews</h3>
              <div className="card review">
                <b>Amrita S.</b> <span className="stars">★★★★★</span>
                <p>"Helped me understand my patterns of thought clearly. Truly transformative sessions."</p>
              </div>
            </div>

            <div className="cta-dock">
              <div className="price-bar">
                <div><small>Hourly rate</small><strong>{inr(selectedDoctor.price)}</strong></div>
                <button className="btn forest" onClick={() => goMobile('b1')}>Book Session</button>
              </div>
            </div>
          </section>
        )}

        {/* ── SCREEN 4: BOOKING STEP 1 — SERVICE ── */}
        {mobileScreen === 'b1' && selectedDoctor && (
          <section className="screen has-cta active" aria-label="Choose service">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Book Session</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="progress"><span className="on" /><span /><span /><span /></div>
              <span className="step-label">Step 1 of 4</span>

              <div className="card row-start" style={{ marginBottom: '20px' }}>
                <img className="avatar sm" src={selectedDoctor.avatar} alt="" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{selectedDoctor.name}</div>
                  <div className="muted small">{selectedDoctor.role}</div>
                </div>
              </div>

              <h3 className="section-title" style={{ marginTop: 0 }}>Select Service Type</h3>
              <div className="stack">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    className={`card ${selectedService.id === s.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(s)}
                    style={{ textAlign: 'left', width: '100%' }}
                  >
                    <div className="row">
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{s.name}</span>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 600 }}>{inr(s.price)}</span>
                    </div>
                    <div className="small" style={{ color: 'var(--terracotta)', fontWeight: 600, margin: '4px 0 6px' }}>{s.meta}</div>
                    <div className="small muted" style={{ lineHeight: 1.5 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="cta-dock">
              <button className="btn" onClick={() => goMobile('b2')}>Continue</button>
            </div>
          </section>
        )}

        {/* ── SCREEN 5: BOOKING STEP 2 — DATE ── */}
        {mobileScreen === 'b2' && (
          <section className="screen has-cta active" aria-label="Choose date">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Select Date</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="progress"><span className="on" /><span className="on" /><span /><span /></div>
              <span className="step-label">Step 2 of 4</span>

              <div className="card calendar">
                <div className="cal-head">
                  <button
                    className="icon-btn"
                    onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <h3>{calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                  <button
                    className="icon-btn"
                    onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="cal-grid">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(w => (
                    <span key={w} className="wd">{w}</span>
                  ))}
                  {(() => {
                    const today = new Date(); today.setHours(0,0,0,0);
                    const firstDay = (new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay() + 6) % 7;
                    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<span key={`blank-${i}`} />);
                    }
                    for (let day = 1; day <= daysInMonth; day++) {
                      const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                      const isPast = d < today;
                      const isToday = d.getTime() === today.getTime();
                      const isSel = selectedDate && d.getTime() === selectedDate.getTime();
                      cells.push(
                        <button
                          key={day}
                          className={`cal-day ${isSel ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                          disabled={isPast}
                          onClick={() => setSelectedDate(d)}
                        >
                          {day}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            </div>

            <div className="cta-dock">
              <button
                className="btn"
                onClick={() => {
                  if (!selectedDate) { showToast('Please choose a date first'); return; }
                  goMobile('b3');
                }}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* ── SCREEN 6: BOOKING STEP 3 — TIME ── */}
        {mobileScreen === 'b3' && (
          <section className="screen has-cta active" aria-label="Choose time">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Select Time</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="progress"><span className="on" /><span className="on" /><span className="on" /><span /></div>
              <span className="step-label">Step 3 of 4</span>

              <div className="date-badge">Selected: {selectedDate ? fmtDate(selectedDate) : '—'}</div>

              <div className="card" style={{ marginBottom: '18px' }}>
                <div className="small muted" style={{ marginBottom: '8px', fontWeight: 600 }}>Session Mode</div>
                <div className="seg-mini">
                  <button className={sessionMode === 'Online Video' ? 'active' : ''} onClick={() => setSessionMode('Online Video')}>Online Video</button>
                  <button className={sessionMode === 'In-person' ? 'active' : ''} onClick={() => setSessionMode('In-person')}>In-person</button>
                </div>
              </div>

              {slotsFor(selectedDate).map(g => (
                <div key={g.label} className="slot-group">
                  <h4>{g.label}</h4>
                  <div className="slot-grid">
                    {g.times.map(s => (
                      <button
                        key={s.t}
                        className={`slot ${selectedTime === s.t ? 'selected' : ''}`}
                        disabled={s.taken}
                        onClick={() => setSelectedTime(s.t)}
                      >
                        {s.t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="cta-dock">
              <button
                className="btn"
                onClick={() => {
                  if (!selectedTime) { showToast('Please choose a time slot'); return; }
                  goMobile('b4');
                }}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* ── SCREEN 7: BOOKING STEP 4 — CONFIRM & PROMO ── */}
        {mobileScreen === 'b4' && (
          <section className="screen has-cta active" aria-label="Confirm booking">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Confirm Booking</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="progress"><span className="on" /><span className="on" /><span className="on" /><span className="on" /></div>
              <span className="step-label">Step 4 of 4</span>

              <div className="card" style={{ marginBottom: '18px' }}>
                <div className="summary-row"><span>Therapist</span><span>{selectedDoctor.name}</span></div>
                <div className="summary-row"><span>Service</span><span>{selectedService.name}</span></div>
                <div className="summary-row"><span>Schedule</span><span>{selectedDate ? fmtShort(selectedDate) : ''} • {selectedTime}</span></div>
                <div className="summary-row"><span>Mode</span><span>{sessionMode}</span></div>
                <div className="summary-row"><span>Duration</span><span>{selectedService.meta.split(' • ')[0]}</span></div>
              </div>

              <div className="small" style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Have a promo code?</div>
              <div className="promo-quick">
                <button type="button" onClick={() => { setPromoInput('SAFEPEACE20'); handleApplyPromo('SAFEPEACE20'); }}>SAFEPEACE20 · ₹300 off</button>
                <button type="button" onClick={() => { setPromoInput('FIRSTSESSION'); handleApplyPromo('FIRSTSESSION'); }}>FIRSTSESSION · ₹500 off</button>
                <button type="button" onClick={() => { setPromoInput('BEHOLD10'); handleApplyPromo('BEHOLD10'); }}>BEHOLD10 · 10% off</button>
              </div>

              <div className="promo-row">
                <input
                  className="input"
                  placeholder="Enter coupon code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button type="button" className="btn-mini" onClick={() => handleApplyPromo()}>Apply</button>
              </div>

              {promoMsg.text && (
                <div className="small" style={{ minHeight: '16px', marginBottom: '8px', color: promoMsg.type === 'ok' ? '#1b6338' : 'var(--danger)' }}>
                  {promoMsg.text}
                </div>
              )}

              {promoCode && (
                <div className="applied">
                  <span>🎉 {PROMOS[promoCode].label} applied</span>
                  <button type="button" onClick={handleRemovePromo}>Remove</button>
                </div>
              )}

              <div className="price-card">
                <div className="summary-row"><span>Consultation fee</span><span>{inr(base)}</span></div>
                <div className="summary-row discount"><span>Discount</span><span>−{inr(discount)}</span></div>
                <div className="summary-row total"><span>Total due</span><span>{inr(total)}</span></div>
              </div>
            </div>

            <div className="cta-dock">
              <button className="btn" onClick={() => goMobile('pay')}>Proceed to Payment</button>
            </div>
          </section>
        )}

        {/* ── SCREEN 8: PAYMENT ── */}
        {mobileScreen === 'pay' && (
          <section className="screen has-cta active" aria-label="Payment">
            <div className="topbar">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2>Payment</h2>
              <span className="spacer" />
            </div>

            <div className="screen-scroll" style={{ paddingTop: 'calc(var(--safe-top) + 68px)', paddingBottom: 'calc(var(--safe-bottom) + 110px)' }}>
              <div className="card amount-card">
                <small>Total payable amount</small>
                <strong>{inr(total)}</strong>
                <span>Booking ID: BH-982410</span>
              </div>

              <h3 className="section-title" style={{ marginTop: 0 }}>Select Payment Method</h3>

              {/* UPI */}
              <div className={`card pay-opt ${payMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPayMethod('upi')}>
                <div className="pay-head">
                  <span className="radio" />
                  <span className="pay-name">UPI (GPay, PhonePe, Paytm)</span>
                </div>
                {payMethod === 'upi' && (
                  <div className="pay-body">
                    <div className="sub-pills">
                      {['Google Pay', 'PhonePe', 'Paytm'].map(upi => (
                        <button key={upi} type="button" className={selectedUpi === upi ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setSelectedUpi(upi); }}>
                          {upi}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card */}
              <div className={`card pay-opt ${payMethod === 'card' ? 'selected' : ''}`} onClick={() => setPayMethod('card')}>
                <div className="pay-head">
                  <span className="radio" />
                  <span className="pay-name">Credit / Debit Card</span>
                </div>
                {payMethod === 'card' && (
                  <div className="pay-body" onClick={(e) => e.stopPropagation()}>
                    <div className="card-grid">
                      <input
                        className="input full"
                        placeholder="Card number"
                        maxLength={19}
                        value={cardFields.num}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
                          setCardFields(p => ({ ...p, num: v }));
                          setCardErr('');
                        }}
                      />
                      <input
                        className="input"
                        placeholder="MM / YY"
                        maxLength={7}
                        value={cardFields.exp}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                          const formatted = d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d;
                          setCardFields(p => ({ ...p, exp: formatted }));
                          setCardErr('');
                        }}
                      />
                      <input
                        className="input"
                        placeholder="CVV"
                        type="password"
                        maxLength={4}
                        value={cardFields.cvv}
                        onChange={(e) => {
                          setCardFields(p => ({ ...p, cvv: e.target.value.slice(0, 4) }));
                          setCardErr('');
                        }}
                      />
                    </div>
                    {cardErr && <div className="field-error" style={{ marginTop: '6px' }}>{cardErr}</div>}
                  </div>
                )}
              </div>

              {/* Netbanking */}
              <div className={`card pay-opt ${payMethod === 'netbanking' ? 'selected' : ''}`} onClick={() => setPayMethod('netbanking')}>
                <div className="pay-head">
                  <span className="radio" />
                  <span className="pay-name">Net Banking</span>
                </div>
                {payMethod === 'netbanking' && (
                  <div className="pay-body">
                    <div className="sub-pills">
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(b => (
                        <button key={b} type="button" className={selectedBank === b ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setSelectedBank(b); }}>
                          {b.replace(' Bank', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ssl">🔒 256-bit SSL secured payment</div>
            </div>

            <div className="cta-dock">
              <button className={`btn ${isPaying ? 'loading' : ''}`} onClick={handlePay} disabled={isPaying}>
                {isPaying ? <><span className="spinner" /> Securing payment…</> : `Pay ${inr(total)}`}
              </button>
            </div>
          </section>
        )}

        {/* ── SCREEN 9: BOOKING CONFIRMED ── */}
        {mobileScreen === 'done' && (
          <section className="screen active" aria-label="Booking confirmed">
            <div className="screen-scroll confirmed" style={{ paddingBottom: 'calc(var(--safe-bottom) + 96px)' }}>
              <div className="success-ring">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#345143" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your session is locked. A private join link has been sent to your email.</p>

              <div className="card" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <div className="summary-row"><span>Therapist</span><span>{selectedDoctor.name}</span></div>
                <div className="summary-row"><span>Service</span><span>{selectedService.name}</span></div>
                <div className="summary-row"><span>Date &amp; time</span><span>{selectedDate ? fmtShort(selectedDate) : ''} • {selectedTime}</span></div>
                <div className="summary-row"><span>Session</span><span>{sessionMode}</span></div>
                <div className="summary-row"><span>Paid</span><span>{inr(total)}</span></div>
                <div className="summary-row"><span>Booking ID</span><span>BH-982410</span></div>
              </div>

              <button className="btn outline" onClick={handleAddToCalendar} style={{ marginBottom: '12px' }}>
                Add to Google Calendar
              </button>
              <button className="btn forest" onClick={() => showToast('Receipt sent to your registered email')} style={{ marginBottom: '14px' }}>
                View Receipt
              </button>
              <div style={{ textAlign: 'center' }}>
                <button className="link-btn" onClick={() => goMobile('home', { replace: true })}>
                  Back to Home
                </button>
              </div>
            </div>
            <canvas ref={confettiCanvasRef} className="confetti" aria-hidden="true" />
          </section>
        )}

        {/* ── SCREEN 10: SESSIONS ── */}
        {mobileScreen === 'sessions' && (
          <section className="screen active" aria-label="Sessions">
            <div className="screen-scroll">
              <h1 className="large-title">Sessions</h1>
              {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px 18px' }}>
                  <p className="muted" style={{ fontSize: '14px', marginBottom: '14px' }}>No upcoming sessions booked yet.</p>
                  <button className="btn-mini" onClick={() => goMobile('explore')}>Find a therapist</button>
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="card" style={{ marginBottom: '12px' }}>
                    <div className="summary-row"><span>Therapist</span><span>{b.doctor}</span></div>
                    <div className="summary-row"><span>Service</span><span>{b.service}</span></div>
                    <div className="summary-row"><span>When</span><span>{b.when}</span></div>
                    <div className="summary-row"><span>Mode</span><span>{b.mode}</span></div>
                    <div className="summary-row"><span>Paid</span><span>{inr(b.paid)}</span></div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── SCREEN 11: NOTIFICATIONS ── */}
        {mobileScreen === 'notif' && (
          <section className="screen active" aria-label="Notifications">
            <div className="screen-scroll">
              <div className="row" style={{ marginBottom: '6px' }}>
                <h1 className="large-title" style={{ margin: 0 }}>Notifications</h1>
              </div>
              <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                <button
                  className="link-btn"
                  onClick={() => {
                    setNotifsRead(true);
                    setUnreadNotifs(0);
                    showToast('All notifications marked as read');
                  }}
                >
                  Mark all as read
                </button>
              </div>

              <h4 className="notif-group">Today</h4>
              <button
                className={`notif ${!notifsRead ? 'unread' : ''}`}
                onClick={() => { setChatKey('aarav'); goMobile('chat'); }}
              >
                <span className="notif-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#345143" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="notif-body">
                  <h4>Session Reminder {!notifsRead && <span className="dot" />}</h4>
                  <p>Your session with Dr. Aarav Mehta starts in 30 minutes.</p>
                  <small>10:00 AM</small>
                </span>
              </button>

              <button
                className={`notif ${!notifsRead ? 'unread' : ''}`}
                onClick={() => { setChatKey('aarav'); goMobile('chat'); }}
              >
                <span className="notif-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#345143" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="notif-body">
                  <h4>New Message {!notifsRead && <span className="dot" />}</h4>
                  <p>Dr. Aarav Mehta: "Remember the 4–7–8 breathing…"</p>
                  <small>8:45 AM</small>
                </span>
              </button>

              <h4 className="notif-group">Earlier</h4>
              <button className="notif" onClick={() => showToast('Booking confirmed on record')}>
                <span className="notif-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#345143" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="notif-body">
                  <h4>Booking Confirmed</h4>
                  <p>Your session on Wed, Jan 29 has been booked.</p>
                  <small>Yesterday</small>
                </span>
              </button>
            </div>
          </section>
        )}

        {/* ── SCREEN 12: MESSAGES (Conversations List) ── */}
        {mobileScreen === 'msgs' && (
          <section className="screen active" aria-label="Messages">
            <div className="screen-scroll">
              <h1 className="large-title">Messages</h1>
              <div className="search-row">
                <label className="search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e9991" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="search" placeholder="Search conversations…" aria-label="Search conversations" />
                </label>
              </div>

              {mobileDoctors.slice(0, 3).map((doc, idx) => (
                <button key={doc.id} className="card conv" onClick={() => { setSelectedDoctor(doc); setChatKey(doc.id); goMobile('chat'); }}>
                  <span className="conv-av">
                    <img className="avatar" src={doc.avatar} alt={doc.name} />
                    <span className="online" />
                  </span>
                  <span className="conv-main">
                    <span className="conv-top">
                      <h4>{doc.name}</h4><small>{idx === 0 ? '10:30 AM' : 'Yesterday'}</small>
                    </span>
                    <span className="conv-bottom">
                      <p>{idx === 0 ? 'How has your breathing exercise gone?' : 'Looking forward to our next session.'}</p>
                      {idx === 0 && <span className="badge-count">2</span>}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── SCREEN 13: INTERACTIVE CHAT ── */}
        {mobileScreen === 'chat' && (
          <section className="screen chat-screen active" aria-label="Chat">
            <div className="chat-head">
              <button className="icon-btn" onClick={backMobile} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c241e" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <img className="avatar sm" src={selectedDoctor?.avatar || primaryDoctor?.avatar} alt="" />
              <div>
                <h4>{selectedDoctor?.name || primaryDoctor?.name}</h4>
                <span><i className="online-dot" /> Online</span>
              </div>
            </div>

            <div className="chat-log" ref={chatLogRef} aria-live="polite">
              <div className="day-pill">Today</div>
              {(chatMessages[chatKey] || []).map((m, idx) => (
                <div key={idx} className={`msg ${m.from}`}>
                  <span>{m.text}</span>
                  <small>{m.time}</small>
                </div>
              ))}
              {isTyping && (
                <div className="typing">
                  <span /><span /><span />
                </div>
              )}
            </div>

            <div className="chat-foot">
              <div className="suggest">
                <button type="button" onClick={() => handleSendChat('Can we practice the 4-7-8 breathing?')}>🌿 4-7-8 Breathing</button>
                <button type="button" onClick={() => handleSendChat('I felt sudden anxiety yesterday evening')}>💭 Sudden anxiety</button>
                <button type="button" onClick={() => handleSendChat('Can we confirm our session time?')}>📅 Confirm time</button>
                <button type="button" onClick={() => handleSendChat('The mindfulness exercise helped a lot!')}>✨ Feeling calmer</button>
              </div>

              <form className="chat-form" onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}>
                <input
                  className="input"
                  placeholder="Type your message…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  aria-label="Message"
                />
                <button type="submit" className="send" aria-label="Send">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ── SCREEN 14: MY PROFILE ── */}
        {mobileScreen === 'me' && (
          <section className="screen active" aria-label="My profile">
            <div className="screen-scroll">
              <h1 className="large-title">My Profile</h1>
              <div className="me-head">
                <img
                  className="avatar lg"
                  src="https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=ce8e6c&textColor=ffffff"
                  alt=""
                />
                <h3>Priya Sharma</h3>
                <p>priya@behold.co.in</p>
                <button className="link-btn" onClick={() => showToast('Profile editor coming soon')}>Edit Profile</button>
              </div>

              <h3 className="section-title" style={{ marginTop: 0 }}>Account</h3>
              <div className="card menu">
                <button className="menu-item" onClick={() => showToast('Personal information settings')}>
                  <span className="left"><span className="menu-icon">👤</span>Personal Information</span>
                  <span>›</span>
                </button>
                <button className="menu-item" onClick={() => showToast('Password reset link sent')}>
                  <span className="left"><span className="menu-icon">🔒</span>Change Password</span>
                  <span>›</span>
                </button>
                <button className="menu-item" onClick={() => showToast('Saved payment methods')}>
                  <span className="left"><span className="menu-icon">💳</span>Payment Methods</span>
                  <span>›</span>
                </button>
              </div>

              <h3 className="section-title">Preferences</h3>
              <div className="card menu">
                <button className="menu-item" onClick={() => goMobile('notif')}>
                  <span className="left"><span className="menu-icon">🔔</span>Notification Settings</span>
                  <span>›</span>
                </button>
                <button className="menu-item" onClick={() => showToast('Language: English (US)')}>
                  <span className="left"><span className="menu-icon">🌐</span>Language</span>
                  <span>›</span>
                </button>
                <button className="menu-item" onClick={toggleDark} role="switch" aria-checked={dark}>
                  <span className="left"><span className="menu-icon">🌙</span>Relaxing Dark Mode</span>
                  <span className={`switch ${dark ? 'on' : ''}`} />
                </button>
              </div>

              <button
                className="logout"
                onClick={() => {
                  showToast('Logged out securely');
                  setTimeout(() => goMobile('home', { replace: true }), 400);
                }}
              >
                Log Out
              </button>
            </div>
          </section>
        )}

        {/* ── MOBILE BOTTOM NAVIGATION TAB BAR ── */}
        {shouldShowTabBar && (
          <nav className="tabbar" data-tabs aria-label="Bottom Navigation">
            <button
              className={`tab ${mobileScreen === 'home' ? 'active' : ''}`}
              onClick={() => goMobile('home')}
              aria-label="Home"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </button>

            <button
              className={`tab ${mobileScreen === 'explore' ? 'active' : ''}`}
              onClick={() => goMobile('explore')}
              aria-label="Explore"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Explore</span>
            </button>

            <button
              className={`tab ${mobileScreen === 'sessions' ? 'active' : ''}`}
              onClick={() => goMobile('sessions')}
              aria-label="Sessions"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Sessions</span>
            </button>

            <button
              className={`tab ${mobileScreen === 'msgs' ? 'active' : ''}`}
              onClick={() => goMobile('msgs')}
              aria-label="Messages"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Messages</span>
            </button>

            <button
              className={`tab ${mobileScreen === 'me' ? 'active' : ''}`}
              onClick={() => goMobile('me')}
              aria-label="Profile"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>
          </nav>
        )}


      </div>

    </div>
  );
}
