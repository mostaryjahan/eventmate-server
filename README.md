# EventMate Server

API server for EventMate event management platform with Prisma ORM and Stripe integration.

## Live Demo

**API Base URL**: [https://eventmate-server-jic3.onrender.com](https://eventmate-server-jic3.onrender.com)

**Frontend Live**: [https://eventmate-brown.vercel.app](https://eventmate-brown.vercel.app)

## Repository

**Server Repository**: `git clone https://github.com/mostaryjahan/eventmate-server.git`

**Frontend Repository**: `git clone https://github.com/mostaryjahan/eventmate-frontend.git`

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Cloudinary
- **Payments**: Stripe API
- **Validation**: Zod schemas

## Quick Start

### Installation
```bash
pnpm install
```

### Environment Setup
Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/eventmate"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
```

### Database Setup
```bash
pnpm db:push
```

### Development
```bash
pnpm dev
```

## API Endpoints

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete documentation.

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## Deployment

1. Build: `pnpm build`
2. Set production environment variables
3. Run migrations: `pnpm db:migrate`
4. Start: `pnpm start`