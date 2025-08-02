# 🆓 Free Setup Guide - AI Automation Platform

Hướng dẫn thiết lập hoàn chỉnh **AI Automation Platform** sử dụng **100% dịch vụ miễn phí**.

## 🚀 Tổng quan

AI Automation Platform là hệ thống tự động hóa với 8 AI agents chuyên biệt, được thiết kế để hoạt động hoàn toàn với các dịch vụ miễn phí.

## 📋 Dịch vụ miễn phí được hỗ trợ

### 🤖 AI APIs (100% Free)
- **Hugging Face API** - Unlimited free inference
- **Google AI Studio** - Gemini API với free quota hàng tháng
- **Groq** - Fast inference với free tier
- **Together AI** - Free tier cho multiple models

### 🗄️ Database Options (Free Tiers)
- **Supabase** - 500MB PostgreSQL + Auth + Real-time
- **Neon.tech** - 3GB PostgreSQL serverless
- **PlanetScale** - 5GB MySQL với branching
- **MongoDB Atlas** - 512MB shared cluster

### 🌐 Deployment Platforms (Free)
- **Vercel** - Unlimited static sites + Serverless functions
- **Railway** - $5 free credits/month
- **Render** - 750 hours/month free tier
- **Netlify** - Unlimited static sites + Edge functions

## 🏗️ Cấu trúc dự án

```
ai-automation-platform/
├── docs/                     # Documentation
│   ├── setup/               # Setup guides
│   ├── guides/              # User guides  
│   └── troubleshooting/     # Troubleshooting
├── lib/                     # Core libraries
│   ├── ai/                  # AI provider integrations
│   ├── database/            # Database configurations
│   └── config/              # Configuration utilities
├── scripts/                 # Setup automation
├── components/              # React components
├── pages/                   # Next.js pages
└── public/                  # Static assets
```

## ⚡ Quick Start (5 phút)

### 1. Clone và cài đặt dependencies
```bash
git clone https://github.com/mrsonly86/ai-automation-platform
cd ai-automation-platform
npm install
```

### 2. Chạy setup script tự động
```bash
chmod +x scripts/setup-free-services.sh
./scripts/setup-free-services.sh
```

### 3. Cấu hình environment
```bash
cp .env.example .env.local
# Chỉnh sửa .env.local với API keys của bạn
```

### 4. Khởi động development server
```bash
npm run dev
```

## 🔧 Setup từng bước chi tiết

### Bước 1: Tạo tài khoản các dịch vụ miễn phí

1. **Hugging Face** (Bắt buộc - AI chính)
   - Đăng ký tại: https://huggingface.co
   - Tạo Access Token: Settings → Access Tokens → New token
   - Quyền: Read

2. **Supabase** (Bắt buộc - Database chính)  
   - Đăng ký tại: https://supabase.com
   - Tạo project mới
   - Lưu URL và anon key

3. **Vercel** (Bắt buộc - Deployment chính)
   - Đăng ký tại: https://vercel.com
   - Connect GitHub account

4. **Google AI Studio** (Tùy chọn - AI phụ)
   - Truy cập: https://makersuite.google.com/app/apikey
   - Tạo API key

5. **Groq** (Tùy chọn - AI nhanh)
   - Đăng ký tại: https://console.groq.com
   - Tạo API key

### Bước 2: Cấu hình Environment

Sao chép và chỉnh sửa file environment:
```bash
cp .env.example .env.local
```

Điền thông tin vào `.env.local`:
```env
# AI Providers (Chọn ít nhất 1)
HUGGINGFACE_API_KEY=hf_your_token_here
GOOGLE_AI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
TOGETHER_API_KEY=your_together_key_here

# Database (Chọn 1)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

### Bước 3: Setup Database

#### Option A: Supabase (Khuyến nghị)
```bash
npm run db:setup:supabase
```

#### Option B: Local PostgreSQL với Docker
```bash
docker-compose -f docker-compose.free.yml up -d
npm run db:migrate
```

### Bước 4: Development

```bash
# Khởi động dev server
npm run dev

# Check dependencies
node scripts/check-dependencies.js

# Generate new secrets
node scripts/generate-keys.js
```

## 🎯 Tính năng được tối ưu cho Free Tier

### ⚡ Caching & Performance
- Redis caching cho API responses
- Service Worker cho offline functionality
- Image optimization với Next.js

### 🔄 Rate Limiting & Quotas
- Smart rate limiting cho mỗi provider
- Automatic fallback khi quota hết
- Usage tracking dashboard

### 💾 Database Optimizations
- Efficient queries cho free database tiers
- Connection pooling
- Data pagination

### 🚀 Deployment Optimizations
- Static site generation (SSG) cho Vercel
- Edge functions cho performance
- Automatic compression

## 📚 Tài liệu chi tiết

- [Setup AI APIs](docs/setup/ai-apis.md) - Cấu hình các AI providers
- [Database Setup](docs/setup/database.md) - Thiết lập databases  
- [Deployment Guide](docs/setup/deployment.md) - Deploy lên các platform
- [Local Development](docs/guides/local-development.md) - Phát triển local
- [Troubleshooting](docs/troubleshooting/common-issues.md) - Giải quyết lỗi

## 🆙 Upgrade Path

Khi cần scale up:
1. **AI APIs**: Upgrade lên paid tiers cho higher limits
2. **Database**: Migrate lên paid plans cho more storage
3. **Deployment**: Upgrade hosting cho custom domains
4. **Monitoring**: Thêm paid monitoring services

## 💡 Tips & Best Practices

### 🔋 Tiết kiệm quota
- Cache AI responses trong database
- Sử dụng batch processing
- Implement request deduplication

### 🛡️ Security cho Free Tiers
- Rate limiting per user/IP
- Input validation và sanitization
- API key rotation

### 📊 Monitoring
- Track API usage với built-in dashboard
- Monitor database usage
- Set up alerts cho quota limits

## 🆘 Hỗ trợ

- **Issues**: [GitHub Issues](https://github.com/mrsonly86/ai-automation-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mrsonly86/ai-automation-platform/discussions)
- **Documentation**: [Full Documentation](docs/)

---

**Lưu ý**: Hướng dẫn này được thiết kế để bạn có thể chạy toàn bộ platform với **$0 cost**. Tất cả dịch vụ đều có free tiers đủ cho development và testing.