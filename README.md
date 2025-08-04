# AI Automation Platform

Hệ thống AI Automation Platform - Nền tảng tự động hóa với 8 AI agents chuyên biệt, tích hợp đa dịch vụ và quy trình triển khai tự động.

## 🚀 Tính năng chính

- **8 AI Agents chuyên biệt**: Data Analyst, Content Creator, Customer Service, Sales Assistant, Project Manager, Security Monitor, Quality Assurance, System Optimizer
- **Giao diện React/TypeScript**: Responsive, hỗ trợ đa ngôn ngữ (Tiếng Việt/English)
- **Backend Node.js/Express**: RESTful API với TypeScript
- **CI/CD Pipeline**: GitHub Actions với automated testing và deployment
- **Docker Support**: Containerized deployment với docker-compose
- **Enterprise Security**: Helmet, CORS, Rate limiting, Input validation

## 🏗️ Kiến trúc

```
ai-automation-platform/
├── frontend/          # React TypeScript Application
├── backend/           # Node.js Express API
├── .github/workflows/ # CI/CD Pipeline
├── docker-compose.yml # Container orchestration
└── package.json       # Monorepo configuration
```

## 🛠️ Cài đặt và Chạy

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optional)

### Development Setup

1. **Clone repository:**
```bash
git clone <repository-url>
cd ai-automation-platform
```

2. **Install dependencies:**
```bash
npm run install:all
```

3. **Start development servers:**
```bash
npm run dev
```

Hoặc chạy riêng biệt:
```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend (http://localhost:3001)
npm run dev:backend
```

### Production Build

```bash
# Build all
npm run build

# Build specific
npm run build:frontend
npm run build:backend
```

### Testing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:frontend
npm run test:backend

# Watch mode
cd frontend && npm run test:watch
cd backend && npm run test:watch
```

### Docker Deployment

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Stop services
docker compose down
```

## 🧪 CI/CD Pipeline

GitHub Actions workflow bao gồm:

- ✅ **Frontend Tests**: Jest, React Testing Library
- ✅ **Backend Tests**: Jest, Supertest
- ✅ **Build Validation**: TypeScript compilation
- ✅ **Linting**: ESLint with TypeScript rules
- ✅ **Docker Build**: Multi-stage builds
- ✅ **Deployment**: Automated deployment to production

### Trigger Events
- Push to `main` hoặc `develop` branches
- Pull requests to `main` hoặc `develop`

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information

### AI Agents
- `GET /api/ai-agents` - List all AI agents
- `GET /api/ai-agents/:id` - Get specific AI agent
- Query parameters: `?lang=vi|en` for language

### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": "data-analyst",
      "name": "Data Analyst AI",
      "description": "Phân tích dữ liệu và tạo báo cáo thông minh",
      "icon": "📊",
      "capabilities": ["data-analysis", "reporting", "visualization", "predictions"],
      "status": "active"
    }
  ],
  "total": 8
}
```

## 🌐 Internationalization

Hỗ trợ đa ngôn ngữ:
- **Tiếng Việt** (mặc định)
- **English**

Cấu hình trong `frontend/src/i18n/i18n.ts`

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Joi schema validation
- **Environment Variables**: Secure configuration

## 📊 Monitoring & Health Checks

- Frontend: `/health` endpoint
- Backend: `/api/health` và `/api/health/detailed`
- Docker health checks configured
- Uptime và memory monitoring

## 🚀 Deployment

### Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình variables:
- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- Security keys và API tokens

### Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database connections tested
- [ ] Health checks responding
- [ ] Logs configured
- [ ] Monitoring setup

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit Pull Request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Jest testing (>70% coverage)
- Vietnamese comments cho business logic
- English comments cho technical implementation

## 📝 License

Copyright 2025 AI Automation Platform Team. All rights reserved.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: README và inline comments
- **API Documentation**: Available via `/api/health/detailed`

---

**Made with ❤️ in Vietnam**
