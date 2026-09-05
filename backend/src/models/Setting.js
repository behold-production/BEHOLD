const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    heroBgImage: { type: String, default: '' },
    heroEyebrow: { type: String, default: '' },
    heroTitle: { type: String, default: '' },
    heroSub: { type: String, default: '' },
    heroBtnText: { type: String, default: '' },
    whyChooseUsImage: { type: String, default: '' },
    reviewsSectionTitle: { type: String, default: '' },
    reviewsSectionSub: { type: String, default: '' },
    blogSectionTitle: { type: String, default: '' },
    blogSectionSub: { type: String, default: '' },
    faqSectionTitle: { type: String, default: '' },
    faqSectionSub: { type: String, default: '' },
    faqSectionDesc: { type: String, default: '' },
    inquirySectionTitle: { type: String, default: '' },
    inquirySectionSub: { type: String, default: '' },
    inquirySectionDesc: { type: String, default: '' },
    enableReviews: { type: Boolean, default: true },
    enableBlog: { type: Boolean, default: true },
    enableFaq: { type: Boolean, default: true },
    enableInquiry: { type: Boolean, default: true },
    whatsapp: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '9207 07 51 51' },
    openHours: { type: String, default: 'Open Hours: Mon - Sat: 9:00 AM - 9:00 PM (Sun: 9:00 AM - 5:00 PM)' },
    siteName: { type: String, default: '' },
    siteCopyright: { type: String, default: '' },
    showBanner: { type: Boolean, default: false },
    bannerNotice: { type: String, default: '' },
    termsOfUse: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    refundPolicy: { 
      type: String, 
      default: 'BEHOLD Return, Cancellation & Refund Policy:\n\n1. Appointment Cancellations:\n- Clients can request session cancellation up to 24 hours prior to the scheduled session start time for a full 100% refund.\n- Cancellations made less than 24 hours before the scheduled session start time or no-shows are non-refundable.\n\n2. Refund Processing:\n- Approved refunds will be processed back to the original Razorpay payment source within 5-7 business days.\n- In case of technical issues or platform cancellations, full automatic refund will be issued.\n\n3. Rescheduling:\n- Sessions can be rescheduled up to 12 hours before start time free of charge.' 
    },
    consentPolicy: {
      type: String,
      default: 'BEHOLD Informed Consent & Client Agreement for Psychological Counselling & Mentorship:\n\n1. Purpose & Voluntary Participation:\n- Psychological counselling is a collaborative, goal-directed process aimed at facilitating personal growth, emotional wellbeing, and resilience.\n- Participation in all sessions is entirely voluntary. You may ask questions about therapeutic approaches, goals, or techniques at any time.\n\n2. Confidentiality & Privacy:\n- Information shared during sessions is strictly confidential and protected by professional psychological codes of ethics and data protection standards.\n- Exceptions to confidentiality: Confidentiality may be breached only where legally mandated—specifically if there is clear and imminent danger of harm to yourself or others, suspected abuse of children or vulnerable persons, or by formal order of a court of law.\n\n3. Online / Tele-Consultation Guidelines:\n- Tele-counselling sessions are conducted over secure, end-to-end encrypted video channels.\n- Please ensure you are in a private, quiet room with minimal distractions and a stable internet connection.\n- Unauthorized audio or video recording of sessions by either party without explicit written mutual consent is strictly prohibited.\n\n4. Emergency & Crisis Disclaimer:\n- Behold counselling sessions are scheduled professional consultations and are NOT an emergency suicide/crisis intervention service.\n- If you or someone you know is experiencing acute psychiatric distress or an immediate life-threatening emergency, please contact national emergency services (112), KIRAN Mental Health Helpline (1800-599-0019), or Tele-MANAS (14416) immediately.\n\n5. Cancellations & Rescheduling:\n- Cancellations requested 24 hours prior to scheduled start time receive a 100% full refund.\n- Rescheduling is available free of charge up to 12 hours before your appointment.\n\n6. Minor / Guardian Consent:\n- For clients under 18 years of age, parent/guardian acknowledgment and consent is required.'
    },
    cdatGroupCode: { type: String, default: 'cdat@behold' },
    blockedIps: { type: [String], default: [] },
    enablePsychology: { type: Boolean, default: true },
    enableCareerMentoring: { type: Boolean, default: true },
    enableAptitude: { type: Boolean, default: true },
    enableOnline: { type: Boolean, default: true },
    enableOffline: { type: Boolean, default: true },
    enableDoorstep: { type: Boolean, default: true },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 0 },
    counsellorSplitPercent: { type: Number, default: 50 },
    adminBankAccountName: { type: String, default: '' },
    adminBankAccountNumber: { type: String, default: '' },
    adminBankIfscCode: { type: String, default: '' },
    careerBadge: { type: String, default: 'Career Mentoring' },
    careerTitle: { type: String, default: 'Career Clarity & Direction' },
    careerSubtitle: { type: String, default: 'Feeling Unsure About What’s Next?' },
    careerDesc: { type: String, default: 'Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.' },
    careerBtnText: { type: String, default: 'Book Your Mentor' },
    counselBadge: { type: String, default: 'Psychological Counselling' },
    counselTitle: { type: String, default: 'Emotional Wellbeing & Support' },
    counselSubtitle: { type: String, default: 'You Don’t Have to Face It Alone.' },
    counselDesc: { type: String, default: 'When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.' },
    counselBtnText: { type: String, default: 'Book Your Therapist' },
    aboutTitle: { type: String, default: 'What We Offer' },
    aboutSub: { type: String, default: 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.' },
    offer1Title: { type: String, default: 'Extended Mentorship' },
    offer1Desc: { type: String, default: 'We guide students through milestones to turn assessment reports into real achievements.' },
    offer2Title: { type: String, default: 'Doorstep & Online Counseling' },
    offer2Desc: { type: String, default: 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.' },
    offer3Title: { type: String, default: 'Personalized School Programs' },
    offer3Desc: { type: String, default: 'We conduct orientations and workshops to build healthy learning environments in schools.' },
    offer4Title: { type: String, default: 'C-DAT & Career Roadmaps' },
    offer4Desc: { type: String, default: 'We use aptitude evaluations to match university pathways with individual natural talents.' },
    offer5Title: { type: String, default: 'Goal Tracking' },
    offer5Desc: { type: String, default: 'We provide continuous reviews to keep students on track with their long-term goals.' },
    offer6Title: { type: String, default: 'Parent Guidance' },
    offer6Desc: { type: String, default: 'We guide parents to reduce academic friction and relieve student stress.' },
    promoCodes: [
      {
        code: { type: String, required: true },
        type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
        value: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
      }
    ],
    sectionOrder: { 
      type: [String], 
      default: ['counselling-intro', 'whyChooseUs', 'aptitude', 'counsellors', 'about', 'reviews', 'faq', 'blog'] 
    },
    servicesSectionTitle: { type: String, default: 'Book Your Session' },
    servicesSectionSub: { type: String, default: 'OUR MENTORSHIP SERVICES' },
    servicesSectionDesc: { type: String, default: 'Access standard, expert counselling sessions and lifetime career mentoring.' },
    aptitudeSectionTitle: { type: String, default: 'Register your Aptitude Test' },
    aptitudeSectionSub: { type: String, default: 'CDAT APTITUDE ASSESSMENT' },
    aptitudeSectionDesc: { type: String, default: 'Identify your potential with scientific, standardized career assessments.' },
    socialLinks: {
      type: [
        {
          name: { type: String, default: '' },
          url: { type: String, default: '' },
          logo: { type: String, default: '' }
        }
      ],
      default: [
        { name: 'Facebook', url: 'https://facebook.com', logo: '' },
        { name: 'Instagram', url: 'https://instagram.com', logo: '' },
        { name: 'LinkedIn', url: 'https://linkedin.com', logo: '' },
        { name: 'YouTube', url: 'https://youtube.com', logo: '' }
      ]
    },
    heroSlides: {
      type: [
        {
          image: { type: String, default: '' },
          title: { type: String, default: '' },
          subtitle: { type: String, default: '' },
          btn1Text: { type: String, default: '' },
          btn1Link: { type: String, default: '' },
          btn2Text: { type: String, default: '' },
          btn2Link: { type: String, default: '' }
        }
      ],
      default: []
    },
    heroStats: {
      type: [
        {
          num: { type: String, default: '' },
          label: { type: String, default: '' }
        }
      ],
      default: [
        { num: '500+', label: 'Students Guided' },
        { num: '98%', label: 'Clarity & Peace' },
        { num: '50+', label: 'Certified Mentors' }
      ]
    },
    aboutStats: {
      type: [
        {
          value: { type: String, default: '' },
          label: { type: String, default: '' }
        }
      ],
      default: [
        { value: '10+', label: 'Years Experience' },
        { value: '500+', label: 'Students Guided' },
        { value: '50+', label: 'Expert Mentors' },
        { value: '98%', label: 'Success Rate' }
      ]
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('Setting', settingSchema);
