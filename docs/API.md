# AI Automation Platform - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Health Check
```
GET /health
```
Returns server health status and uptime.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-02T15:37:05.968Z",
  "uptime": 27.586140534,
  "environment": "development"
}
```

### AI Agents

#### Get All Agents
```
GET /api/agents
```
Returns list of all 8 AI agents with their capabilities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Chuyển đổi Phân tích",
      "type": "ANALYSIS",
      "description": "Phân tích báo cáo và dữ liệu kinh doanh",
      "icon": "BarChart3",
      "category": "analysis",
      "color": "from-blue-500 to-cyan-500",
      "isActive": true,
      "capabilities": [
        "Phân tích dữ liệu thời gian thực",
        "Tạo báo cáo tự động",
        "Dự đoán xu hướng",
        "Visualize complex data"
      ]
    }
  ],
  "count": 8
}
```

#### Get Agent by ID
```
GET /api/agents/:id
```
Returns specific agent details.

#### Execute Agent Task
```
POST /api/agents/:id/execute
```
Starts a task execution for the specified agent.

**Body:**
```json
{
  "task": "analyze_data",
  "input": {
    "data": "sample data"
  }
}
```

### Integrations

#### Get All Integrations
```
GET /api/integrations
```
Returns list of all platform integrations and their connection status.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Vercel",
      "type": "VERCEL",
      "isConnected": true,
      "category": "deployment"
    }
  ],
  "metrics": {
    "total": 8,
    "connected": 7,
    "uptime": "99.9%",
    "support": "24/7"
  }
}
```

#### Connect Integration
```
POST /api/integrations/:id/connect
```
Connects to an external service integration.

#### Disconnect Integration
```
POST /api/integrations/:id/disconnect
```
Disconnects from an external service integration.

### Deployments

#### Get Deployment Status
```
GET /api/deployments/status
```
Returns current deployment progress and status.

**Response:**
```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "id": "1",
        "title": "Đẩy lên GitHub",
        "description": "Upload code lên repository",
        "status": "completed",
        "progress": 100,
        "startedAt": "2025-08-02T15:30:00.000Z",
        "completedAt": "2025-08-02T15:31:00.000Z"
      }
    ],
    "overallProgress": 45,
    "currentStep": "3",
    "estimatedTimeRemaining": "15 minutes"
  }
}
```

#### Start Deployment
```
POST /api/deployments/start
```
Initiates a new deployment process.

**Body:**
```json
{
  "projectId": "project_123",
  "environment": "production"
}
```

### Analytics

#### Get Analytics Data
```
GET /api/analytics
```
Returns platform analytics and usage metrics.

**Query Parameters:**
- `timeRange` (optional): `7d`, `30d`, `90d` (default: `7d`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProjects": 24,
      "activeWorkflows": 12,
      "successfulDeployments": 156,
      "totalIntegrations": 8
    },
    "agentUsage": [
      {
        "name": "Analysis Agent",
        "usage": 85,
        "trend": "+12%"
      }
    ],
    "deploymentMetrics": {
      "successRate": 98.5,
      "averageTime": "12 minutes",
      "totalDeployments": 156,
      "failureRate": 1.5
    },
    "performanceMetrics": {
      "responseTime": "120ms",
      "uptime": 99.9,
      "throughput": "1250 req/min",
      "errorRate": 0.1
    }
  }
}
```

#### Get Real-time Metrics
```
GET /api/analytics/realtime
```
Returns real-time system metrics.

### Projects (Placeholder)
```
GET /api/projects - Get all projects
POST /api/projects - Create new project
GET /api/projects/:id - Get project by ID
PUT /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project
```

### Workflows (Placeholder)
```
GET /api/workflows - Get all workflows
POST /api/workflows - Create workflow
POST /api/workflows/:id/execute - Execute workflow
```

### Authentication (Placeholder)
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/me - Get user profile
```

## WebSocket Events

The API supports real-time communication via Socket.IO:

### Client Events
- `join-project` - Join a project room for updates
- `leave-project` - Leave a project room

### Server Events
- `agent-task-completed` - Emitted when an agent completes a task
- `deployment-started` - Emitted when deployment starts
- `deployment-progress` - Emitted during deployment progress updates

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `501` - Not Implemented (for placeholder endpoints)