const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('behold_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { success: false, message: 'Invalid response format from server' };
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! Status: ${response.status}`);
  }

  return data;
}

const ApiService = {
  // Authentication
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data && res.data.accessToken) {
      localStorage.setItem('behold_token', res.data.accessToken);
      localStorage.setItem('behold_refresh_token', res.data.refreshToken);
      localStorage.setItem('behold_auth_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async register(name, email, password, role = 'user') {
    const endpoint = role === 'counsellor' ? '/auth/register-counsellor' : '/auth/register';
    const res = await request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (res.success && res.data && res.data.accessToken) {
      localStorage.setItem('behold_token', res.data.accessToken);
      localStorage.setItem('behold_refresh_token', res.data.refreshToken);
      // Log in automatically if registration succeeded
      localStorage.setItem('behold_auth_user', JSON.stringify(res.data.user || res.data.counsellor));
    }
    return res;
  },

  logout() {
    localStorage.removeItem('behold_token');
    localStorage.removeItem('behold_refresh_token');
    localStorage.removeItem('behold_auth_user');
  },

  // User/Student Profile
  async getProfile() {
    return await request('/users/profile');
  },

  async updateProfile(profileData) {
    const res = await request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (res.success && res.data) {
      localStorage.setItem('behold_student_profile', JSON.stringify(res.data));
    }
    return res;
  },

  // Counsellor search & details
  async getCounsellors(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const qs = params.toString();
    return await request(`/users/counsellors${qs ? `?${qs}` : ''}`);
  },

  async getCounsellorDetails(id) {
    return await request(`/users/counsellors/${id}`);
  },

  // Appointments
  async bookAppointment(counsellorId, date, time, mode, service = 'counselling') {
    return await request('/appointments', {
      method: 'POST',
      body: JSON.stringify({ counsellorId, date, time, mode, service })
    });
  },

  async getAppointments() {
    return await request('/appointments');
  },

  async cancelAppointment(id) {
    return await request(`/appointments/${id}/cancel`, {
      method: 'PUT'
    });
  },

  async approveAppointment(id) {
    return await request(`/appointments/${id}/approve`, {
      method: 'PUT'
    });
  },

  async rejectAppointment(id, reason = '') {
    return await request(`/appointments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  async completeAppointment(id) {
    return await request(`/appointments/${id}/complete`, {
      method: 'PUT'
    });
  },

  async rescheduleAppointment(id, date, time) {
    return await request(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date, time })
    });
  },

  // Sessions
  async getSessions() {
    return await request('/sessions');
  },

  async getSession(id) {
    return await request(`/sessions/${id}`);
  },

  async updateSession(id, data) {
    return await request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async addMeetingLink(id, meetLink) {
    return await request(`/sessions/${id}/meet-link`, {
      method: 'PUT',
      body: JSON.stringify({ meetLink })
    });
  },

  // Feedback
  async submitFeedback(sessionId, rating, comment) {
    return await request('/feedbacks', {
      method: 'POST',
      body: JSON.stringify({ sessionId, rating, comment })
    });
  },

  // Notifications
  async getNotifications() {
    return await request('/notifications');
  },

  async markNotificationRead(id) {
    return await request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  async markAllNotificationsRead() {
    return await request('/notifications/read-all', {
      method: 'PUT'
    });
  },

  // Dashboards
  async getUserDashboard() {
    return await request('/users/dashboard');
  },

  async getCounsellorDashboard() {
    return await request('/counsellors/dashboard');
  },

  async getAdminDashboard() {
    return await request('/admin/dashboard');
  },

  // Admin CRUD operations
  async getAdminUsers() {
    return await request('/admin/users');
  },

  async createAdminUser(name, email, password, role = 'user', permissions = [], customRoleTitle = '') {
    return await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, permissions, customRoleTitle })
    });
  },

  async updateAdminUser(id, name, email, password, role, permissions, customRoleTitle, status) {
    return await request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email, password, role, permissions, customRoleTitle, status })
    });
  },

  async deleteAdminUser(id) {
    return await request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminCounsellors() {
    return await request('/admin/counsellors');
  },

  async createAdminCounsellor(data) {
    return await request('/admin/counsellors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminCounsellor(id, data) {
    return await request(`/admin/counsellors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminCounsellor(id) {
    return await request(`/admin/counsellors/${id}`, {
      method: 'DELETE'
    });
  },

  async verifyCounsellor(id, isVerified) {
    return await request(`/admin/counsellors/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified })
    });
  },

  async getAdminAppointments() {
    return await request('/admin/appointments');
  },

  async createAdminAppointment(data) {
    return await request('/admin/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminAppointment(id, data) {
    return await request(`/admin/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminAppointment(id) {
    return await request(`/admin/appointments/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminFeedbacks() {
    return await request('/admin/feedbacks');
  },

  async moderateFeedback(id, isModerated) {
    return await request(`/admin/feedbacks/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ isModerated })
    });
  },

  async sendSystemNotification(data) {
    return await request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Availability & Counsellor details
  async getCounsellorProfile() {
    return await request('/counsellors/profile');
  },

  async updateAppointmentMeetLink(id, meetLink) {
    return await request(`/appointments/${id}/meet-link`, {
      method: 'PUT',
      body: JSON.stringify({ meetLink })
    });
  },

  async updateAppointmentFeedback(id, feedback) {
    return await request(`/appointments/${id}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedback })
    });
  },

  async updateAvailability(availability) {
    return await request('/counsellors/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability })
    });
  },

  async updateCounsellorProfile(profileData) {
    return await request('/counsellors/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Inquiries
  async submitInquiry(name, email, message) {
    return await request('/inquiries', {
      method: 'POST',
      body: JSON.stringify({ name, email, message })
    });
  },

  // FAQs
  async getFaqs() {
    return await request('/faqs');
  },

  // Settings
  async getSettings() {
    return await request('/settings');
  },

  // Test Results
  async saveTestResult(testResultData) {
    return await request('/test-results', {
      method: 'POST',
      body: JSON.stringify(testResultData)
    });
  },

  async getTestResults() {
    return await request('/admin/test-results');
  },

  async deleteTestResult(id) {
    return await request(`/admin/test-results/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin Inquiry Management
  async getAdminInquiries() {
    return await request('/admin/inquiries');
  },

  async resolveInquiry(id) {
    return await request(`/admin/inquiries/${id}/resolve`, {
      method: 'PUT'
    });
  },

  async saveInquiryNote(id, note) {
    return await request(`/admin/inquiries/${id}/note`, {
      method: 'PUT',
      body: JSON.stringify({ note })
    });
  },

  async deleteInquiry(id) {
    return await request(`/admin/inquiries/${id}`, {
      method: 'DELETE'
    });
  },

  async clearResolvedInquiries() {
    return await request('/admin/inquiries/clear-resolved', {
      method: 'POST'
    });
  },

  // Admin FAQ Management
  async getAdminFaqs() {
    return await request('/admin/faqs');
  },

  async createFaq(question, answer) {
    return await request('/admin/faqs', {
      method: 'POST',
      body: JSON.stringify({ question, answer })
    });
  },

  async updateFaq(id, question, answer) {
    return await request(`/admin/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ question, answer })
    });
  },

  async deleteFaq(id) {
    return await request(`/admin/faqs/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin Settings Management
  async getAdminSettings() {
    return await request('/admin/settings');
  },

  async updateAdminSettings(settings) {
    return await request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Admin Roles Management
  async getRoles() {
    return await request('/admin/roles');
  },

  async createRole(name, permissions) {
    return await request('/admin/roles', {
      method: 'POST',
      body: JSON.stringify({ name, permissions })
    });
  },

  async deleteRole(id) {
    return await request(`/admin/roles/${id}`, {
      method: 'DELETE'
    });
  },

  // Public Aptitude Questions
  async getPublicAptitudeQuestions() {
    return await request('/public/aptitude-questions');
  },

  // Admin Aptitude Questions Management
  async getAdminAptitudeQuestions() {
    return await request('/admin/aptitude-questions');
  },

  async createAptitudeQuestion(questionData) {
    return await request('/admin/aptitude-questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  },

  async updateAptitudeQuestion(id, questionData) {
    return await request(`/admin/aptitude-questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  },

  async deleteAptitudeQuestion(id) {
    return await request(`/admin/aptitude-questions/${id}`, {
      method: 'DELETE'
    });
  }
};

export default ApiService;
