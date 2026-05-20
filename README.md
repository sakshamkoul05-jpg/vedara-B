# Vedara Retreat — Backend API

Production-ready Node.js + Express + Prisma backend for Vedara Retreat Hotels management platform.

## Tech Stack

- **Runtime:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + Refresh Tokens, RBAC
- **Payments:** Razorpay
- **Email:** Nodemailer (SMTP)
- **AI:** OpenAI API (GPT-4o-mini)
- **Storage:** Cloudinary
- **Realtime:** Socket.io

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and configure
cp .env.example .env

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Seed database (creates admin user + sample data)
npm run prisma:seed

# Start development server
npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@vedara.com | admin123 |
| Manager | manager@vedara.com | admin123 |

## API Structure

```
GET    /api/health              Health check
POST   /api/auth/login          Login
POST   /api/auth/refresh        Refresh token
GET    /api/auth/profile        Get profile
POST   /api/auth/users          Create user (admin)
PUT    /api/auth/users/:id      Update user (admin)

GET    /api/cottages            List cottages
GET    /api/cottages/:id        Get cottage by ID
GET    /api/cottages/slug/:slug Get cottage by slug

POST   /api/bookings            Create booking
POST   /api/bookings/confirm-payment  Confirm payment
GET    /api/bookings/availability      Check availability
GET    /api/bookings/available-cottages Available cottages
GET    /api/bookings/calendar          Get calendar
GET    /api/bookings/all               All bookings (admin)
POST   /api/bookings/:id/cancel       Cancel booking

GET    /api/cafe/menu           Get cafe menu
POST   /api/cafe/orders         Create cafe order
GET    /api/cafe/kitchen        Kitchen orders
PUT    /api/cafe/orders/:id/status  Update order status

POST   /api/contact             Submit contact form
POST   /api/chatbot/chat        AI chatbot

GET    /api/cms/dashboard       Dashboard stats
GET    /api/cms/settings        Get settings
PUT    /api/cms/settings        Update setting
GET    /api/cms/cottages        List cottages (admin)
PUT    /api/cms/cottages/:id    Update cottage
GET    /api/cms/faqs            List FAQs
POST   /api/cms/faqs            Add FAQ
GET    /api/cms/messages        Contact messages
GET    /api/cms/coupons         List coupons
POST   /api/cms/coupons         Create coupon
```

## Deployment

Configure environment variables on Railway/Render and set `DATABASE_URL` to your Neon PostgreSQL connection string.

```bash
npm run build
npm start
```
