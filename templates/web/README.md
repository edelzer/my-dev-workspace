# React Web Template

Modern React application template with TypeScript, Vite, and comprehensive tooling for rapid development.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **ESLint** with TypeScript and security rules
- **Prettier** for code formatting
- **Vitest** for unit testing with TDD support
- **Playwright** for E2E testing
- **Docker** support with Nginx for production deployment
- **Security-first** configurations (CSP, HTTPS, security headers)

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm run test          # Run tests once
   npm run test:watch    # Watch mode
   npm run test:ui       # Interactive UI
   ```

4. **Lint and format:**
   ```bash
   npm run lint          # Check code quality
   npm run format        # Format code
   ```

### Production Build

```bash
npm run build         # Build for production
npm run preview       # Preview production build
```

## Docker Deployment

### Quick Start with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t react-web-app .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 80:80 --name web-app react-web-app
   ```

3. **Access the application:**
   Open http://localhost in your browser

4. **View logs:**
   ```bash
   docker logs -f web-app
   ```

5. **Stop and remove:**
   ```bash
   docker stop web-app && docker rm web-app
   ```

### Docker Compose

1. **Start all services:**
   ```bash
   docker compose up -d
   ```

2. **View logs:**
   ```bash
   docker compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker compose down
   ```

4. **Rebuild and restart:**
   ```bash
   docker compose up -d --build
   ```

### Environment Variables

Vite environment variables are embedded at **build time**, not runtime.

**Create `.env` file:**
```env
VITE_APP_NAME=React Web App
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=production
```

**Note**: Changes to `.env` require rebuilding the Docker image.

### Production Deployment

#### AWS ECS/Fargate

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Build and push
docker build -t react-web-app .
docker tag react-web-app:latest YOUR_ECR_URL/react-web-app:latest
docker push YOUR_ECR_URL/react-web-app:latest

# Deploy using ECS task definition
aws ecs update-service --cluster your-cluster --service react-web-app --force-new-deployment
```

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/react-web-app

# Deploy to Cloud Run
gcloud run deploy react-web-app \
  --image gcr.io/PROJECT_ID/react-web-app \
  --platform managed \
  --port 80 \
  --allow-unauthenticated
```

#### Azure Container Apps

```bash
# Build and push to ACR
az acr build --registry YOUR_ACR --image react-web-app:latest .

# Deploy to Container Apps
az containerapp create \
  --name react-web-app \
  --resource-group YOUR_RG \
  --image YOUR_ACR.azurecr.io/react-web-app:latest \
  --target-port 80 \
  --ingress external
```

#### DigitalOcean App Platform

```bash
# Push to DigitalOcean Container Registry
doctl registry login
docker tag react-web-app:latest registry.digitalocean.com/YOUR_REGISTRY/react-web-app:latest
docker push registry.digitalocean.com/YOUR_REGISTRY/react-web-app:latest

# Deploy via DigitalOcean UI or doctl
```

### Docker Configuration Details

#### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:
- **Stage 1**: Build React app with Node.js (builder)
- **Stage 2**: Serve with Nginx (production)

**Expected image size**: ~25MB (final image)

#### Nginx Configuration

- **SPA Routing**: All routes fallback to `index.html`
- **Gzip Compression**: Enabled for text files
- **Static Asset Caching**: 1-year expiry for immutable files
- **Security Headers**: Comprehensive OWASP headers
- **Health Check**: `/health` endpoint returns 200

#### Security Features

✅ Non-root user (nginx:1001)
✅ Security headers (X-Frame-Options, CSP, etc.)
✅ Hidden file access denied
✅ Server tokens disabled
✅ Minimal attack surface

### Troubleshooting

#### Build Issues

**Problem**: Build fails at `npm run build`
**Solution**: Check Vite configuration, ensure all dependencies are installed

**Problem**: `dist` directory not found
**Solution**: Verify Vite output directory in `vite.config.ts`

#### Runtime Issues

**Problem**: 404 errors on page refresh
**Solution**: Ensure `try_files $uri $uri/ /index.html;` is in nginx.conf (already configured)

**Problem**: Assets not loading
**Solution**: Check Content-Security-Policy in `nginx-security.conf`, adjust if needed

**Problem**: API calls failing
**Solution**:
- Check CORS configuration on backend
- Verify `VITE_API_URL` is correct
- Ensure API is accessible from container network

**Problem**: Container health check failing
**Solution**: Check logs with `docker logs web-app`, ensure port 80 is accessible

### Health Checks

**Docker health check:**
```bash
# Automatic check every 30 seconds
docker inspect --format='{{json .State.Health}}' web-app
```

**Manual health check:**
```bash
curl http://localhost/health
# Expected response: "healthy"
```

### Performance Optimization

**Build optimization:**
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t react-web-app .
```

**Runtime optimization:**
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ Access logs disabled for static assets
- ✅ HTTP/2 support (when using HTTPS)

**Image size optimization:**
- ✅ Multi-stage build (builder discarded)
- ✅ Alpine base images
- ✅ npm cache cleaned
- ✅ Production dependencies only

### Security Scanning

**Scan for vulnerabilities:**
```bash
# Docker Scout (built-in)
docker scout cves react-web-app:latest

# Trivy (install separately)
trivy image react-web-app:latest
```

## Project Structure

```
web/
├── src/                # Source code
│   ├── components/    # React components
│   ├── styles/        # CSS/SCSS files
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── nginx.conf         # Nginx web server configuration
├── nginx-security.conf # Security headers configuration
├── .dockerignore      # Docker build exclusions
├── vite.config.ts     # Vite configuration
├── vitest.config.ts   # Vitest configuration
├── playwright.config.ts # Playwright configuration
└── package.json       # Dependencies and scripts
```

## Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Open Vitest UI
npm run test:e2e       # Run E2E tests with Playwright
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

## Testing

### Unit Testing (Vitest)

```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:ui        # Interactive UI
npm run test:coverage  # Generate coverage report
```

### E2E Testing (Playwright)

```bash
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Run with UI mode
npm run test:e2e:debug # Debug mode
```

## Configuration

### Vite Configuration

See `vite.config.ts` for build and development server settings.

### TypeScript Configuration

- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.node.json` - Node.js specific configuration

### ESLint Configuration

See `.eslintrc.cjs` for linting rules including:
- TypeScript rules
- React rules
- Security rules
- Accessibility rules

### Prettier Configuration

See `.prettierrc.cjs` for code formatting rules.

## Development Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Develop with TDD:**
   - Write failing test
   - Implement feature
   - Ensure test passes
   - Refactor if needed

3. **Lint and format:**
   ```bash
   npm run lint
   npm run format
   ```

4. **Run all tests:**
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **Build and test Docker image:**
   ```bash
   docker build -t react-web-app .
   docker run -d -p 80:80 react-web-app
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

## Documentation

For more comprehensive guides, see:
- [Docker Deployment Guide](../../docs/DOCKER-GUIDE.md)
- [Security Best Practices](../../docs/SECURITY.md)
- [Testing Strategies](../../docs/TESTING.md)

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check troubleshooting section above
- Review documentation in `docs/`
- Create an issue in the repository
