/**
 * Dependency Checker for AI Automation Platform
 * Verifies all required services and configurations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`\n🔄 ${message}`, 'cyan');
}

// Check if environment file exists and has required variables
function checkEnvironment() {
  logStep('Checking environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found');
    logInfo('Run: cp .env.example .env.local');
    return false;
  }
  
  logSuccess('.env.local file exists');
  
  // Read environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Required variables
  const requiredVars = [
    'HUGGINGFACE_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_SECRET'
  ];
  
  // Optional but recommended variables
  const optionalVars = [
    'GOOGLE_AI_API_KEY',
    'GROQ_API_KEY',
    'TOGETHER_API_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allRequired = true;
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === 'your_token_here' || envVars[varName] === '') {
      logError(`Required variable ${varName} is not set`);
      allRequired = false;
    } else {
      logSuccess(`${varName} is configured`);
    }
  });
  
  // Check optional variables
  let optionalCount = 0;
  optionalVars.forEach(varName => {
    if (envVars[varName] && envVars[varName] !== 'your_token_here' && envVars[varName] !== '') {
      logSuccess(`${varName} is configured (optional)`);
      optionalCount++;
    } else {
      logWarning(`${varName} is not configured (optional)`);
    }
  });
  
  if (optionalCount === 0) {
    logWarning('No optional AI providers configured. Consider adding backup providers.');
  }
  
  return allRequired;
}

// Check Node.js and npm versions
function checkNodeVersion() {
  logStep('Checking Node.js version...');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    logError(`Node.js version ${nodeVersion} is too old. Please upgrade to v16 or newer.`);
    return false;
  }
  
  logSuccess(`Node.js version ${nodeVersion} is compatible`);
  
  // Check npm version
  const { execSync } = require('child_process');
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    logSuccess(`npm version ${npmVersion} is available`);
  } catch (error) {
    logError('npm is not available');
    return false;
  }
  
  return true;
}

// Check if required packages are installed
function checkPackages() {
  logStep('Checking installed packages...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    logError('node_modules not found. Run: npm install');
    return false;
  }
  
  logSuccess('node_modules directory exists');
  
  // Check critical dependencies
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js'
  ];
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let allInstalled = true;
  criticalDeps.forEach(dep => {
    if (dependencies[dep]) {
      logSuccess(`${dep} is listed in package.json`);
    } else {
      logError(`${dep} is missing from package.json`);
      allInstalled = false;
    }
  });
  
  return allInstalled;
}

// Check file structure
function checkFileStructure() {
  logStep('Checking file structure...');
  
  const requiredDirs = [
    'lib',
    'lib/ai',
    'lib/database',
    'docs',
    'docs/setup',
    'scripts'
  ];
  
  const requiredFiles = [
    'lib/ai/huggingface.js',
    'lib/ai/ai-provider.js',
    'lib/database/supabase.js',
    'vercel.json',
    'docker-compose.free.yml'
  ];
  
  let allExists = true;
  
  // Check directories
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      logSuccess(`Directory ${dir} exists`);
    } else {
      logError(`Directory ${dir} is missing`);
      allExists = false;
    }
  });
  
  // Check files
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logSuccess(`File ${file} exists`);
    } else {
      logError(`File ${file} is missing`);
      allExists = false;
    }
  });
  
  return allExists;
}

// Test API connections
async function testApiConnections() {
  logStep('Testing API connections...');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const tests = [];
  
  // Test Hugging Face
  if (process.env.HUGGINGFACE_API_KEY) {
    tests.push(testHuggingFace());
  } else {
    logWarning('Hugging Face API key not configured - skipping test');
  }
  
  // Test Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    tests.push(testSupabase());
  } else {
    logWarning('Supabase credentials not configured - skipping test');
  }
  
  // Test Google AI
  if (process.env.GOOGLE_AI_API_KEY) {
    tests.push(testGoogleAI());
  } else {
    logWarning('Google AI API key not configured - skipping test');
  }
  
  // Test Groq
  if (process.env.GROQ_API_KEY) {
    tests.push(testGroq());
  } else {
    logWarning('Groq API key not configured - skipping test');
  }
  
  const results = await Promise.allSettled(tests);
  
  let successCount = 0;
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      successCount++;
    }
  });
  
  if (successCount > 0) {
    logSuccess(`${successCount} API connection(s) working`);
    return true;
  } else {
    logError('No API connections working');
    return false;
  }
}

// Test Hugging Face API
async function testHuggingFace() {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Hello',
        parameters: { max_length: 10 }
      })
    });
    
    if (response.ok) {
      logSuccess('Hugging Face API connection successful');
      return true;
    } else {
      logError(`Hugging Face API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Hugging Face API test failed: ${error.message}`);
    return false;
  }
}

// Test Supabase connection
async function testSupabase() {
  try {
    // Import Supabase dynamically
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test connection by trying to fetch from a system table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (!error || error.code === 'PGRST116') {
      logSuccess('Supabase connection successful');
      return true;
    } else {
      logError(`Supabase connection error: ${error.message}`);
      return false;
    }
  } catch (error) {
    logError(`Supabase test failed: ${error.message}`);
    return false;
  }
}

// Test Google AI
async function testGoogleAI() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
    
    if (response.ok) {
      logSuccess('Google AI API connection successful');
      return true;
    } else {
      logError(`Google AI API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Google AI API test failed: ${error.message}`);
    return false;
  }
}

// Test Groq
async function testGroq() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    
    if (response.ok) {
      logSuccess('Groq API connection successful');
      return true;
    } else {
      logError(`Groq API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Groq API test failed: ${error.message}`);
    return false;
  }
}

// Check Docker availability
function checkDocker() {
  logStep('Checking Docker availability...');
  
  const { execSync } = require('child_process');
  
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
    logSuccess(`Docker is available: ${dockerVersion}`);
    
    // Check if Docker Compose is available
    try {
      const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
      logSuccess(`Docker Compose is available: ${composeVersion}`);
      return true;
    } catch (error) {
      logWarning('Docker Compose not available');
      return false;
    }
  } catch (error) {
    logWarning('Docker not available - local database setup will be skipped');
    return false;
  }
}

// Generate health report
function generateReport(results) {
  logStep('Generating health report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: checkEnvironment(),
    nodeVersion: checkNodeVersion(),
    packages: results.packages,
    fileStructure: results.fileStructure,
    apiConnections: results.apiConnections,
    docker: results.docker,
    overall: true
  };
  
  // Calculate overall health
  report.overall = report.environment && 
                   report.nodeVersion && 
                   report.packages && 
                   report.fileStructure;
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'health-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('\n📊 Health Report Summary:', 'magenta');
  log('========================', 'magenta');
  
  const status = (check) => check ? '✅ PASS' : '❌ FAIL';
  
  console.log(`Environment Config: ${status(report.environment)}`);
  console.log(`Node.js Version: ${status(report.nodeVersion)}`);
  console.log(`Package Dependencies: ${status(report.packages)}`);
  console.log(`File Structure: ${status(report.fileStructure)}`);
  console.log(`API Connections: ${status(report.apiConnections)}`);
  console.log(`Docker Available: ${status(report.docker)}`);
  console.log(`Overall Status: ${status(report.overall)}`);
  
  if (report.overall) {
    logSuccess('\n🎉 All critical checks passed! Your setup is ready.');
  } else {
    logError('\n❌ Some critical checks failed. Please fix the issues above.');
  }
  
  logInfo(`\nDetailed report saved to: health-report.json`);
  
  return report.overall;
}

// Main function
async function main() {
  log('🔍 AI Automation Platform - Dependency Checker', 'cyan');
  log('==============================================', 'cyan');
  
  const results = {};
  
  // Run all checks
  results.packages = checkPackages();
  results.fileStructure = checkFileStructure();
  results.docker = checkDocker();
  
  // API tests (async)
  try {
    results.apiConnections = await testApiConnections();
  } catch (error) {
    logError(`API connection tests failed: ${error.message}`);
    results.apiConnections = false;
  }
  
  // Generate final report
  const success = generateReport(results);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Handle fetch polyfill for Node.js < 18
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logError(`Dependency check failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkEnvironment,
  checkNodeVersion,
  checkPackages,
  checkFileStructure,
  testApiConnections,
  checkDocker,
  generateReport
};