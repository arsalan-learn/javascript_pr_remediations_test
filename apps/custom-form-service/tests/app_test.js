const request = require('supertest');
const app = require('../src/app');

describe('Custom Form Service', () => {
  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app.callback())
        .get('/health')
        .expect(200);

      expect(response.body).to.deep.equal({ status: 'ok' });
    });
  });
}); 