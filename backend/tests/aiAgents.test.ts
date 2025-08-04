import request from 'supertest';
import app from '../src/index';

describe('AI Agents Endpoints', () => {
  describe('GET /api/ai-agents', () => {
    test('should return list of AI agents in Vietnamese', async () => {
      const response = await request(app)
        .get('/api/ai-agents')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBe(8);
      
      // Check first agent structure
      const firstAgent = response.body.data[0];
      expect(firstAgent).toHaveProperty('id');
      expect(firstAgent).toHaveProperty('name');
      expect(firstAgent).toHaveProperty('description');
      expect(firstAgent).toHaveProperty('icon');
      expect(firstAgent).toHaveProperty('capabilities');
      expect(firstAgent).toHaveProperty('status');
    });

    test('should return list of AI agents in English', async () => {
      const response = await request(app)
        .get('/api/ai-agents?lang=en')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Successfully retrieved');
    });

    test('should have correct agent IDs', async () => {
      const response = await request(app)
        .get('/api/ai-agents')
        .expect(200);

      const agentIds = response.body.data.map((agent: any) => agent.id);
      const expectedIds = [
        'data-analyst',
        'content-creator',
        'customer-service',
        'sales-assistant',
        'project-manager',
        'security-monitor',
        'quality-assurance',
        'system-optimizer'
      ];

      expect(agentIds).toEqual(expect.arrayContaining(expectedIds));
    });
  });

  describe('GET /api/ai-agents/:id', () => {
    test('should return specific AI agent', async () => {
      const response = await request(app)
        .get('/api/ai-agents/data-analyst')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 'data-analyst');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('capabilities');
    });

    test('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/ai-agents/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Không tìm thấy');
    });

    test('should return agent in English when lang=en', async () => {
      const response = await request(app)
        .get('/api/ai-agents/data-analyst?lang=en')
        .expect(200);

      expect(response.body.message).toContain('Successfully retrieved');
    });
  });
});