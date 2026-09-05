const StorageService = require('../services/storageService');
const EmailService = require('../services/emailService');
const cacheHelper = require('../utils/cacheHelper');

const PublicController = {
  // Submit inquiry
  async submitInquiry(req, res, next) {
    try {
      const {
        name,
        studentName,
        email,
        message,
        comments,
        phone,
        utmSource,
        utmCampaign,
        fbclid
      } = req.body || {};

      const resolvedName = (name || studentName || '').trim();
      const resolvedEmail = (email || '').trim();
      const resolvedMessage = (message || comments || '').trim();

      if (!resolvedName || !resolvedEmail || !resolvedMessage) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
      }

      const newInquiry = await StorageService.create('inquiries', {
        name: resolvedName,
        email: resolvedEmail,
        message: resolvedMessage,
        phone: phone || '',
        status: 'PENDING',
        note: '',
        utmSource: utmSource || req.query.utm_source || '',
        utmCampaign: utmCampaign || req.query.utm_campaign || '',
        fbclid: fbclid || req.query.fbclid || ''
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
        await EmailService.sendEmail(adminEmail, '🔔 New Contact Inquiry - BEHOLD.', html);
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
      let questions = await StorageService.findAll('aptitudequestions', { isActive: true });
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = [
          {
            id: 'q1',
            category: 'Logical',
            question: "When presented with a complex problem, what is your initial approach?",
            options: [
              { text: "Break it down into sequential logical steps and analyze root causes.", weight: 3 },
              { text: "Look for recurring patterns from previous similar situations.", weight: 2 },
              { text: "Rely on intuitive judgment and brainstorm spontaneous solutions.", weight: 1 }
            ]
          },
          {
            id: 'q2',
            category: 'Aptitude',
            question: "How do you prefer to handle quantitative data and mathematical analysis?",
            options: [
              { text: "I enjoy identifying formulas, comparing statistics, and deductive modeling.", weight: 3 },
              { text: "I can work through numbers when structured with clear instructions.", weight: 2 },
              { text: "I prefer qualitative conceptual thinking over quantitative computation.", weight: 1 }
            ]
          },
          {
            id: 'q3',
            category: 'Emotional',
            question: "How do you respond when a colleague or peer is experiencing emotional distress?",
            options: [
              { text: "I practice active, non-judgmental listening and create a safe space for them.", weight: 3 },
              { text: "I offer practical, actionable steps to help alleviate their challenge.", weight: 2 },
              { text: "I give them personal space and let them process independently.", weight: 1 }
            ]
          },
          {
            id: 'q4',
            category: 'Creativity',
            question: "When designing a project, what kind of ideas excite you the most?",
            options: [
              { text: "Unconventional, lateral ideas that challenge conventional templates.", weight: 3 },
              { text: "Enhancing and refining proven, existing designs with modern aesthetics.", weight: 2 },
              { text: "Standardized, pragmatic solutions that minimize execution risk.", weight: 1 }
            ]
          },
          {
            id: 'q5',
            category: 'Leadership',
            question: "In a team setting where consensus is lacking, what role do you naturally assume?",
            options: [
              { text: "Synthesize differing viewpoints, align on shared goals, and drive milestone decisions.", weight: 3 },
              { text: "Advocate for the most efficient technical strategy.", weight: 2 },
              { text: "Support the consensus once a designated leader establishes direction.", weight: 1 }
            ]
          },
          {
            id: 'q6',
            category: 'Communication',
            question: "How do you explain a complex, technical concept to someone with no background in the topic?",
            options: [
              { text: "Use relatable everyday analogies, simplified language, and check for understanding.", weight: 3 },
              { text: "Provide visual diagrams and stepwise summaries.", weight: 2 },
              { text: "Explain using technical terms first, then clarify if asked.", weight: 1 }
            ]
          },
          {
            id: 'q7',
            category: 'Career',
            question: "What type of professional impact feels most fulfilling to you?",
            options: [
              { text: "Building scalable systems and guiding individuals to achieve long-term growth.", weight: 3 },
              { text: "Mastering deep specialized subject matter expertise.", weight: 2 },
              { text: "Achieving predictable, consistent organizational outcomes.", weight: 1 }
            ]
          },
          {
            id: 'q8',
            category: 'Personality',
            question: "How do you manage your personal daily focus and priority milestones?",
            options: [
              { text: "Set clear intentional focus blocks and evaluate progress objectively.", weight: 3 },
              { text: "Maintain a dynamic to-do list and adapt to urgent tasks.", weight: 2 },
              { text: "Work organically as inspiration arises throughout the day.", weight: 1 }
            ]
          }
        ];
      }
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  },

  // Dynamic Sitemap Generator
  async getSitemap(req, res, next) {
    try {
      const baseUrl = 'https://www.behold.co.in';
      
      const blogs = await StorageService.findAll('blogs', { status: 'published' });
      const rawCounsellors = await StorageService.findAll('counsellors', { isDeleted: { $ne: true } }) || [];
      const counsellors = rawCounsellors.filter(c => c && c.isActive !== false && c.isDeleted !== true && c.status !== 'REJECTED' && c.status !== 'DELETED' && (c.isVerified !== false || c.status === 'APPROVED' || c.status === 'ACTIVE'));
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      const addUrl = (path, priority, freq) => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${path}</loc>\n`;
        xml += `    <changefreq>${freq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
      };

      // Static routes
      addUrl('/', '1.0', 'daily');
      addUrl('/blog', '0.9', 'daily');
      addUrl('/booking', '0.8', 'weekly');
      addUrl('/sample-test', '0.8', 'monthly');
      addUrl('/aptitude', '0.9', 'weekly');
      addUrl('/faqs', '0.7', 'monthly');

      // Dynamic blogs
      for (const blog of blogs) {
        addUrl(`/blog/${blog.slug}`, '0.8', 'weekly');
      }

      // Dynamic counsellors
      for (const counsellor of counsellors) {
        const id = counsellor.id || counsellor._id;
        if (id) {
          addUrl(`/advisor/${id}`, '0.8', 'weekly');
        }
      }

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      next(error);
    }
  },

  // Record Meta / Ads Campaign Event (Browser + Server CAPI)
  async recordCampaignEvent(req, res, next) {
    try {
      const MetaCapiService = require('../services/metaCapiService');
      const CampaignEvent = require('../models/CampaignEvent');

      const {
        eventName,
        eventId,
        eventTime,
        eventData,
        customData,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        fbclid,
        fbp,
        fbc,
        url,
        email,
        phone,
        userId,
        value,
        currency
      } = req.body || {};

      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] || '';

      const resolvedEventName = eventName || 'PageView';
      const resolvedEventId = eventId || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const resolvedCustomData = customData || eventData || {};

      // 1. Dispatch to Meta Conversions API (server-to-server)
      let capiResult = null;
      try {
        const capiResponse = await MetaCapiService.trackServerEvent({
          eventName: resolvedEventName,
          eventId: resolvedEventId,
          eventTime: eventTime || Math.floor(Date.now() / 1000),
          url: url || req.headers.referer || 'https://www.behold.co.in',
          ip,
          userAgent,
          email,
          phone,
          userId,
          fbclid: fbclid || req.query.fbclid,
          fbp,
          fbc,
          value: value || resolvedCustomData.value,
          currency: currency || resolvedCustomData.currency || 'INR',
          customData: resolvedCustomData
        });
        capiResult = capiResponse.result;
      } catch (capiErr) {
        console.warn('[Meta CAPI Dispatch Error]:', capiErr.message);
      }

      // 2. Persist in database
      const campaignDoc = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        eventName: resolvedEventName,
        eventId: resolvedEventId,
        utmSource: utmSource || req.query.utm_source || 'meta_ads',
        utmMedium: utmMedium || req.query.utm_medium || '',
        utmCampaign: utmCampaign || req.query.utm_campaign || '',
        utmContent: utmContent || req.query.utm_content || '',
        utmTerm: utmTerm || req.query.utm_term || '',
        fbclid: fbclid || req.query.fbclid || '',
        fbp: fbp || '',
        fbc: fbc || '',
        url: url || req.headers.referer || '',
        userId: userId || '',
        userEmail: email ? MetaCapiService.hashData(email) : '',
        userPhone: phone ? MetaCapiService.hashPhone(phone) : '',
        value: Number(value || resolvedCustomData.value || 0),
        currency: currency || resolvedCustomData.currency || 'INR',
        ip,
        userAgent,
        customData: resolvedCustomData,
        capiStatus: capiResult?.status || 'SAVED_LOCAL',
        metaResponse: capiResult?.data || capiResult?.error || null
      };

      try {
        await StorageService.create('campaign_events', campaignDoc);
      } catch {
        try {
          await CampaignEvent.create(campaignDoc);
        } catch (e) {
          console.warn('Could not persist CampaignEvent:', e.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Campaign event processed and recorded successfully',
        eventId: resolvedEventId,
        capiStatus: campaignDoc.capiStatus,
        pixelId: MetaCapiService.PIXEL_ID
      });
    } catch (error) {
      console.warn('[recordCampaignEvent error]:', error.message);
      return res.status(200).json({
        success: true,
        message: 'Campaign event processed'
      });
    }
  },

  // Get Campaign & Meta Ads Conversion Statistics
  async getCampaignStats(req, res, next) {
    try {
      let appointments = [];
      let users = [];
      let events = [];

      try { appointments = await StorageService.findAll('appointments', {}) || []; } catch {}
      try { users = await StorageService.findAll('users', {}) || []; } catch {}
      try { events = await StorageService.findAll('campaign_events', {}) || []; } catch {}

      const adBookings = appointments.filter(a => a && (a.utmSource || a.utmCampaign || a.fbclid));
      const adUsers = users.filter(u => u && (u.utmSource || u.utmCampaign || u.fbclid));

      const campaignGroups = {};

      adBookings.forEach(b => {
        const key = b.utmCampaign || b.utmSource || 'direct_meta';
        if (!campaignGroups[key]) {
          campaignGroups[key] = {
            campaign: key,
            source: b.utmSource || 'meta_ads',
            totalBookings: 0,
            confirmedBookings: 0,
            revenue: 0,
            users: 0
          };
        }
        campaignGroups[key].totalBookings += 1;
        if (b.status === 'COMPLETED' || b.paymentStatus === 'PAID') {
          campaignGroups[key].confirmedBookings += 1;
          campaignGroups[key].revenue += Number(b.amountPaid || 0);
        }
      });

      adUsers.forEach(u => {
        const key = u.utmCampaign || u.utmSource || 'direct_meta';
        if (!campaignGroups[key]) {
          campaignGroups[key] = {
            campaign: key,
            source: u.utmSource || 'meta_ads',
            totalBookings: 0,
            confirmedBookings: 0,
            revenue: 0,
            users: 0
          };
        }
        campaignGroups[key].users += 1;
      });

      const totalRevenue = adBookings
        .filter(b => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + Number(b.amountPaid || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          pixelId: '2080399902866260',
          totalEventsLogged: events.length,
          totalAdUsers: adUsers.length,
          totalAdBookings: adBookings.length,
          totalAttributedRevenue: totalRevenue,
          campaigns: Object.values(campaignGroups)
        }
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        data: {
          pixelId: '2080399902866260',
          totalEventsLogged: 0,
          totalAdUsers: 0,
          totalAdBookings: 0,
          totalAttributedRevenue: 0,
          campaigns: []
        }
      });
    }
  }
};

module.exports = PublicController;
