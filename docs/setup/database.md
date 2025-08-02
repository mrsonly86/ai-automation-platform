# 🗄️ Free Database Setup Guide

Hướng dẫn thiết lập database hoàn toàn miễn phí cho AI Automation Platform.

## 🎯 Database Options Comparison

| Service | Free Quota | Features | Best For |
|---------|------------|----------|----------|
| **Supabase** | 500MB + Auth + Real-time | PostgreSQL, Auth, Storage | Full-stack apps |
| **Neon.tech** | 3GB + Branching | Serverless PostgreSQL | Development |
| **PlanetScale** | 5GB + Branching | Serverless MySQL | Scalable apps |
| **MongoDB Atlas** | 512MB cluster | Document database | NoSQL needs |

## 🏆 Recommended: Supabase Setup

### Tại sao chọn Supabase?
- ✅ 500MB PostgreSQL miễn phí
- ✅ Built-in Authentication
- ✅ Real-time subscriptions
- ✅ Edge Functions
- ✅ Storage cho files
- ✅ Dashboard quản lý đẹp

### Step-by-step Setup:

#### 1. Tạo Project
1. Truy cập: https://supabase.com
2. Click "Start your project"
3. Đăng nhập với GitHub
4. Click "New project"
5. Chọn Organization (hoặc tạo mới)
6. Điền thông tin:
   - Project name: `ai-automation-platform`
   - Database password: Tạo password mạnh
   - Region: Chọn gần nhất (Singapore cho VN)
7. Click "Create new project"

#### 2. Lấy Connection Details
1. Vào project dashboard
2. Click "Settings" → "API"
3. Copy các thông tin:
   - Project URL
   - Project API keys (anon + service_role)

#### 3. Cấu hình Environment
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 4. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### 5. Create Database Schema
```sql
-- Execute in Supabase SQL Editor

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Usage Tracking
CREATE TABLE public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  request_type TEXT NOT NULL,
  cost_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Workflows
CREATE TABLE public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE public.workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

#### 6. Database Client Configuration
```javascript
// lib/database/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Database operations
export const db = {
  // Profiles
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Conversations
  async createConversation(userId, title, model) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        model_used: model
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Messages
  async addMessage(conversationId, role, content, tokensUsed = 0) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Usage tracking
  async logUsage(userId, provider, model, tokensUsed, requestType, costCredits = 0) {
    const { data, error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        provider,
        model,
        tokens_used: tokensUsed,
        request_type: requestType,
        cost_credits: costCredits
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserUsage(userId, days = 30) {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
```

## 🔄 Alternative Options

### Option 2: Neon.tech (Serverless PostgreSQL)

**Ưu điểm:**
- ✅ 3GB storage miễn phí
- ✅ Database branching (như Git)
- ✅ Auto-scaling
- ✅ Compatible với Prisma

**Setup:**
1. Đăng ký tại: https://console.neon.tech
2. Create database
3. Copy connection string

```env
# .env.local
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/dbname
```

### Option 3: PlanetScale (Serverless MySQL)

**Ưu điểm:**
- ✅ 5GB storage miễn phí
- ✅ Database branching
- ✅ Vitess-powered scaling
- ✅ Zero-downtime deployments

**Setup:**
1. Đăng ký tại: https://planetscale.com
2. Create database
3. Create branch
4. Get connection string

```env
# .env.local
DATABASE_URL=mysql://user:password@host.planetscale.com/dbname?sslaccept=strict
```

### Option 4: MongoDB Atlas (Document Database)

**Ưu điểm:**
- ✅ 512MB cluster miễn phí
- ✅ Document-based storage
- ✅ Built-in analytics
- ✅ Global clusters

**Setup:**
1. Đăng ký tại: https://cloud.mongodb.com
2. Create cluster
3. Create database user
4. Whitelist IP address
5. Get connection string

```env
# .env.local
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
```

## 🐳 Local Development với Docker

Cho development local, sử dụng Docker:

```bash
# Start local database
docker-compose -f docker-compose.free.yml up -d

# Connect to local PostgreSQL
psql postgresql://ai_platform:ai_platform_password@localhost:5432/ai_platform_dev
```

## 🛠️ Prisma Setup (Optional)

Nếu prefer Prisma ORM:

```bash
npm install prisma @prisma/client
npx prisma init
```

```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Profile {
  id        String   @id @default(uuid())
  username  String?  @unique
  fullName  String?  @map("full_name")
  avatarUrl String?  @map("avatar_url")
  credits   Int      @default(100)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  conversations Conversation[]
  usageLogs     UsageLog[]
  workflows     Workflow[]

  @@map("profiles")
}

model Conversation {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  title     String
  modelUsed String   @map("model_used")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  profile  Profile   @relation(fields: [userId], references: [id])
  messages Message[]

  @@map("conversations")
}

// ... more models
```

## 📊 Monitoring & Optimization

### Database Monitoring
```javascript
// lib/database/monitor.js
export class DatabaseMonitor {
  static async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      return !error
    } catch (error) {
      return false
    }
  }

  static async getStorageUsage() {
    // Implementation depends on provider
    // For Supabase, check dashboard
  }

  static async optimizeQueries() {
    // Add indexes for frequently queried columns
    // Use pagination for large results
    // Implement query caching
  }
}
```

### Connection Pooling
```javascript
// lib/database/pool.js
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Free tier limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export default pool
```

## 🚀 Migration Scripts

```javascript
// scripts/migrate-database.js
import { supabaseAdmin } from '../lib/database/supabase.js'
import fs from 'fs'

async function runMigrations() {
  const migrationSQL = fs.readFileSync('./scripts/migrations/001-initial.sql', 'utf8')
  
  const { error } = await supabaseAdmin.rpc('execute_sql', {
    sql: migrationSQL
  })
  
  if (error) {
    console.error('Migration failed:', error)
  } else {
    console.log('Migration completed successfully')
  }
}

runMigrations()
```

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)
- Enable RLS trên tất cả tables
- Create policies cho từng operation
- Test policies thoroughly

### 2. API Key Security
- Không expose service role key ở client
- Sử dụng anon key cho public operations
- Rotate keys định kỳ

### 3. Data Validation
```javascript
// lib/database/validation.js
import Joi from 'joi'

export const schemas = {
  profile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    fullName: Joi.string().min(1).max(100),
    avatarUrl: Joi.string().uri()
  }),
  
  message: Joi.object({
    content: Joi.string().min(1).max(10000).required(),
    role: Joi.string().valid('user', 'assistant', 'system').required()
  })
}
```

## 🧪 Testing Database

```javascript
// tests/database.test.js
import { db } from '../lib/database/supabase.js'

describe('Database Operations', () => {
  test('should create and retrieve profile', async () => {
    const profile = await db.createProfile({
      username: 'testuser',
      fullName: 'Test User'
    })
    
    expect(profile.username).toBe('testuser')
    
    const retrieved = await db.getProfile(profile.id)
    expect(retrieved.fullName).toBe('Test User')
  })
})
```

## 💡 Cost Optimization Tips

1. **Index Optimization**: Tạo indexes cho queries thường dùng
2. **Query Optimization**: Sử dụng select specific columns
3. **Connection Pooling**: Limit concurrent connections
4. **Data Archiving**: Archive old data định kỳ
5. **Caching**: Cache frequent queries

---

**Next Steps:** [Deployment Options](deployment.md)