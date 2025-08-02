#!/bin/bash

# =============================================================================
# AI Automation Platform - Free Services Setup Script
# =============================================================================
# This script helps you set up all the free services needed for the platform
# =============================================================================

set -e  # Exit on any error

echo "🚀 AI Automation Platform - Free Setup Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}🔄 $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    dependencies=("node" "npm" "git" "curl")
    missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check Node.js version
check_node_version() {
    print_step "Checking Node.js version..."
    
    node_version=$(node -v | cut -d'v' -f2)
    required_version="16.0.0"
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_error "Node.js version $node_version is too old. Please upgrade to v16 or newer."
        exit 1
    fi
    
    print_success "Node.js version $node_version is compatible"
}

# Install npm dependencies
install_dependencies() {
    print_step "Installing npm dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_info "Creating package.json for AI Automation Platform..."
        
        cat > package.json << 'EOF'
{
  "name": "ai-automation-platform",
  "version": "1.0.0",
  "description": "AI Automation Platform with 8 specialized agents using 100% free services",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma db push",
    "db:studio": "prisma studio",
    "setup:check": "node scripts/check-dependencies.js",
    "setup:keys": "node scripts/generate-keys.js",
    "setup:db": "node scripts/setup-database.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "next-auth": "^4.24.0",
    "@next-auth/supabase-adapter": "^1.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "prisma": "^5.0.0"
  },
  "keywords": [
    "ai",
    "automation",
    "platform",
    "free",
    "next.js",
    "supabase"
  ],
  "author": "AI Automation Platform",
  "license": "MIT"
}
EOF
    fi
    
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file
setup_environment() {
    print_step "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_warning "Created .env.local from template"
        print_info "Please edit .env.local with your actual API keys"
    else
        print_info ".env.local already exists"
    fi
    
    # Generate secrets if needed
    if command -v node &> /dev/null; then
        node scripts/generate-keys.js
    fi
}

# Setup Tailwind CSS
setup_tailwind() {
    print_step "Setting up Tailwind CSS..."
    
    if [ ! -f "tailwind.config.js" ]; then
        cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
EOF
        print_success "Tailwind config created"
    fi
    
    if [ ! -f "postcss.config.js" ]; then
        cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
        print_success "PostCSS config created"
    fi
}

# Setup Next.js configuration
setup_nextjs() {
    print_step "Setting up Next.js configuration..."
    
    if [ ! -f "next.config.js" ]; then
        cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'supabase.co',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/setup/free-setup',
        permanent: false,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
EOF
        print_success "Next.js config created"
    fi
}

# Create basic app structure
create_app_structure() {
    print_step "Creating app structure..."
    
    # Create basic directories
    mkdir -p app/{auth,dashboard,docs} components/{ui,forms} public/images
    
    # Create a basic layout
    if [ ! -f "app/layout.tsx" ]; then
        cat > app/layout.tsx << 'EOF'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Automation Platform',
  description: 'AI Automation Platform with 8 specialized agents using 100% free services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
EOF
    fi
    
    # Create global CSS
    if [ ! -f "app/globals.css" ]; then
        cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF
    fi
    
    # Create basic home page
    if [ ! -f "app/page.tsx" ]; then
        cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🤖 AI Automation Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          8 specialized AI agents powered by 100% free services
        </p>
        <div className="space-x-4">
          <Link 
            href="/docs/setup/free-setup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
          >
            📚 Setup Guide
          </Link>
          <Link 
            href="/dashboard"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg inline-block"
          >
            🚀 Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
EOF
    fi
    
    print_success "Basic app structure created"
}

# Setup local database with Docker
setup_local_database() {
    print_step "Setting up local database with Docker..."
    
    if command -v docker &> /dev/null; then
        print_info "Docker detected. Setting up local development database..."
        
        # Start local database
        docker-compose -f docker-compose.free.yml up -d postgres redis
        
        # Wait for database to be ready
        print_info "Waiting for database to be ready..."
        sleep 10
        
        print_success "Local database setup complete"
        print_info "PostgreSQL: localhost:5432"
        print_info "Redis: localhost:6379"
        print_info "pgAdmin: http://localhost:5050 (admin@ai-platform.local / admin123)"
    else
        print_warning "Docker not found. Skipping local database setup."
        print_info "You can use cloud databases like Supabase instead."
    fi
}

