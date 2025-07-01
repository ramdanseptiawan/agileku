# LMS Backend Makefile

.PHONY: help build run test clean docker-up docker-down docker-build install deps

# Default target
help:
	@echo "Available commands:"
	@echo "  build        - Build the Go application"
	@echo "  run          - Run the application locally"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  install      - Install dependencies"
	@echo "  deps         - Download and tidy dependencies"
	@echo "  docker-up    - Start services with Docker Compose"
	@echo "  docker-down  - Stop Docker Compose services"
	@echo "  docker-build - Build Docker image"
	@echo "  db-setup     - Setup PostgreSQL database"
	@echo "  dev          - Start development environment"

# Build the application
build:
	@echo "Building LMS Backend..."
	go build -o bin/lms-backend .

# Run the application
run:
	@echo "Starting LMS Backend..."
	go run .

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf bin/
	rm -rf uploads/*
	go clean

# Install dependencies
install: deps

# Download and tidy dependencies
deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Start services with Docker Compose
docker-up:
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker Compose services..."
	docker-compose down

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t lms-backend .

# Setup PostgreSQL database (local)
db-setup:
	@echo "Setting up PostgreSQL database..."
	@echo "Make sure PostgreSQL is running and execute:"
	@echo "CREATE DATABASE lms;"
	@echo "CREATE USER test WITH PASSWORD 'test';"
	@echo "GRANT ALL PRIVILEGES ON DATABASE lms TO test;"

# Start development environment
dev: deps
	@echo "Starting development environment..."
	@echo "Make sure PostgreSQL is running on localhost:5432"
	@echo "Database: lms, User: test, Password: test"
	go run .

# Start with Docker (full stack)
docker-dev:
	@echo "Starting full development stack with Docker..."
	docker-compose up --build

# View logs
logs:
	docker-compose logs -f backend

# Database shell
db-shell:
	docker-compose exec postgres psql -U test -d lms

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# Generate API documentation (requires swag)
docs:
	swag init

# Hot reload (requires air)
dev-watch:
	air

# Production build
prod-build:
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w -s' -o bin/lms-backend .

# Create uploads directory
setup-dirs:
	mkdir -p uploads
	mkdir -p bin