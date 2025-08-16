# Go API Makefile

# Variables
APP_NAME := go-api
VERSION := $(shell git describe --tags --always --dirty)
BUILD_TIME := $(shell date +%Y-%m-%dT%H:%M:%S)
GO_VERSION := $(shell go version | awk '{print $$3}')
BINARY_NAME := app
DOCKER_IMAGE := $(APP_NAME):$(VERSION)

# Build flags
LDFLAGS := -ldflags "-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.GoVersion=$(GO_VERSION)"

# Default target
.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
.PHONY: dev
dev: ## Start development server with hot reload
	@echo "Starting development server..."
	air

.PHONY: run
run: ## Run the application
	@echo "Running application..."
	go run $(LDFLAGS) ./cmd/server

.PHONY: build
build: ## Build the application
	@echo "Building application..."
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o $(BINARY_NAME) ./cmd/server

.PHONY: build-local
build-local: ## Build for local OS
	@echo "Building for local OS..."
	go build $(LDFLAGS) -o $(BINARY_NAME) ./cmd/server

# Testing
.PHONY: test
test: ## Run tests
	@echo "Running tests..."
	go test -v -race -coverprofile=coverage.out ./...

.PHONY: test-cover
test-cover: test ## Run tests with coverage report
	@echo "Generating coverage report..."
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo "Running integration tests..."
	go test -v -tags=integration ./tests/integration/...

.PHONY: benchmark
benchmark: ## Run benchmarks
	@echo "Running benchmarks..."
	go test -bench=. -benchmem ./...

# Code Quality
.PHONY: lint
lint: ## Run linters
	@echo "Running linters..."
	golangci-lint run

.PHONY: fmt
fmt: ## Format code
	@echo "Formatting code..."
	gofmt -s -w .
	goimports -w .

.PHONY: vet
vet: ## Run go vet
	@echo "Running go vet..."
	go vet ./...

.PHONY: mod-tidy
mod-tidy: ## Tidy go modules
	@echo "Tidying go modules..."
	go mod tidy

.PHONY: mod-download
mod-download: ## Download go modules
	@echo "Downloading go modules..."
	go mod download

# Security
.PHONY: security
security: ## Run security checks
	@echo "Running security checks..."
	gosec ./...
	nancy sleuth

.PHONY: vuln-check
vuln-check: ## Check for vulnerabilities
	@echo "Checking for vulnerabilities..."
	govulncheck ./...

# Database
.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	go run ./cmd/migrate up

.PHONY: db-rollback
db-rollback: ## Rollback database migration
	@echo "Rolling back database migration..."
	go run ./cmd/migrate down

.PHONY: db-reset
db-reset: ## Reset database
	@echo "Resetting database..."
	go run ./cmd/migrate reset

.PHONY: db-seed
db-seed: ## Seed database with test data
	@echo "Seeding database..."
	go run ./cmd/seed

# Docker
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE) .

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

.PHONY: docker-compose-up
docker-compose-up: ## Start services with docker-compose
	@echo "Starting services with docker-compose..."
	docker-compose up -d

.PHONY: docker-compose-down
docker-compose-down: ## Stop services with docker-compose
	@echo "Stopping services with docker-compose..."
	docker-compose down

.PHONY: docker-compose-logs
docker-compose-logs: ## View docker-compose logs
	docker-compose logs -f

# Production
.PHONY: build-prod
build-prod: ## Build for production
	@echo "Building for production..."
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
		-ldflags="-w -s $(LDFLAGS)" \
		-a -installsuffix cgo \
		-o $(BINARY_NAME) ./cmd/server

.PHONY: deploy
deploy: build-prod docker-build ## Build and deploy
	@echo "Deploying application..."
	# Add your deployment commands here

# Cleanup
.PHONY: clean
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -f $(BINARY_NAME)
	rm -f coverage.out coverage.html
	go clean -cache
	docker system prune -f

# CI/CD
.PHONY: ci
ci: mod-download vet lint test security ## Run CI pipeline
	@echo "CI pipeline completed successfully"

.PHONY: install-tools
install-tools: ## Install development tools
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	go install github.com/sonatypecommunity/nancy@latest
	go install golang.org/x/vuln/cmd/govulncheck@latest

# Environment setup
.PHONY: setup
setup: install-tools mod-download ## Setup development environment
	@echo "Setting up development environment..."
	cp .env.example .env
	@echo "Development environment setup complete!"
	@echo "Please edit .env file with your configuration"

# Generate
.PHONY: generate
generate: ## Run go generate
	@echo "Running go generate..."
	go generate ./...

.PHONY: swagger
swagger: ## Generate Swagger documentation
	@echo "Generating Swagger documentation..."
	swag init -g ./cmd/server/main.go

# Health check
.PHONY: health
health: ## Check application health
	@echo "Checking application health..."
	curl -f http://localhost:8080/health || exit 1

# All quality checks
.PHONY: check
check: fmt vet lint test security ## Run all quality checks
	@echo "All quality checks passed!"