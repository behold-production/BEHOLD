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
          privacyPolicy: 'Your privacy is extremely important to us. This policy describes how we collect, protect, and use your personal information.',
          cdatGroupCode: 'cdat@behold'
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
  },

  // Get active Aptitude Questions (seeds defaults if empty)
  async getAptitudeQuestions(req, res, next) {
    try {
      let questions = await StorageService.findAll('aptitudequestions', { isActive: true });
      if (questions.length === 0) {
        const defaultQuestions = [
          {
            question: "How do you prefer to solve a complex puzzle?",
            category: "Logical",
            options: [
              { text: "Analyzing patterns and breaking them down systematically", weight: 5 },
              { text: "Visualizing the completed picture in my mind's eye", weight: 3 },
              { text: "Talking it through with someone else to generate ideas", weight: 2 },
              { text: "Trial and error until the pieces fit together", weight: 1 }
            ]
          },
          {
            question: "Which of these activities sounds most exciting to you?",
            category: "Career",
            options: [
              { text: "Coding a logic-based math game or grid puzzle", weight: 5 },
              { text: "Writing a persuasive short story, essay, or poem", weight: 4 },
              { text: "Designing an architectural or interior floor plan", weight: 3 },
              { text: "Leading a lively group debate on social issues", weight: 2 }
            ]
          },
          {
            question: "When learning something new, you prefer:",
            category: "Personality",
            options: [
              { text: "Reflecting in private on how it applies to your personal goals", weight: 5 },
              { text: "Drawing visual diagrams, color-coded mindmaps, or charts", weight: 4 },
              { text: "Following a structured, step-by-step programming manual", weight: 3 },
              { text: "Practicing the skill immediately in a collaborative group", weight: 2 }
            ]
          }
        ];
        for (const q of defaultQuestions) {
          await StorageService.create('aptitudequestions', { ...q, isActive: true });
        }
        questions = await StorageService.findAll('aptitudequestions', { isActive: true });
      }
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PublicController;
