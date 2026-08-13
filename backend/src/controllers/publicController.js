const StorageService = require('../services/storageService');
const EmailService = require('../services/emailService');
const cacheHelper = require('../utils/cacheHelper');

const PublicController = {
  // Submit inquiry
  async submitInquiry(req, res, next) {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const newInquiry = await StorageService.create('inquiries', {
        name,
        email,
        message,
        status: 'PENDING',
        note: ''
      });

      try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'beholdoffice@gmail.com';
        const html = `
          <h2>New Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background:#f9f9f9;border-left:5px solid #ccc;padding:10px;margin:10px 0;">${message}</blockquote>
        `;
        await EmailService.sendEmail(adminEmail, '🔔 New Contact Inquiry - Behold Aspire', html);
      } catch (emailErr) {
        console.error('Failed to send inquiry email:', emailErr);
      }

      res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: newInquiry
      });
    } catch (error) {
      next(error);
    }
  },

  // Get FAQs
  async getFaqs(req, res, next) {
    try {
      const cached = cacheHelper.get('public_faqs');
      if (cached) return res.status(200).json(cached);

      const faqs = await StorageService.findAll('faqs');
      const payload = { success: true, data: faqs };
      cacheHelper.set('public_faqs', payload, 120);
      res.status(200).json(payload);
    } catch (error) {
      next(error);
    }
  },

  // Get Settings (seeds default site settings if empty)
  async getSettings(req, res, next) {
    try {
      const cached = cacheHelper.get('public_settings');
      if (cached) return res.status(200).json(cached);

      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        settings = await StorageService.create('settings', {
          heroTitle: 'Bridging You \nTo Your {True Growth.}',
          heroSub:
            'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
          whatsapp: 'https://wa.me/919497174011',
          contactEmail: 'support@behold.com',
          siteName: 'BEHOLD',
          siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
          showBanner: false,
          bannerNotice:
            '🚨 Maintenance Notice: Schedulers undergoing maintenance tonight between 12:00 AM - 02:00 AM IST.',
          termsOfUse:
            'Welcome to BEHOLD. By accessing or using our platform, you agree to comply with and be bound by the terms and conditions.',
          privacyPolicy:
            'Your privacy is extremely important to us. This policy describes how we collect, protect, and use your personal information.',
          cdatGroupCode: 'cdat@behold',
          enablePsychology: true,
          enableAptitude: true,
          enableOnline: true,
          enableOffline: true,
          enableDoorstep: true,
          gstEnabled: false,
          gstPercent: 0,
          careerBadge: 'Career Mentoring',
          careerTitle: 'Career Clarity & Direction',
          careerSubtitle: 'Feeling Unsure About What’s Next?',
          careerDesc: 'Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.',
          careerBtnText: 'Book Your Mentor',
          counselBadge: 'Psychological Counselling',
          counselTitle: 'Emotional Wellbeing & Support',
          counselSubtitle: 'You Don’t Have to Face It Alone.',
          counselDesc: 'When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.',
          counselBtnText: 'Book Your Therapist',
          aboutTitle: 'What We Offer',
          aboutSub: 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.',
          offer1Title: 'Extended Mentorship',
          offer1Desc: 'We guide students through milestones to turn assessment reports into real achievements.',
          offer2Title: 'Doorstep & Online Counseling',
          offer2Desc: 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.',
          offer3Title: 'Personalized School Programs',
          offer3Desc: 'We conduct orientations and workshops to build healthy learning environments in schools.',
          offer4Title: 'C-DAT & Career Roadmaps',
          offer4Desc: 'We use aptitude evaluations to match university pathways with individual natural talents.',
          offer5Title: 'Goal Tracking',
          offer5Desc: 'We provide continuous reviews to keep students on track with their long-term goals.',
          offer6Title: 'Parent Guidance',
          offer6Desc: 'We guide parents to reduce academic friction and relieve student stress.',
          heroStats: [
            { num: '500+', label: 'Students Guided' },
            { num: '98%', label: 'Clarity & Peace' },
            { num: '50+', label: 'Certified Mentors' }
          ],
          aboutStats: [
            { value: '10+', label: 'Years Experience' },
            { value: '500+', label: 'Students Guided' },
            { value: '50+', label: 'Expert Mentors' },
            { value: '98%', label: 'Success Rate' }
          ]
        });
      }
      const settingsPayload = {
        success: true,
        data: {
          ...settings,
          heroStats: Array.isArray(settings.heroStats) && settings.heroStats.length > 0 ? settings.heroStats : [
            { num: '500+', label: 'Students Guided' },
            { num: '98%', label: 'Clarity & Peace' },
            { num: '50+', label: 'Certified Mentors' }
          ],
          aboutStats: Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0 ? settings.aboutStats : [
            { value: '10+', label: 'Years Experience' },
            { value: '500+', label: 'Students Guided' },
            { value: '50+', label: 'Expert Mentors' },
            { value: '98%', label: 'Success Rate' }
          ],
          enablePsychology: settings.enablePsychology !== false,
          enableCareerMentoring: settings.enableCareerMentoring !== false,
          enableAptitude: settings.enableAptitude !== false,
          enableSampleTest: settings.enableSampleTest !== false,
          enableOnline: settings.enableOnline !== false,
          enableOffline: settings.enableOffline !== false,
          enableDoorstep: settings.enableDoorstep !== false
        }
      };
      cacheHelper.set('public_settings', settingsPayload, 120);
      res.status(200).json(settingsPayload);
    } catch (error) {
      next(error);
    }
  },

  // Save Test Result
  async saveTestResult(req, res, next) {
    try {
      const { userId, studentName, studentEmail, date, dominantDomain, scores } = req.body;
      if (!studentName || !studentEmail || !dominantDomain) {
        return res.status(400).json({ success: false, message: 'Missing required test results fields' });
      }

      const newTestResult = await StorageService.create('testresults', {
        userId: userId || 'guest',
        studentName,
        studentEmail,
        date: date || new Date().toISOString().split('T')[0],
        dominantDomain,
        scores: scores || {}
      });

      res.status(201).json({
        success: true,
        message: 'Test result saved successfully',
        data: newTestResult
      });
    } catch (error) {
      next(error);
    }
  },

  // Get active Aptitude Questions
  async getAptitudeQuestions(req, res, next) {
    try {
      const questions = await StorageService.findAll('aptitudequestions', { isActive: true });
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PublicController;
