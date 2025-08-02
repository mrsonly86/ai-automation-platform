import { Express } from 'express';
import { authRoutes } from '@security/authentication/routes';
import { agentRoutes } from '@agents/routes';
import { assetRoutes } from '@agents/asset-management/routes';
import { buildingRoutes } from '@agents/building-management/routes';
import { fleetRoutes } from '@agents/fleet-management/routes';
import { multiCompanyRoutes } from '@agents/multi-company/routes';

export const setupRoutes = (app: Express): void => {
  // API version prefix
  const apiV1 = '/api/v1';

  // Authentication routes
  app.use(`${apiV1}/auth`, authRoutes);

  // Agent management routes
  app.use(`${apiV1}/agents`, agentRoutes);

  // Enterprise-specific agent routes
  app.use(`${apiV1}/assets`, assetRoutes);
  app.use(`${apiV1}/buildings`, buildingRoutes);
  app.use(`${apiV1}/fleet`, fleetRoutes);
  app.use(`${apiV1}/companies`, multiCompanyRoutes);

  // API info endpoint
  app.get(`${apiV1}`, (req, res) => {
    res.json({
      name: 'Enterprise Conglomerate Management System API',
      version: '1.0.0',
      description: 'Comprehensive AI-powered enterprise management system for Vietnamese large enterprises',
      agents: {
        total: 18,
        categories: [
          'AI Automation (8 agents)',
          'Business Intelligence (4 agents)', 
          'Enterprise Management (6 agents)'
        ]
      },
      features: [
        'Multi-company management',
        'Asset and facility management',
        'Fleet management',
        'Vietnamese compliance',
        'Payment integration',
        'Mobile enterprise'
      ],
      documentation: '/api/v1/docs'
    });
  });
};