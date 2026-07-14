const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('GET /api/health', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return 200 OK and success: true', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('running and healthy');
  });
});
