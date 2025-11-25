# Backend

NestJS backend application for PDQ.

## Prerequisites

- Node.js
- npm
- Docker (for PostgreSQL)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL database using Docker:
```bash
docker run --name pdq -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
