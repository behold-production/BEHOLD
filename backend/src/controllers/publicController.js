const StorageService = require('../services/storageService');

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

      res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: newInquiry
      });
    } catch (error) {
      next(error);
    }
  },

  // Get FAQs (seeds default ones if empty)
  async getFaqs(req, res, next) {
    try {
      let faqs = await StorageService.findAll('faqs');
      if (faqs.length === 0) {
        const defaultFaqs = [
          { question: "What is CDAT and who should take it?", answer: "CDAT (Cognitive Domain Aptitude Test) is an assessment designed for students between grades 8-12 to align their cognitive strengths with specific stream preferences." },
          { question: "How can I book an appointment with a counsellor?", answer: "Sign in to your student dashboard, navigate to services, choose your preferred counsellor and schedule from their available slots." },
          { question: "Can I cancel a scheduled appointment?", answer: "Yes, you can cancel appointments up to 2 hours before the scheduled session directly from your student profile drawer." }
        ];
        for (const item of defaultFaqs) {
          await StorageService.create('faqs', item);
        }
        faqs = await StorageService.findAll('faqs');
      }
      res.status(200).json({
        success: true,
        data: faqs
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Settings (seeds default site settings if empty)
  async getSettings(req, res, next) {
    try {
      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        settings = await StorageService.create('settings', {
          heroTitle: 'Bridging You \nTo Your {True Growth.}',
          heroSub: 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
          whatsapp: 'https://wa.me/919497174011',
          contactEmail: 'support@behold.com',
          siteName: 'BEHOLD',
          siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
          showBanner: false,
          bannerNotice: '🚨 Maintenance Notice: Schedulers undergoing maintenance tonight between 12:00 AM - 02:00 AM IST.',
          termsOfUse: 'Welcome to BEHOLD. By accessing or using our platform, you agree to comply with and be bound by the terms and conditions.',
          privacyPolicy: 'Your privacy is extremely important to us. This policy describes how we collect, protect, and use your personal information.'
        });
      }
      res.status(200).json({
        success: true,
        data: settings
      });
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
  }
};

module.exports = PublicController;
