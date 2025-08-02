# 🤖 AI Automation Platform

**Nền tảng tự động hóa AI với 8 agents chuyên biệt sử dụng 100% dịch vụ miễn phí**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrsonly86/ai-automation-platform)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/mrsonly86/ai-automation-platform)

## ✨ Tính năng nổi bật

- 🆓 **100% miễn phí** - Sử dụng hoàn toàn các dịch vụ free tier
- 🤖 **8 AI Agents** chuyên biệt cho các task khác nhau
- 🔄 **Smart Fallback** - Tự động chuyển đổi provider khi quota hết
- ⚡ **Deployment 1-click** - Deploy lên Vercel trong 2 phút
- 🛡️ **Production Ready** - Tối ưu cho môi trường production
- 📚 **Documentation đầy đủ** - Hướng dẫn chi tiết từng bước

## 🚀 Quick Start (5 phút)

```bash
# Clone repository
git clone https://github.com/mrsonly86/ai-automation-platform
cd ai-automation-platform

# Auto setup tất cả
chmod +x scripts/setup-free-services.sh
./scripts/setup-free-services.sh

# Generate secure keys
npm run setup:keys

# Start development
npm run dev
```

**Hoặc deploy ngay lên Vercel:**
[![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrsonly86/ai-automation-platform)

## 🆓 Dịch vụ miễn phí được hỗ trợ

### 🤖 AI Providers
- **Hugging Face** - Unlimited inference miễn phí
- **Google AI Studio** - 60 requests/minute với Gemini
- **Groq** - 6,000 tokens/minute siêu nhanh
- **Together AI** - $25 free credits

### 🗄️ Database Options  
- **Supabase** - 500MB PostgreSQL + Auth + Real-time
- **Neon.tech** - 3GB PostgreSQL serverless
- **PlanetScale** - 5GB MySQL với branching
- **MongoDB Atlas** - 512MB cluster miễn phí

### 🌐 Deployment Platforms
- **Vercel** - Unlimited static sites + Edge Functions
- **Railway** - $5 credits/month cho full-stack
- **Render** - 750 hours/month miễn phí
- **Netlify** - 100GB bandwidth + Edge Functions

## 📋 Cấu trúc dự án

```
ai-automation-platform/
├── 📄 FREE-SETUP-GUIDE.md       # Hướng dẫn setup chi tiết
├── 📄 ALTERNATIVE-APIS.md       # So sánh các AI providers
├── 📄 DEPLOYMENT-OPTIONS.md     # Hướng dẫn deployment
├── 📁 docs/                     # Documentation
│   ├── setup/                   # Setup guides
│   ├── guides/                  # User guides
│   └── troubleshooting/         # Troubleshooting
├── 📁 lib/                      # Core libraries
│   ├── ai/                      # AI integrations
│   ├── database/                # Database clients
│   └── config/                  # Configuration
├── 📁 scripts/                  # Automation scripts
└── 📁 components/               # React components
```

## 🎯 8 AI Agents chuyên biệt

1. **💬 Chat Agent** - Conversational AI with context
2. **💻 Code Agent** - Code generation and review
3. **📝 Content Agent** - Blog posts, articles, copywriting
4. **🔍 Analysis Agent** - Data analysis and insights
5. **🌐 Translation Agent** - Multi-language translation
6. **📊 Summary Agent** - Document and content summarization
7. **🎨 Creative Agent** - Creative writing and ideation
8. **🔧 Workflow Agent** - Process automation orchestration

## ⚡ Smart Features

### 🔄 Auto Fallback System
Tự động chuyển đổi giữa các AI providers:
```javascript
// Tự động fallback khi Hugging Face quota hết
const result = await generateWithFallback(prompt, {
  primaryProvider: 'huggingface',
  fallbackProviders: ['groq', 'google', 'together']
});
```

### 📊 Usage Tracking
Monitor quota và performance real-time:
```javascript
// Track usage across all providers
const usage = await getProviderStatus();
console.log(usage.huggingface.requests); // Today's usage
```

### ⚡ Caching System
Giảm API calls và tăng tốc độ:
```javascript
// Auto cache responses for 1 hour
const cached = await getCachedResponse(prompt);
if (!cached) {
  const result = await generateAI(prompt);
  setCachedResponse(prompt, result);
}
```

## 🛠️ Setup nhanh các dịch vụ

### 1. Hugging Face (AI chính)
```bash
# 1. Đăng ký: https://huggingface.co
# 2. Tạo token: https://huggingface.co/settings/tokens
# 3. Add vào .env.local:
HUGGINGFACE_API_KEY=hf_your_token_here
```

### 2. Supabase (Database)
```bash
# 1. Đăng ký: https://supabase.com
# 2. Tạo project mới
# 3. Lấy URL và keys từ Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Deploy lên Vercel
```bash
# 1. Connect GitHub tại: https://vercel.com
# 2. Import repository
# 3. Add environment variables
# 4. Deploy!
```

## 📚 Documentation

### 🚀 Setup Guides
- [📖 Free Setup Guide](FREE-SETUP-GUIDE.md) - Hướng dẫn setup từ A-Z
- [🤖 AI APIs Setup](docs/setup/ai-apis.md) - Cấu hình AI providers
- [🗄️ Database Setup](docs/setup/database.md) - Setup databases miễn phí
- [🌐 Deployment Guide](docs/setup/deployment.md) - Deploy lên hosting platforms

### 💻 Development
- [💻 Local Development](docs/guides/local-development.md) - Phát triển local
- [🔧 API Reference](docs/guides/api-reference.md) - API documentation
- [🤖 AI Agents Guide](docs/guides/ai-agents.md) - Sử dụng AI agents

### 🛠️ Troubleshooting
- [❗ Common Issues](docs/troubleshooting/common-issues.md) - Các lỗi thường gặp
- [🔌 API Errors](docs/troubleshooting/api-errors.md) - Lỗi API và cách fix
- [🚀 Deployment Issues](docs/troubleshooting/deployment-issues.md) - Lỗi deployment

## 🧪 Testing & Quality

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Check all dependencies
npm run setup:check
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [Đọc docs đầy đủ](docs/)
- **Issues:** [Report bugs](https://github.com/mrsonly86/ai-automation-platform/issues)
- **Discussions:** [Community help](https://github.com/mrsonly86/ai-automation-platform/discussions)
- **Email:** support@ai-automation-platform.com

## 🌟 Roadmap

- [ ] **v1.1** - Thêm Vector Database support (Pinecone free tier)
- [ ] **v1.2** - Real-time collaboration features
- [ ] **v1.3** - Mobile app với React Native
- [ ] **v1.4** - Advanced workflow builder
- [ ] **v1.5** - Multi-tenant support

## ⭐ Show your support

Nếu project này hữu ích, hãy give nó một ⭐ trên GitHub!

[![GitHub stars](https://img.shields.io/github/stars/mrsonly86/ai-automation-platform?style=social)](https://github.com/mrsonly86/ai-automation-platform/stargazers)

---

**Made with ❤️ by the AI Automation Platform team**

> 💡 **Pro Tip:** Start với free tiers và scale up khi cần. Platform được thiết kế để dễ dàng upgrade từ free sang paid services.
