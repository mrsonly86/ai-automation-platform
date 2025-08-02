# Deployment Guide

## Vietnam Enterprise Management System - Deployment Guide

### 1. Production Environment Setup

#### System Requirements
```
- CPU: 8+ cores (Intel Xeon or AMD EPYC)
- RAM: 32GB+ (64GB recommended for large enterprises)
- Storage: 1TB+ SSD (for database and file storage)
- Network: 1Gbps+ with redundancy
- OS: Ubuntu 20.04 LTS or CentOS 8+
```

#### Infrastructure Components
```
- Load Balancer: nginx or HAProxy
- Application Server: Node.js cluster
- Database: MongoDB replica set
- Cache: Redis cluster
- Message Queue: Redis/RabbitMQ
- File Storage: AWS S3 or MinIO
- Monitoring: Prometheus + Grafana
```

### 2. Database Setup

#### MongoDB Production Configuration
```javascript
// mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1,<your-app-server-ip>
replication:
  replSetName: "enterprise-rs"
security:
  authorization: enabled
```

#### Redis Configuration
```
# redis.conf
bind 127.0.0.1 <your-app-server-ip>
port 6379
requirepass <your-redis-password>
maxmemory 8gb
maxmemory-policy allkeys-lru
```

### 3. Environment Configuration

#### Production .env
```bash
# Application
NODE_ENV=production
PORT=3000
CLUSTER_MODE=true
WORKERS=4

# Database
MONGODB_URI=mongodb://username:password@mongo1:27017,mongo2:27017,mongo3:27017/enterprise?replicaSet=enterprise-rs&authSource=admin
REDIS_URL=redis://:password@redis-cluster:6379

# Security
JWT_SECRET=<your-super-secure-256-bit-secret>
ENCRYPTION_KEY=<your-32-character-encryption-key>
SALT_ROUNDS=14

# Vietnam Payment Integration
VNPAY_TMN_CODE=<your-production-vnpay-code>
VNPAY_HASH_SECRET=<your-production-vnpay-secret>
VNPAY_API_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html

# Enterprise Banking APIs
VIETCOMBANK_API_URL=<production-vietcombank-api>
VIETCOMBANK_CLIENT_ID=<production-client-id>
VIETCOMBANK_CLIENT_SECRET=<production-client-secret>

# Government Integration
TAX_AUTHORITY_API_URL=<production-tax-api>
TAX_AUTHORITY_API_KEY=<production-tax-api-key>

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
NEW_RELIC_LICENSE_KEY=<your-newrelic-key>
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S enterprise -u 1001

WORKDIR /app

COPY --from=builder --chown=enterprise:nodejs /app/dist ./dist
COPY --from=builder --chown=enterprise:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=enterprise:nodejs /app/package.json ./package.json

USER enterprise

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### docker-compose.production.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - enterprise-network

  mongodb:
    image: mongo:5.0
    command: mongod --replSet enterprise-rs --auth
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - enterprise-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - enterprise-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - enterprise-network

volumes:
  mongodb_data:
  redis_data:

networks:
  enterprise-network:
    driver: bridge
```

### 5. Kubernetes Deployment

#### namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: enterprise-management
```

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-app
  namespace: enterprise-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enterprise-app
  template:
    metadata:
      labels:
        app: enterprise-app
    spec:
      containers:
      - name: enterprise-app
        image: enterprise-management:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: enterprise-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: enterprise-secrets
              key: redis-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

### 6. Load Balancer Configuration

#### nginx.conf
```nginx
upstream enterprise_backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name enterprise.yourcompany.vn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name enterprise.yourcompany.vn;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    client_max_body_size 10M;

    location / {
        proxy_pass http://enterprise_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        proxy_pass http://enterprise_backend;
    }
}
```

### 7. Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'enterprise-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 8. Backup Strategy

#### Automated MongoDB Backup
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
DB_NAME="enterprise-management"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mongodump --host mongodb:27017 --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongodb_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Upload to cloud storage (AWS S3)
aws s3 cp $BACKUP_DIR/mongodb_backup_$DATE.tar.gz s3://enterprise-backups/mongodb/

# Keep only last 7 days of local backups
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete
```

### 9. SSL Certificate Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d enterprise.yourcompany.vn

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 10. Security Hardening

#### Firewall Configuration
```bash
# UFW rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from <admin-ip> to any port 27017
sudo ufw enable
```

#### Application Security
```bash
# Install security updates
sudo apt-get update && sudo apt-get upgrade

# Configure fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban

# Setup log monitoring
sudo apt-get install logwatch
```

### 11. Performance Optimization

#### Node.js Optimization
```javascript
// cluster.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  require('./dist/index.js');
}
```

#### MongoDB Optimization
```javascript
// Indexes for performance
db.assets.createIndex({ "companyId": 1, "status": 1 });
db.vehicles.createIndex({ "assignedTo": 1, "status": 1 });
db.facilities.createIndex({ "location": "2dsphere" });
db.transactions.createIndex({ "transactionDate": -1 });
```

### 12. Maintenance Procedures

#### Health Checks
```bash
#!/bin/bash
# health-check.sh

# Check application health
curl -f http://localhost:3000/health || exit 1

# Check MongoDB
mongo --eval "db.adminCommand('ismaster')" || exit 1

# Check Redis
redis-cli ping || exit 1

# Check disk space
df -h | awk '$5 > 80 {print $0}' && exit 1

echo "All health checks passed"
```

#### Log Rotation
```bash
# /etc/logrotate.d/enterprise
/var/log/enterprise/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 enterprise enterprise
    postrotate
        systemctl reload enterprise
    endscript
}
```

This deployment guide provides a comprehensive approach to deploying the Vietnam Enterprise Management System in a production environment with high availability, security, and performance considerations.