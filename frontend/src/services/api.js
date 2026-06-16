import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('behold_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err) {
    const errorMsg = 'Network error occurred. Please verify your connection.';
    toast.error(errorMsg, { id: 'network-error' });
    throw new Error(errorMsg);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { success: false, message: 'Invalid response format from server' };
  }

  // Handle expired/missing token transparently
  if (response.status === 401) {
    if (data.message === 'Access Denied: No Token Provided') {
      localStorage.removeItem('behold_token');
      localStorage.removeItem('behold_refresh_token');
      localStorage.removeItem('behold_auth_user');
      window.dispatchEvent(new Event('storage'));
      if (window.spaNavigate) window.spaNavigate('/');
      throw new Error('Access Denied: No Token Provided');
    }

    if (data.message === 'Access Token Expired') {
      const refreshToken = localStorage.getItem('behold_refresh_token');
      if (!refreshToken) {
        // Clear token, user must login
        localStorage.removeItem('behold_token');
        localStorage.removeItem('behold_refresh_token');
        localStorage.removeItem('behold_auth_user');
        window.dispatchEvent(new Event('storage'));
        if (window.spaNavigate) window.spaNavigate('/');
        toast.error('Session expired. Please log in again.', { id: 'session-expired' });
        throw new Error('Session expired. Please log in again.');
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          const refreshResult = await refreshResponse.json();
          if (refreshResult.success && refreshResult.data && refreshResult.data.accessToken) {
            localStorage.setItem('behold_token', refreshResult.data.accessToken);
            if (refreshResult.data.refreshToken) {
              localStorage.setItem('behold_refresh_token', refreshResult.data.refreshToken);
            }
            isRefreshing = false;
            onRefreshed(refreshResult.data.accessToken);
          } else {
            isRefreshing = false;
            localStorage.removeItem('behold_token');
            localStorage.removeItem('behold_refresh_token');
            localStorage.removeItem('behold_auth_user');
            window.dispatchEvent(new Event('storage'));
            if (window.spaNavigate) window.spaNavigate('/');
            toast.error('Session expired. Please log in again.', { id: 'session-expired' });
            throw new Error('Session expired. Please log in again.');
          }
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem('behold_token');
          localStorage.removeItem('behold_refresh_token');
          localStorage.removeItem('behold_auth_user');
          window.dispatchEvent(new Event('storage'));
          if (window.spaNavigate) window.spaNavigate('/');
          toast.error('Session expired. Please log in again.', { id: 'session-expired' });
          throw err;
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`
          };
          request(endpoint, { ...options, headers: retryHeaders }).then(resolve).catch(reject);
        });
      });
    }
  }

  if (!response.ok) {
    let errorMsg = data.message || `HTTP error! Status: ${response.status}`;

    // Map raw/system database timeout and network errors to user-friendly messages
    if (
      typeof errorMsg === 'string' && (
        errorMsg.includes('buffering timed out') ||
        errorMsg.includes('MongooseServerSelectionError') ||
        errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('ENOTFOUND') ||
        errorMsg.includes('connection timed out')
      )
    ) {
      errorMsg = 'Database connection error. Please try again later.';
    } else if (response.status === 502 || response.status === 504) {
      errorMsg = 'Server is temporarily unavailable. Please try again later.';
    }

    // Only toast if it's not a background validation that's handled gracefully
    if (!options.silent) {
      toast.error(errorMsg, { id: endpoint });
    }
    throw new Error(errorMsg);
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
      window.dispatchEvent(new Event('storage'));
    }
    return res;
  },

  async register(name, email, password, role = 'user', extra = {}) {
    const endpoint = role === 'counsellor' ? '/auth/register-counsellor' : '/auth/register';
    const res = await request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, ...extra })
    });
    if (res.success && res.data && res.data.accessToken) {
      localStorage.setItem('behold_token', res.data.accessToken);
      localStorage.setItem('behold_refresh_token', res.data.refreshToken);
      // Log in automatically if registration succeeded
      localStorage.setItem('behold_auth_user', JSON.stringify(res.data.user || res.data.counsellor));
      window.dispatchEvent(new Event('storage'));
    }
    return res;
  },

  logout() {
    localStorage.removeItem('behold_token');
    localStorage.removeItem('behold_refresh_token');
    localStorage.removeItem('behold_auth_user');
    window.dispatchEvent(new Event('storage'));
  },

  async forgotPassword(email) {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token, newPassword) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
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
      // Sync auth user session
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
  },

  async deleteProfile() {
    return await request('/users/profile', {
      method: 'DELETE'
    });
  },

  // Counsellor search & details
  _counsellorsCache: null,
  _counsellorsCacheTime: 0,

  async getCounsellors(query = {}, forceRefresh = false) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const qs = params.toString();

    // Cache the default full list to prevent sudden loading screens
    if (!qs && !forceRefresh) {
      if (this._counsellorsCache && (Date.now() - this._counsellorsCacheTime < 5 * 60 * 1000)) {
        return this._counsellorsCache;
      }
      const res = await request('/users/counsellors');
      if (res.success) {
        this._counsellorsCache = res;
        this._counsellorsCacheTime = Date.now();
      }
      return res;
    }

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

  async cancelAppointment(id, reason) {
    return await request(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
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

  async updateAdminUser(id, name, email, password, role, permissions, customRoleTitle, status, extraFields = {}) {
    return await request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email, password, role, permissions, customRoleTitle, status, ...extraFields })
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

  async rejectCounsellor(id, reason) {
    return await request(`/admin/counsellors/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
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
    const res = await request('/counsellors/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (res.success && res.data) {
      // Sync auth user session
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
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

  async getMyTestResults() {
    return await request('/users/test-results');
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

  // IP Blocklist Management
  async getBlockedIps() {
    return await request('/admin/settings/blocked-ips');
  },

  async addBlockedIp(ip) {
    return await request('/admin/settings/blocked-ips', {
      method: 'POST',
      body: JSON.stringify({ ip })
    });
  },

  async removeBlockedIp(ip) {
    return await request(`/admin/settings/blocked-ips/${encodeURIComponent(ip)}`, {
      method: 'DELETE'
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
    return await request('/aptitude-questions');
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
  },

  // CIGI Aptitude Test Results
  async uploadCigiResult(formData) {
    const res = await request('/users/cigi-results', {
      method: 'POST',
      body: formData
    });
    if (res.success && res.data) {
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
  },

  async deleteCigiResult(resultId) {
    const res = await request(`/users/cigi-results/${resultId}`, {
      method: 'DELETE'
    });
    if (res.success && res.data) {
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
  },

  async adminUploadCigiResult(userId, formData) {
    return await request(`/admin/users/${userId}/cigi-results`, {
      method: 'POST',
      body: formData
    });
  },

  async adminUpdateCigiResult(userId, resultId, formData) {
    return await request(`/admin/users/${userId}/cigi-results/${resultId}`, {
      method: 'PUT',
      body: formData
    });
  },

  async adminDeleteCigiResult(userId, resultId) {
    return await request(`/admin/users/${userId}/cigi-results/${resultId}`, {
      method: 'DELETE'
    });
  },

  async updateProfilePic(formData) {
    const res = await request('/users/profile-pic', {
      method: 'PUT',
      body: formData
    });
    if (res.success && res.data) {
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
  },

  async updateCounsellorProfilePic(formData) {
    const res = await request('/counsellors/profile-pic', {
      method: 'PUT',
      body: formData
    });
    if (res.success && res.data) {
      try {
        const authUser = JSON.parse(localStorage.getItem('behold_auth_user') || '{}');
        const updatedUser = { ...authUser, ...res.data };
        localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) { }
    }
    return res;
  },

  async adminUpdateUserProfilePic(userId, formData) {
    return await request(`/admin/users/${userId}/profile-pic`, {
      method: 'PUT',
      body: formData
    });
  },

  async adminUpdateCounsellorProfilePic(counsellorId, formData) {
    return await request(`/admin/counsellors/${counsellorId}/profile-pic`, {
      method: 'PUT',
      body: formData
    });
  }
};

export default ApiService;
