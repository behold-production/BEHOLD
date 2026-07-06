const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    heroTitle: { type: String, default: '' },
    heroSub: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    siteName: { type: String, default: '' },
    siteCopyright: { type: String, default: '' },
    showBanner: { type: Boolean, default: false },
    bannerNotice: { type: String, default: '' },
    termsOfUse: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
