const bcrypt = require('bcryptjs');
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

const modelMap = {
  users: User,
  counsellors: Counsellor,
  admins: Admin,
  appointments: Appointment,
  sessions: Session,
  feedbacks: Feedback,
  notifications: Notification,
  inquiries: Inquiry,
  faqs: Faq,
  settings: Setting,
  testresults: TestResult,
  roles: Role,
  aptitudequestions: AptitudeQuestion
};

function getModel(table) {
  const model = modelMap[table];
  if (!model) {
    throw new Error(`Unknown database table/model: ${table}`);
  }
  return model;
}

async function seedDefaultAdmin() {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@behold.com';
      const rawPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(rawPassword, salt);

      const defaultAdmin = new Admin({
        id: 'admin_' + Date.now(),
        name: 'System Admin',
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log(`[Storage] Seeded default admin: ${email}`);
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
    const record = await Model.findOne({ id }).lean();
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
    return await Model.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
  },

  // Delete record
  async delete(table, id) {
    const Model = getModel(table);
    const result = await Model.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // Seed Admin utility
  seedDefaultAdmin
};

module.exports = StorageService;
