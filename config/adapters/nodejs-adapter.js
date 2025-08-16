/**
 * Node.js/TypeScript Configuration Adapter
 * 
 * Converts the unified configuration schema to Node.js/Express compatible format
 * Supports environment variables, dotenv, and runtime configuration validation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class NodeJSConfigAdapter {
  constructor(options = {}) {
    this.options = {
      envPrefix: 'APP_',
      envFile: '.env',
      validateSchema: true,
      ...options
    };
  }

  /**
   * Generate Node.js configuration from unified config
   * @param {Object} unifiedConfig - The unified configuration object
   * @param {string} environment - Target environment (development, testing, staging, production)
   * @returns {Object} Node.js compatible configuration
   */
  generateConfig(unifiedConfig, environment = 'development') {
    const config = {
      // Application settings
      app: {
        name: unifiedConfig.application.name,
        version: unifiedConfig.application.version,
        environment: environment,
        debug: unifiedConfig.application.debug || (environment === 'development'),
        description: unifiedConfig.application.description
      },

      // Server configuration
      server: {
        host: unifiedConfig.server.host || '0.0.0.0',
        port: parseInt(process.env.PORT) || unifiedConfig.server.port || 8000,
        contextPath: unifiedConfig.server.contextPath || '',
        compression: unifiedConfig.server.compression || { enabled: true, threshold: 1024 },
        timeouts: unifiedConfig.server.timeouts || {
          connection: 30000,
          request: 60000,
          keepAlive: 5000
        }
      },

      // Database configuration (for Prisma, Sequelize, etc.)
      database: {
        url: process.env.DATABASE_URL || unifiedConfig.database.url,
        options: {
          pool: {
            max: unifiedConfig.database.pool?.size || 20,
            min: unifiedConfig.database.pool?.minIdle || 5,
            idle: unifiedConfig.database.pool?.timeout * 1000 || 30000,
            acquire: unifiedConfig.database.pool?.timeout * 1000 || 30000,
            evict: unifiedConfig.database.pool?.maxLifetime * 1000 || 1800000
          },
          logging: environment === 'development',
          dialectOptions: environment === 'production' ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          } : {}
        }
      },

      // Redis/Cache configuration
      cache: this.generateCacheConfig(unifiedConfig.cache),

      // Security configuration
      security: this.generateSecurityConfig(unifiedConfig.security),

      // CORS configuration
      cors: {
        origin: unifiedConfig.cors.allowedOrigins || ['http://localhost:3000'],
        methods: unifiedConfig.cors.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: unifiedConfig.cors.allowedHeaders || ['Origin', 'Content-Type', 'Accept', 'Authorization'],
        credentials: unifiedConfig.cors.allowCredentials !== false,
        optionsSuccessStatus: 200,
        maxAge: unifiedConfig.cors.maxAge || 3600
      },

      // Rate limiting (for express-rate-limit)
      rateLimit: this.generateRateLimitConfig(unifiedConfig.rateLimiting),

      // Logging configuration (for Winston)
      logging: this.generateLoggingConfig(unifiedConfig.logging, environment),

      // Monitoring configuration
      monitoring: unifiedConfig.monitoring || {
        metrics: { enabled: true, endpoint: '/metrics' },
        healthCheck: { enabled: true, endpoint: '/health' }
      },

      // External services
      external: {
        email: this.generateEmailConfig(unifiedConfig.external?.email),
        storage: this.generateStorageConfig(unifiedConfig.external?.storage)
      },

      // Feature flags
      features: unifiedConfig.features || {},

      // API configuration
      api: {
        version: unifiedConfig.api?.version || 'v1',
        basePath: `/api/${unifiedConfig.api?.version || 'v1'}`,
        documentation: {
          title: unifiedConfig.api?.title || `${unifiedConfig.application.name} API`,
          description: unifiedConfig.api?.description || '',
          version: unifiedConfig.application.version,
          contact: unifiedConfig.api?.contact || {},
          license: unifiedConfig.api?.license || { name: 'MIT' }
        },
        pagination: unifiedConfig.api?.pagination || { defaultSize: 20, maxSize: 100 }
      },

      // Validation configuration (for express-validator, joi)
      validation: {
        options: {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        },
        limits: {
          json: unifiedConfig.validation?.maxRequestSize || '1mb',
          urlencoded: { limit: unifiedConfig.validation?.maxRequestSize || '1mb', extended: true },
          text: unifiedConfig.validation?.maxRequestSize || '1mb'
        },
        fileUpload: unifiedConfig.validation?.fileUpload || {
          maxFileSize: '10MB',
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.txt'],
          maxFiles: 5
        }
      }
    };

    return config;
  }

  /**
   * Generate cache configuration for Node.js
   */
  generateCacheConfig(cacheConfig) {
    if (!cacheConfig || cacheConfig.type === 'none') {
      return { enabled: false };
    }

    const config = {
      enabled: true,
      type: cacheConfig.type || 'redis',
      ttl: cacheConfig.ttl || 3600
    };

    if (cacheConfig.type === 'redis') {
      config.redis = {
        host: cacheConfig.host || 'localhost',
        port: cacheConfig.port || 6379,
        password: process.env.REDIS_PASSWORD || cacheConfig.password,
        db: cacheConfig.database || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        ...cacheConfig.pool && {
          pool: {
            max: cacheConfig.pool.maxActive || 20,
            min: cacheConfig.pool.minIdle || 5
          }
        }
      };
    }

    return config;
  }

  /**
   * Generate security configuration for Node.js
   */
  generateSecurityConfig(securityConfig) {
    return {
      // JWT configuration
      jwt: {
        secret: process.env.JWT_SECRET || securityConfig.jwt?.secret,
        algorithm: securityConfig.jwt?.algorithm || 'HS256',
        expiresIn: `${securityConfig.jwt?.accessTokenExpiry || 3600}s`,
        refreshExpiresIn: `${securityConfig.jwt?.refreshTokenExpiry || 604800}s`,
        issuer: process.env.JWT_ISSUER || 'my-app',
        audience: process.env.JWT_AUDIENCE || 'my-app-users'
      },

      // Password hashing (for bcrypt)
      password: {
        saltRounds: securityConfig.password?.hashRounds || 12,
        minLength: securityConfig.password?.minLength || 8,
        requirements: {
          uppercase: securityConfig.password?.requireUppercase !== false,
          lowercase: securityConfig.password?.requireLowercase !== false,
          numbers: securityConfig.password?.requireNumbers !== false,
          symbols: securityConfig.password?.requireSpecialChars !== false
        }
      },

      // Session configuration (for express-session)
      session: {
        secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: (securityConfig.session?.timeout || 1800) * 1000,
          sameSite: 'strict'
        },
        name: 'sessionId'
      },

      // Helmet configuration for security headers
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
          }
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      }
    };
  }

  /**
   * Generate rate limiting configuration for express-rate-limit
   */
  generateRateLimitConfig(rateLimitConfig) {
    if (!rateLimitConfig?.enabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      global: {
        windowMs: (rateLimitConfig.global?.window || 60) * 1000,
        max: rateLimitConfig.global?.requests || 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.'
          });
        }
      },
      auth: {
        windowMs: (rateLimitConfig.auth?.window || 60) * 1000,
        max: rateLimitConfig.auth?.requests || 10,
        skipSuccessfulRequests: true
      },
      api: {
        windowMs: (rateLimitConfig.api?.window || 3600) * 1000,
        max: rateLimitConfig.api?.requests || 1000
      }
    };
  }

  /**
   * Generate logging configuration for Winston
   */
  generateLoggingConfig(loggingConfig, environment) {
    const config = {
      level: loggingConfig?.level?.toLowerCase() || 'info',
      format: loggingConfig?.format || 'json',
      transports: []
    };

    // Console transport
    if (loggingConfig?.console?.enabled !== false) {
      config.transports.push({
        type: 'console',
        options: {
          colorize: loggingConfig?.console?.colorize !== false && environment === 'development',
          format: environment === 'development' ? 'simple' : 'json'
        }
      });
    }

    // File transport
    if (loggingConfig?.file?.enabled !== false) {
      config.transports.push({
        type: 'file',
        options: {
          filename: loggingConfig?.file?.path || 'logs/application.log',
          maxsize: this.parseSize(loggingConfig?.file?.maxSize || '10MB'),
          maxFiles: loggingConfig?.file?.maxFiles || 30,
          tailable: true,
          format: 'json'
        }
      });
    }

    return config;
  }

  /**
   * Generate email configuration
   */
  generateEmailConfig(emailConfig) {
    if (!emailConfig?.enabled) {
      return { enabled: false };
    }

    const config = {
      enabled: true,
      from: emailConfig.from || 'noreply@example.com',
      provider: emailConfig.provider || 'smtp'
    };

    if (emailConfig.provider === 'smtp') {
      config.smtp = {
        host: process.env.SMTP_HOST || emailConfig.smtp?.host,
        port: parseInt(process.env.SMTP_PORT) || emailConfig.smtp?.port || 587,
        secure: emailConfig.smtp?.secure || false,
        auth: {
          user: process.env.SMTP_USERNAME || emailConfig.smtp?.username,
          pass: process.env.SMTP_PASSWORD || emailConfig.smtp?.password
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      };
    }

    return config;
  }

  /**
   * Generate storage configuration
   */
  generateStorageConfig(storageConfig) {
    const config = {
      type: storageConfig?.type || 'local'
    };

    if (config.type === 'local') {
      config.local = {
        destination: storageConfig?.local?.path || 'uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      };
    } else if (config.type === 's3') {
      config.s3 = {
        bucket: process.env.S3_BUCKET || storageConfig?.s3?.bucket,
        region: process.env.AWS_REGION || storageConfig?.s3?.region || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || storageConfig?.s3?.accessKeyId,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || storageConfig?.s3?.secretAccessKey
      };
    }

    return config;
  }

  /**
   * Generate environment file content
   */
  generateEnvFile(unifiedConfig, environment = 'development') {
    const envVars = [];

    // Application
    envVars.push(`# Application Configuration`);
    envVars.push(`NODE_ENV=${environment}`);
    envVars.push(`APP_NAME=${unifiedConfig.application.name}`);
    envVars.push(`APP_VERSION=${unifiedConfig.application.version}`);
    envVars.push(`APP_DEBUG=${unifiedConfig.application.debug || environment === 'development'}`);
    envVars.push('');

    // Server
    envVars.push(`# Server Configuration`);
    envVars.push(`PORT=${unifiedConfig.server.port || 8000}`);
    envVars.push(`HOST=${unifiedConfig.server.host || '0.0.0.0'}`);
    envVars.push('');

    // Database
    envVars.push(`# Database Configuration`);
    envVars.push(`DATABASE_URL=${unifiedConfig.database.url}`);
    envVars.push('');

    // Cache/Redis
    if (unifiedConfig.cache?.type === 'redis') {
      envVars.push(`# Redis Configuration`);
      envVars.push(`REDIS_HOST=${unifiedConfig.cache.host || 'localhost'}`);
      envVars.push(`REDIS_PORT=${unifiedConfig.cache.port || 6379}`);
      envVars.push(`REDIS_PASSWORD=`);
      envVars.push(`REDIS_DATABASE=${unifiedConfig.cache.database || 0}`);
      envVars.push('');
    }

    // Security
    envVars.push(`# Security Configuration`);
    envVars.push(`JWT_SECRET=${this.generateSecretKey()}`);
    envVars.push(`SESSION_SECRET=${this.generateSecretKey()}`);
    envVars.push('');

    // External services
    if (unifiedConfig.external?.email?.enabled) {
      envVars.push(`# Email Configuration`);
      envVars.push(`SMTP_HOST=`);
      envVars.push(`SMTP_PORT=587`);
      envVars.push(`SMTP_USERNAME=`);
      envVars.push(`SMTP_PASSWORD=`);
      envVars.push('');
    }

    if (unifiedConfig.external?.storage?.type === 's3') {
      envVars.push(`# AWS S3 Configuration`);
      envVars.push(`AWS_ACCESS_KEY_ID=`);
      envVars.push(`AWS_SECRET_ACCESS_KEY=`);
      envVars.push(`AWS_REGION=us-east-1`);
      envVars.push(`S3_BUCKET=`);
      envVars.push('');
    }

    return envVars.join('\n');
  }

  /**
   * Generate package.json scripts for configuration management
   */
  generatePackageScripts() {
    return {
      "config:validate": "node scripts/validate-config.js",
      "config:generate": "node scripts/generate-config.js",
      "config:migrate": "node scripts/migrate-config.js",
      "config:encrypt": "node scripts/encrypt-secrets.js",
      "config:decrypt": "node scripts/decrypt-secrets.js"
    };
  }

  /**
   * Helper methods
   */
  parseSize(sizeStr) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (!match) return 1024 * 1024; // Default to 1MB
    return Math.floor(parseFloat(match[1]) * units[match[2].toUpperCase()]);
  }

  generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = NodeJSConfigAdapter;