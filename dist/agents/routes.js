"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.agentRoutes = router;
// Basic agents route for now - placeholder
router.get('/', (req, res) => {
    res.json({
        message: 'AI Agents Management API',
        availableAgents: [
            { id: 15, name: 'Asset Management', status: 'active' },
            { id: 16, name: 'Building Management', status: 'active' },
            { id: 17, name: 'Fleet Management', status: 'active' },
            { id: 18, name: 'Multi-Company Management', status: 'active' }
        ]
    });
});
//# sourceMappingURL=routes.js.map