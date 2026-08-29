const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const Admin = require('../models/Admin');
const Appointment = require('../models/Appointment');
const Session = require('../models/Session');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Inquiry = require('../models/Inquiry');
const Faq = require('../models/Faq');
const Setting = require('../models/Setting');
const TestResult = require('../models/TestResult');
const Role = require('../models/Role');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const Otp = require('../models/Otp');
const Blog = require('../models/Blog');
const CampaignEvent = require('../models/CampaignEvent');

const Review = require('../models/Review');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const WhatsAppMessage = require('../models/WhatsAppMessage');

const modelMap = {
  users: User,
  user: User,
  counsellors: Counsellor,
  counsellor: Counsellor,
  admins: Admin,
  admin: Admin,
  appointments: Appointment,
  appointment: Appointment,
  sessions: Session,
  session: Session,
  feedbacks: Feedback,
  feedback: Feedback,
  notifications: Notification,
  notification: Notification,
  inquiries: Inquiry,
  inquiry: Inquiry,
  faqs: Faq,
  faq: Faq,
  settings: Setting,
  setting: Setting,
  testresults: TestResult,
  testresult: TestResult,
  test_results: TestResult,
  roles: Role,
  role: Role,
  aptitudequestions: AptitudeQuestion,
  aptitudequestion: AptitudeQuestion,
  aptitude_questions: AptitudeQuestion,
  otps: Otp,
  otp: Otp,
  passwordresetotps: PasswordResetOtp,
  passwordresetotp: PasswordResetOtp,
  password_reset_otps: PasswordResetOtp,
  blogs: Blog,
  blog: Blog,
  campaignevents: CampaignEvent,
  campaignevent: CampaignEvent,
  campaign_events: CampaignEvent,
  reviews: Review,
  review: Review,
  whatsappmessages: WhatsAppMessage,
  whatsappmessage: WhatsAppMessage,
  whatsapp_messages: WhatsAppMessage
};

function getRecordFilter(id) {
  const filters = [{ id }];

  // Some older records only have MongoDB's `_id`; accept it alongside the
  // application-level ID so they remain manageable.
  if (mongoose.isValidObjectId(id)) {
    filters.push({ _id: id });
  }

  return filters.length === 1 ? filters[0] : { $or: filters };
}

function getModel(table) {
  if (!table || typeof table !== 'string') {
    throw new Error(`Invalid database table name provided: ${table}`);
  }
  const key = table.toLowerCase().replace(/[^a-z]/g, '');
  const model = modelMap[key];
  if (!model) {
    throw new Error(`Unknown database table/model: ${table}`);
  }
  return model;
}

async function seedDefaultAdmin() {
  try {
    const adminEmails = [
      (process.env.DEFAULT_ADMIN_EMAIL || 'beholdoffice@gmail.com').toLowerCase().trim(),
      'beholdoffice@gmail.com',
      'admin@behold.co.in'
    ];
    const uniqueEmails = [...new Set(adminEmails)];
    const rawPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(rawPassword, salt);

    for (const email of uniqueEmails) {
      let existingAdmin = await Admin.findOne({ email });
      if (!existingAdmin) {
        existingAdmin = new Admin({
          id: 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: 'System Admin',
          email: email,
          password: hashedPassword,
          role: 'admin'
        });
        await existingAdmin.save();
        console.log(`[Storage] Created admin account: ${email}`);
      } else {
        const isMatch = bcrypt.compareSync(rawPassword, existingAdmin.password);
        if (!isMatch) {
          existingAdmin.password = hashedPassword;
          await existingAdmin.save();
          console.log(`[Storage] Reset password for admin account: ${email}`);
        }
      }
    }
  } catch (error) {
    console.error('[Storage] Error seeding default admin:', error);
  }
}

const StorageService = {
  // Find all records
  async findAll(table, filter = {}) {
    const Model = getModel(table);
    return await Model.find(filter).lean();
  },

  // Find record by custom ID
  async findById(table, id) {
    const Model = getModel(table);
    const record = await Model.findOne(getRecordFilter(id)).lean();
    return record || null;
  },

  // Find single record matching filter
  async findOne(table, filter = {}) {
    const Model = getModel(table);
    const record = await Model.findOne(filter).lean();
    return record || null;
  },

  // Create new record
  async create(table, item) {
    const Model = getModel(table);
    const id = `${table.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newItem = new Model({
      id,
      ...item
    });
    const saved = await newItem.save();
    return saved.toObject();
  },

  // Update existing record
  async update(table, id, updates) {
    const Model = getModel(table);
    return await Model.findOneAndUpdate(getRecordFilter(id), { $set: updates }, { new: true }).lean();
  },

  // Delete record
  async delete(table, id) {
    const Model = getModel(table);
    const result = await Model.deleteOne(getRecordFilter(id));
    return result.deletedCount > 0;
  },

  // Seed Admin utility
  seedDefaultAdmin
};

module.exports = StorageService;
