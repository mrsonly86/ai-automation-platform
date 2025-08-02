# 🛠️ Common Issues & Solutions

Hướng dẫn giải quyết các vấn đề thường gặp khi setup AI Automation Platform.

## 🚨 Environment & Configuration Issues

### ❌ Issue: "Environment variables not found"

**Symptoms:**
```
Error: HUGGINGFACE_API_KEY is not defined
Error: Supabase URL is missing
```

**Solutions:**
1. **Check file existence:**
   ```bash
   ls -la .env.local
   ```

2. **Copy from template:**
   ```bash
   cp .env.example .env.local
   ```

3. **Verify variables are set:**
   ```bash
   node scripts/check-dependencies.js
   ```

4. **Common mistakes:**
   - Spaces around `=` (should be `KEY=value`, not `KEY = value`)
   - Missing quotes for values with spaces
   - Wrong file name (should be `.env.local`, not `.env`)

---

### ❌ Issue: "NextAuth secret must be at least 32 characters"

**Symptoms:**
```
Config validation error: NEXTAUTH_SECRET must be at least 32 characters
```

**Solutions:**
1. **Generate new secret:**
   ```bash
   node scripts/generate-keys.js --nextauth-only
   ```

2. **Manual generation:**
   ```bash
   openssl rand -base64 32
   ```

3. **Update .env.local:**
   ```env
   NEXTAUTH_SECRET=your_generated_32_character_secret_here
   ```

---

## 🤖 AI Provider Issues

### ❌ Issue: "Hugging Face API rate limit exceeded"

**Symptoms:**
```
Error: Rate limit exceeded for Hugging Face API
HTTP 429: Too Many Requests
```

**Solutions:**
1. **Wait and retry** (rate limits reset automatically)

2. **Enable fallback providers:**
   ```env
   AUTO_FALLBACK_ENABLED=true
   GROQ_API_KEY=your_groq_key
   GOOGLE_AI_API_KEY=your_google_key
   ```

3. **Implement caching:**
   ```javascript
   // lib/ai/cache.js is already included
   ENABLE_CACHING=true
   ```

4. **Use smaller models:**
   ```javascript
   // Use lighter models for development
   const model = "gpt2" // instead of larger models
   ```

---

### ❌ Issue: "Google AI API quota exceeded"

**Symptoms:**
```
Error: Quota exceeded for Google AI API
HTTP 429: Quota Exceeded
```

**Solutions:**
1. **Check quota usage:**
   - Visit https://makersuite.google.com/app/usage
   - Monitor daily/monthly limits

2. **Reduce request frequency:**
   ```env
   RATE_LIMIT_RPM=30  # Reduce from 60 to 30
   ```

3. **Use alternative providers:**
   ```env
   PRIMARY_AI_PROVIDER=huggingface
   FALLBACK_AI_PROVIDERS=groq,together
   ```

---

### ❌ Issue: "Groq connection timeout"

**Symptoms:**
```
Error: Request timeout for Groq API
Connection timeout after 30s
```

**Solutions:**
1. **Check API status:**
   - Visit https://status.groq.com

2. **Increase timeout:**
   ```javascript
   // In lib/ai/groq.js
   const timeout = 60000; // 60 seconds
   ```

3. **Use fallback:**
   ```env
   AUTO_FALLBACK_ENABLED=true
   ```

---

## 🗄️ Database Issues

### ❌ Issue: "Supabase connection failed"

**Symptoms:**
```
Error: Invalid Supabase URL or key
Connection to Supabase failed
```

**Solutions:**
1. **Verify credentials:**
   ```bash
   # Check your Supabase dashboard
   # Project Settings > API
   ```

2. **Test connection:**
   ```javascript
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
   console.log('Testing connection...');
   "
   ```

