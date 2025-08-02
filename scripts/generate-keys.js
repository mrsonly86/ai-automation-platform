/**
 * Generate secure keys and secrets for AI Automation Platform
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`\n🔄 ${message}`, 'cyan');
}

/**
 * Generate a cryptographically secure random string
 */
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a base64 encoded key
 */
function generateBase64Key(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate a JWT secret
 */
function generateJWTSecret() {
  // JWT secrets should be at least 256 bits (32 bytes)
  return generateSecureKey(32);
}

/**
 * Generate NextAuth secret
 */
function generateNextAuthSecret() {
  // NextAuth requires at least 32 characters
  return generateSecureKey(32);
}

/**
 * Generate database encryption key
 */
function generateDatabaseKey() {
  return generateBase64Key(32);
}

/**
 * Generate session secret
 */
function generateSessionSecret() {
  return generateSecureKey(64);
}

/**
 * Generate API key for internal services
 */
function generateApiKey() {
  const prefix = 'aip_'; // AI Platform prefix
  const key = generateSecureKey(20);
  return prefix + key;
}

/**
 * Generate webhook signing secret
 */
function generateWebhookSecret() {
  return generateSecureKey(32);
}

/**
 * Update environment file with generated keys
 */
function updateEnvironmentFile(keys) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    // Read from .env.example as template
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    }
  }
  
  // Update or add keys
  Object.entries(keys).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (envContent.match(regex)) {
      // Update existing key only if it's empty or placeholder
      const currentMatch = envContent.match(regex);
      if (currentMatch && (
        currentMatch[0].includes('your_') || 
        currentMatch[0].includes('generate') ||
        currentMatch[0].endsWith('=') ||
        currentMatch[0].endsWith('here')
      )) {
        envContent = envContent.replace(regex, `${key}=${value}`);
        logSuccess(`Updated ${key}`);
      } else {
        logInfo(`${key} already has a value - skipping`);
      }
    } else {
      // Add new key
      envContent += `\n${key}=${value}`;
      logSuccess(`Added ${key}`);
    }
  });
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  logSuccess(`Environment file updated: ${envPath}`);
}

/**
 * Generate all required keys
 */
function generateAllKeys() {
  logStep('Generating secure keys and secrets...');
  
  const keys = {
    NEXTAUTH_SECRET: generateNextAuthSecret(),
    JWT_SECRET: generateJWTSecret(),
    SESSION_SECRET: generateSessionSecret(),
    API_KEY: generateApiKey(),
    WEBHOOK_SECRET: generateWebhookSecret(),
    DATABASE_ENCRYPTION_KEY: generateDatabaseKey()
  };
  
  return keys;
}

/**
 * Display generated keys (without revealing the actual values)
 */
function displayKeyInfo(keys) {
  log('\n🔑 Generated Keys:', 'cyan');
  log('================', 'cyan');
  
  Object.entries(keys).forEach(([key, value]) => {
    const preview = value.substring(0, 8) + '...';
    const length = value.length;
    console.log(`${key}: ${preview} (${length} chars)`);
  });
  
  log('\n🛡️  Security Notes:', 'yellow');
  console.log('- Keep these secrets secure and never commit them to version control');
  console.log('- Rotate secrets regularly in production');
  console.log('- Use different secrets for different environments');
  console.log('- Store production secrets in your deployment platform\'s environment variables');
}

/**
 * Create a secrets backup file
 */
function createSecretsBackup(keys) {
  const backupDir = path.join(process.cwd(), '.secrets');
  const backupFile = path.join(backupDir, `secrets-${Date.now()}.json`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Create backup
  const backup = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    keys: keys
  };
  
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  
  // Add .secrets to .gitignore if not already there
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.secrets')) {
      fs.appendFileSync(gitignorePath, '\n# Secret backups\n.secrets/\n');
      logSuccess('Added .secrets/ to .gitignore');
    }
  }
  
  logInfo(`Backup created: ${backupFile}`);
}

/**
 * Validate generated keys
 */