# Setup Git hooks
setup_git_hooks() {
    print_step "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        mkdir -p .git/hooks
        
        # Pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for AI Automation Platform

echo "🔍 Running pre-commit checks..."

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it from .env.example"
    exit 1
fi

# Run linting
if command -v npm >/dev/null 2>&1; then
    npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ Linting failed. Please fix the errors before committing."
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Create initial documentation
create_documentation() {
    print_step "Creating documentation structure..."
    
    # Ensure docs directory exists
    mkdir -p docs/{setup,guides,troubleshooting}
    
    # Create a simple index for docs
    if [ ! -f "app/docs/page.tsx" ]; then
        mkdir -p app/docs
        cat > app/docs/page.tsx << 'EOF'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📚 Documentation</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Start</h2>
          <ul className="space-y-2">
            <li><Link href="/docs/setup/free-setup" className="text-blue-600 hover:underline">Free Setup Guide</Link></li>
            <li><Link href="/docs/setup/ai-apis" className="text-blue-600 hover:underline">AI APIs Setup</Link></li>
            <li><Link href="/docs/setup/database" className="text-blue-600 hover:underline">Database Setup</Link></li>
            <li><Link href="/docs/setup/deployment" className="text-blue-600 hover:underline">Deployment</Link></li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📖 Guides</h2>
          <ul className="space-y-2">
            <li><Link href="/docs/guides/local-development" className="text-blue-600 hover:underline">Local Development</Link></li>
            <li><Link href="/docs/guides/ai-agents" className="text-blue-600 hover:underline">AI Agents</Link></li>
            <li><Link href="/docs/guides/workflows" className="text-blue-600 hover:underline">Workflows</Link></li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Troubleshooting</h2>
          <ul className="space-y-2">
            <li><Link href="/docs/troubleshooting/common-issues" className="text-blue-600 hover:underline">Common Issues</Link></li>
            <li><Link href="/docs/troubleshooting/api-errors" className="text-blue-600 hover:underline">API Errors</Link></li>
            <li><Link href="/docs/troubleshooting/deployment-issues" className="text-blue-600 hover:underline">Deployment Issues</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
EOF
    fi
    
    print_success "Documentation structure created"
}

# Display setup summary
display_summary() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "================="
    echo ""
    print_success "AI Automation Platform has been set up successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🔑 Configure API Keys:"
    echo "   Edit .env.local with your free service API keys"
    echo "   - Hugging Face: https://huggingface.co/settings/tokens"
    echo "   - Supabase: https://supabase.com/dashboard"
    echo "   - Google AI: https://makersuite.google.com/app/apikey"
    echo "   - Groq: https://console.groq.com"
    echo ""
    echo "2. 🗄️ Setup Database:"
    echo "   npm run setup:db"
    echo ""
    echo "3. 🚀 Start Development:"
    echo "   npm run dev"
    echo ""
    echo "4. 📚 Read Documentation:"
    echo "   Visit: http://localhost:3000/docs"
    echo ""
    echo "🔗 Helpful Links:"
    echo "- 📖 Full Setup Guide: FREE-SETUP-GUIDE.md"
    echo "- 🤖 AI APIs Guide: docs/setup/ai-apis.md"
    echo "- 🗄️ Database Guide: docs/setup/database.md"
    echo "- 🚀 Deployment Guide: docs/setup/deployment.md"
    echo ""
    print_info "For help, visit: https://github.com/mrsonly86/ai-automation-platform/issues"
}

# Main execution
main() {
    echo "Starting AI Automation Platform setup..."
    echo ""
    
    check_dependencies
    check_node_version
    install_dependencies
    setup_environment
    setup_tailwind
    setup_nextjs
    create_app_structure
    setup_local_database
    setup_git_hooks
    create_documentation
    
    display_summary
}

# Run main function
main "$@"