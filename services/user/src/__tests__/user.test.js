const request = require('supertest');
const app = require('../src/index');

describe('User API', () => {
  let authToken;

  beforeAll(async () => {
    // 测试前创建测试用户
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'Test123456',
        email: 'test@example.com',
      });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Test123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe('testuser');

      authToken = response.body.data.token;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/user/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data.username).toBe('testuser');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'Test User Updated',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.nickname).toBe('Test User Updated');
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await request(app)
      .delete('/api/user/testuser')
      .set('Authorization', `Bearer ${authToken}`);
  });
});