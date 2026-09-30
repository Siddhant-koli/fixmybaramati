# FixMyBaramati

A mobile-first civic issue reporting and resolution platform for citizens of Baramati, Maharashtra.

## Project Overview

FixMyBaramati enables citizens to report civic problems like potholes, garbage, street lights, and water issues. Administrators can track, manage, and resolve these issues.

### Key Features
- Report civic issues with photos and location
- Track report status in real-time
- View issues on interactive map
- Admin dashboard for issue management
- Multi-language support (English & Marathi)
- Mobile-first responsive design
- PWA support for offline functionality

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Leaflet + OpenStreetMap
- **Authentication**: JWT (planned)

## Project Structure

```
src/
├── app/              # Next.js pages and layouts
├── components/       # Reusable React components
├── lib/             # Utilities and helpers
├── types/           # TypeScript type definitions
├── api/             # API routes (Phase 2+)
└── public/          # Static assets
```

## Development Phases

1. **Phase 1**: Project setup & UI foundation (CURRENT)
2. **Phase 2**: Citizen frontend
3. **Phase 3**: Database & Prisma
4. **Phase 4**: Authentication
5. **Phase 5**: Report creation
6. **Phase 6**: Report listing & tracking
7. **Phase 7**: Maps & location
8. **Phase 8**: Admin dashboard
9. **Phase 9**: PWA & offline support
10. **Phase 10**: Testing & security
11. **Phase 11**: GitHub workflow
12. **Phase 12**: Production database
13. **Phase 13**: Vercel deployment
14. **Phase 14**: Production testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (for Phase 3+)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Security Guidelines

- ✅ Never expose passwords
- ✅ Hash passwords before storage
- ✅ Use environment variables for secrets
- ✅ Validate all API input
- ✅ Protect admin routes
- ✅ Don't hard-code credentials

## Development Rules

1. Never delete files unless necessary
2. Don't upgrade major dependencies without approval
3. Don't use mock data as primary database
4. Use PostgreSQL from the start
5. Keep code mobile-first responsive
6. Use clear, beginner-friendly code
7. Maintain TypeScript type safety
