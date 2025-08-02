"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const routes_1 = require("../security/authentication/routes");
const routes_2 = require("../agents/routes");
const routes_3 = require("../agents/asset-management/routes");
const routes_4 = require("../agents/building-management/routes");
const routes_5 = require("../agents/fleet-management/routes");
const routes_6 = require("../agents/multi-company/routes");
const setupRoutes = (app) => {
    // API version prefix
    const apiV1 = '/api/v1';
    // Authentication routes
    app.use(`${apiV1}/auth`, routes_1.authRoutes);
    // Agent management routes
    app.use(`${apiV1}/agents`, routes_2.agentRoutes);
    // Enterprise-specific agent routes
    app.use(`${apiV1}/assets`, routes_3.assetRoutes);
    app.use(`${apiV1}/buildings`, routes_4.buildingRoutes);
    app.use(`${apiV1}/fleet`, routes_5.fleetRoutes);
    app.use(`${apiV1}/companies`, routes_6.multiCompanyRoutes);
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
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=routes.js.map