3. **Common URL mistakes:**
   ```env
   # Wrong
   NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
   
   # Correct
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

4. **Regenerate keys:**
   - Go to Supabase dashboard
   - Project Settings > API
   - Regenerate keys if needed

---

### ❌ Issue: "Table 'profiles' doesn't exist"

**Symptoms:**
```
Error: relation "public.profiles" does not exist
PostgreSQL error: table not found
```

**Solutions:**
1. **Run database setup:**
   ```bash
   npm run setup:db
   ```

2. **Manual table creation:**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE TABLE public.profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     username TEXT UNIQUE,
     full_name TEXT,
     avatar_url TEXT,
     credits INTEGER DEFAULT 100,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Enable RLS:**
   ```sql
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" ON public.profiles
     FOR SELECT USING (auth.uid() = id);
   ```

---

## 🐳 Docker Issues

### ❌ Issue: "Docker daemon not running"

**Symptoms:**
```
Error: Cannot connect to Docker daemon
docker: command not found
```

**Solutions:**
1. **Install Docker:**
   - **macOS:** Download Docker Desktop
   - **Windows:** Download Docker Desktop
   - **Linux:** 
     ```bash
     curl -fsSL https://get.docker.com -o get-docker.sh
     sh get-docker.sh
     ```

2. **Start Docker service:**
   ```bash
   # Linux
   sudo systemctl start docker
   
   # macOS/Windows: Start Docker Desktop
   ```

3. **Alternative: Use cloud services instead**
   - Skip local Docker setup
   - Use Supabase for database
   - Use Upstash for Redis

---

### ❌ Issue: "Port already in use"

**Symptoms:**
```
Error: Port 5432 is already in use
Error: Port 6379 is already in use
```

**Solutions:**
1. **Check what's using the port:**
   ```bash
   lsof -i :5432
   lsof -i :6379
   ```

2. **Stop conflicting services:**
   ```bash
   # Stop local PostgreSQL
   sudo systemctl stop postgresql
   
   # Stop local Redis
   sudo systemctl stop redis
   ```

3. **Use different ports:**
   ```yaml
   # docker-compose.free.yml
   services:
     postgres:
       ports:
         - "5433:5432"  # Use 5433 instead
     redis:
       ports:
         - "6380:6379"  # Use 6380 instead
   ```

---

## 🚀 Deployment Issues

### ❌ Issue: "Vercel build failed"

**Symptoms:**
```
Error: Build failed on Vercel
Module not found: Can't resolve '@supabase/supabase-js'
```

**Solutions:**
1. **Check dependencies:**
   ```bash
   npm install
   npm run build  # Test locally first
   ```

2. **Environment variables:**
   - Add all required env vars in Vercel dashboard
   - Settings > Environment Variables

3. **Node.js version:**
   ```json
   // package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

4. **Build command:**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "installCommand": "npm install"
   }
   ```

---

### ❌ Issue: "API routes timeout"

**Symptoms:**
```
Error: Function execution timed out
504 Gateway Timeout
```

**Solutions:**
1. **Increase timeout:**
   ```json
   // vercel.json
   {
     "functions": {
       "pages/api/**/*.js": {
         "maxDuration": 60
       }
     }
   }
   ```

2. **Optimize API calls:**
   ```javascript
   // Use shorter timeouts for AI providers
   const timeout = 30000; // 30 seconds max
   ```

3. **Use Edge Runtime:**
   ```javascript
   // pages/api/ai/chat.js
   export const config = {
     runtime: 'edge',
   }
   ```

---

## 🔑 Authentication Issues

### ❌ Issue: "NextAuth session not working"

**Symptoms:**
```
Error: No session found
useSession returns null
```

**Solutions:**
1. **Check NextAuth configuration:**
   ```javascript
   // pages/api/auth/[...nextauth].js
   export default NextAuth({
     providers: [...],
     secret: process.env.NEXTAUTH_SECRET,
     url: process.env.NEXTAUTH_URL
   })
   ```

2. **Verify environment:**
   ```env
   NEXTAUTH_SECRET=your_32_character_secret
   NEXTAUTH_URL=http://localhost:3000  # or your domain
   ```

3. **Clear cookies:**
   - Clear browser cookies
   - Try incognito mode

---

## 📱 Common Development Issues

### ❌ Issue: "Hot reload not working"

**Symptoms:**
- Changes not reflected in browser
- Need to manually refresh

**Solutions:**
1. **Check Next.js version:**
   ```bash
   npm update next
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Clear .next cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### ❌ Issue: "TypeScript errors"

**Symptoms:**
```
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:**
1. **Add type checks:**
   ```typescript
   if (!process.env.HUGGINGFACE_API_KEY) {
     throw new Error('HUGGINGFACE_API_KEY is required');
   }
   ```

2. **Use type assertion:**
   ```typescript
   const apiKey = process.env.HUGGINGFACE_API_KEY as string;
   ```

3. **Skip type checking temporarily:**
   ```bash
   npm run build -- --no-type-check
   ```

---

## 🔍 Debugging Tools

### Debug Environment
```bash
# Check all environment variables
node scripts/check-dependencies.js

# Test specific provider
node -e "console.log(process.env.HUGGINGFACE_API_KEY)"
```

### Debug API Calls
```javascript
// Add to your API route
console.log('Request:', req.body);
console.log('Environment:', process.env.NODE_ENV);
console.log('API Key present:', !!process.env.HUGGINGFACE_API_KEY);
```

### Debug Database
```javascript
// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
supabase.from('profiles').select('count').then(console.log);
```

---

## 🆘 Getting Help

### 1. Check Logs
```bash
# Vercel logs
vercel logs your-deployment-url

# Railway logs
railway logs

# Local logs
npm run dev  # Check console output
```

### 2. Documentation
- [FREE-SETUP-GUIDE.md](../FREE-SETUP-GUIDE.md)
- [AI APIs Guide](../docs/setup/ai-apis.md)
- [Database Guide](../docs/setup/database.md)

### 3. Community Support
- **GitHub Issues:** [Create an issue](https://github.com/mrsonly86/ai-automation-platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/mrsonly86/ai-automation-platform/discussions)

### 4. Service Status Pages
- **Hugging Face:** https://status.huggingface.co
- **Supabase:** https://status.supabase.com
- **Vercel:** https://vercel-status.com
- **Groq:** https://status.groq.com

---

**💡 Pro Tip:** Always test your configuration locally before deploying to production. Use `npm run setup:check` to verify everything is working correctly.