function validateKeys(keys) {
  logStep('Validating generated keys...');
  
  const validations = [
    {
      key: 'NEXTAUTH_SECRET',
      test: (value) => value.length >= 32,
      message: 'NextAuth secret must be at least 32 characters'
    },
    {
      key: 'JWT_SECRET',
      test: (value) => value.length >= 32,
      message: 'JWT secret must be at least 32 characters'
    },
    {
      key: 'SESSION_SECRET',
      test: (value) => value.length >= 64,
      message: 'Session secret should be at least 64 characters'
    },
    {
      key: 'API_KEY',
      test: (value) => value.startsWith('aip_') && value.length > 20,
      message: 'API key should have correct format and length'
    }
  ];
  
  let allValid = true;
  
  validations.forEach(({ key, test, message }) => {
    if (keys[key] && test(keys[key])) {
      logSuccess(`${key} validation passed`);
    } else {
      log(`❌ ${key} validation failed: ${message}`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

/**
 * Generate deployment-specific keys
 */
function generateDeploymentKeys() {
  logStep('Generating deployment-specific configurations...');
  
  const deployments = {
    vercel: {
      VERCEL_TOKEN: 'Get from https://vercel.com/account/tokens',
      VERCEL_ORG_ID: 'Get from Vercel project settings',
      VERCEL_PROJECT_ID: 'Get from Vercel project settings'
    },
    railway: {
      RAILWAY_TOKEN: 'Get from https://railway.app/account/tokens'
    },
    render: {
      RENDER_API_KEY: 'Get from https://dashboard.render.com/account/api-keys'
    }
  };
  
  log('\n🚀 Deployment Configuration:', 'cyan');
  log('============================', 'cyan');
  
  Object.entries(deployments).forEach(([platform, vars]) => {
    console.log(`\n${platform.toUpperCase()}:`);
    Object.entries(vars).forEach(([key, instruction]) => {
      console.log(`  ${key}: ${instruction}`);
    });
  });
}

/**
 * Main function
 */
function main() {
  log('🔐 AI Automation Platform - Key Generator', 'cyan');
  log('=========================================', 'cyan');
  
  try {
    // Generate all keys
    const keys = generateAllKeys();
    
    // Validate keys
    const valid = validateKeys(keys);
    
    if (!valid) {
      throw new Error('Key validation failed');
    }
    
    // Update environment file
    updateEnvironmentFile(keys);
    
    // Display information
    displayKeyInfo(keys);
    
    // Create backup
    createSecretsBackup(keys);
    
    // Show deployment info
    generateDeploymentKeys();
    
    log('\n🎉 Key generation completed successfully!', 'green');
    log('\n📋 Next Steps:', 'cyan');
    console.log('1. Review the updated .env.local file');
    console.log('2. Add your API keys for external services');
    console.log('3. Test your configuration with: npm run setup:check');
    console.log('4. Start development: npm run dev');
    
  } catch (error) {
    log(`❌ Key generation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * CLI options
 */
function handleCLI() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔐 AI Platform Key Generator

Usage: node scripts/generate-keys.js [options]

Options:
  --help, -h          Show this help message
  --nextauth-only     Generate only NextAuth secret
  --jwt-only          Generate only JWT secret
  --all               Generate all keys (default)
  --backup            Create backup without updating .env.local
  --validate          Validate existing keys in .env.local

Examples:
  node scripts/generate-keys.js                    # Generate all keys
  node scripts/generate-keys.js --nextauth-only    # Generate only NextAuth secret
  node scripts/generate-keys.js --backup           # Create backup only
    `);
    process.exit(0);
  }
  
  if (args.includes('--nextauth-only')) {
    const keys = { NEXTAUTH_SECRET: generateNextAuthSecret() };
    updateEnvironmentFile(keys);
    logSuccess('NextAuth secret generated');
    process.exit(0);
  }
  
  if (args.includes('--jwt-only')) {
    const keys = { JWT_SECRET: generateJWTSecret() };
    updateEnvironmentFile(keys);
    logSuccess('JWT secret generated');
    process.exit(0);
  }
  
  if (args.includes('--backup')) {
    const keys = generateAllKeys();
    createSecretsBackup(keys);
    logSuccess('Backup created without updating environment');
    process.exit(0);
  }
  
  if (args.includes('--validate')) {
    validateExistingKeys();
    process.exit(0);
  }
  
  // Default: generate all keys
  main();
}

/**
 * Validate existing keys in .env.local
 */
function validateExistingKeys() {
  logStep('Validating existing keys...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found', 'red');
    process.exit(1);
  }
  
  require('dotenv').config({ path: envPath });
  
  const keys = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    API_KEY: process.env.API_KEY
  };
  
  const valid = validateKeys(keys);
  
  if (valid) {
    logSuccess('All existing keys are valid');
  } else {
    log('❌ Some keys need to be regenerated', 'red');
    process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  handleCLI();
}

module.exports = {
  generateSecureKey,
  generateBase64Key,
  generateJWTSecret,
  generateNextAuthSecret,
  generateAllKeys,
  validateKeys,
  updateEnvironmentFile
};