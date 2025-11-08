# NDT Suite V2 - Enterprise NDT Management Platform

Complete rebuild of the NDT-SUITE-UMBER platform with modern technologies and enterprise-grade architecture.

## 🎯 Project Overview

This is a **comprehensive rebuild** of the NDT inspection management system, transforming a 50k LOC vanilla JavaScript application into a 300k+ LOC enterprise platform with:

- **Multi-tenant architecture** with organization-level data isolation
- **Role-based access control** (RBAC) for fine-grained permissions
- **Compliance-ready** for ASNT SNT-TC-1A, ISO 9712, ASME, AWS, API standards
- **Microservices backend** with independent scalability
- **Modern frontend** with React 19 and TypeScript
- **Comprehensive QMS** (Quality Management System)
- **Mobile application** for field inspectors (Phase 5)

### 📊 Project Status

- **Current Phase**: Phase 1 - Foundation & Core Infrastructure
- **Timeline**: 12-14 months (5 phases)
- **Progress**: Week 1 - Project Setup ✅

## 🏗️ Architecture

### Monorepo Structure (Turborepo)

```
ndt-suite-v2/
├── apps/
│   ├── web/                    # React 19 frontend
│   └── mobile/                 # React Native app (Phase 5)
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   ├── ndt-calculations/       # Calculation engine library
│   └── ui-components/          # Shared UI components
├── services/
│   ├── api-gateway/            # Central API gateway
│   ├── auth-service/           # Authentication & authorization
│   ├── project-service/        # Projects & work orders
│   ├── personnel-service/      # Employees & certifications
│   ├── quality-service/        # QMS, procedures, NCRs
│   ├── equipment-service/      # Equipment & calibration
│   ├── client-service/         # CRM & contracts
│   ├── notification-service/   # Email, SMS, in-app notifications
│   └── report-service/         # Report generation (async)
├── prisma/                     # Database schema & migrations
├── .claude/                    # Claude Code infrastructure
├── dev/                        # Development documentation
└── reference/                  # Preserved original calculations
```

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest features including Server Components
- **TypeScript** - Strict type safety
- **Vite** - Lightning-fast build tool
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **MUI v7** - Material-UI component library
- **React Hook Form + Zod** - Form management with validation
- **Zustand** - Lightweight client state management

### Backend
- **Node.js 20+** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe backend
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database (via Supabase)
- **Redis** - Caching and job queue
- **BullMQ** - Background job processing

### Infrastructure
- **Turborepo** - Monorepo management
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend services
- **Supabase** - PostgreSQL database + auth + storage
- **GitHub Actions** - CI/CD
- **Sentry** - Error tracking
- **DataDog** - Application performance monitoring

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **Target**: 80%+ code coverage

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (via Supabase)
- Redis (optional for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jukesygit/Portal-v2.git
cd Portal-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

### Development Commands

```bash
# Start all applications and services
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Type check all packages
npm run type-check

# Lint all packages
npm run lint

# Format all files
npm run format

# Clean all build artifacts
npm run clean
```

## 🎓 Development Guidelines

This project uses **Claude Code best practices** with comprehensive skills and documentation:

### Skills (`.claude/skills/`)
- **backend-dev-guidelines** - Node.js/Express/TypeScript patterns
- **frontend-dev-guidelines** - React 19/TanStack patterns
- **ndt-domain-knowledge** - NDT methods and standards
- **database-design** - Schema design and optimization
- **api-design** - RESTful API best practices

### Documentation (`dev/active/ndt-suite-rebuild/`)
- **plan.md** - Complete 12-14 month strategic plan
- **context.md** - Architectural decisions
- **tasks.md** - 500+ actionable tasks
- **executive-summary.md** - Project overview
- **claude-code-quick-start.md** - Workflow guide

## 📋 Development Phases

### Phase 1: Foundation & Core Infrastructure (Months 1-3) ✅ IN PROGRESS
- ✅ Monorepo setup with Turborepo
- ✅ React 19 + TypeScript frontend
- ✅ TanStack Router + Query configuration
- ✅ MUI v7 theme setup
- 🔄 Authentication & RBAC
- 🔄 Projects & Work Orders CRUD
- 🔄 Database schema & migrations
- 🔄 API Gateway

### Phase 2: Personnel & Equipment Management (Months 4-6)
- Employee management
- Certification tracking with expiration alerts
- Equipment registry & calibration
- Resource scheduling

### Phase 3: Quality Management System (Months 7-9)
- Procedure management with versioning
- Non-conformance reporting (NCR)
- Audit management
- Compliance validation

### Phase 4: Reporting & Analytics (Months 10-12)
- Async report generation
- Analytics dashboards
- Client portal
- Workflow automation

### Phase 5: Mobile & Advanced Features (Months 13-14)
- React Native mobile app
- Offline capabilities
- API integrations
- Performance optimization
- Production launch

## 🔒 Fork Information

This is a **FORK** of the original NDT-SUITE-UMBER repository:
- **Original**: Continues running in production (untouched)
- **This Fork**: Complete rebuild with modern tech stack
- **Strategy**: Parallel development → Parallel run → Migration

See [`FORK_INFO.md`](./FORK_INFO.md) for complete details.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

### Coverage Requirements
- **Overall**: 80% minimum
- **Critical paths**: 100% (auth, calculations, migrations)
- **Services**: 90%
- **Controllers**: 80%

## 🚢 Deployment

### Staging
Automatic deployment on push to `main` branch.

```bash
# Trigger staging deployment
git push origin main
```

### Production
Manual deployment via GitHub releases.

```bash
# Create production release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 📚 Documentation

### For Developers
- [Frontend Guide](./apps/web/README.md)
- [Backend Services](./services/README.md)
- [Database Schema](./prisma/README.md)
- [API Documentation](./docs/api/README.md)

### For Users
- [User Manual](./docs/user-manual/README.md)
- [Admin Guide](./docs/admin-guide/README.md)

### For Domain Experts
- [NDT Methods](./docs/ndt-methods/README.md)
- [Compliance Requirements](./docs/compliance/README.md)

## 🤝 Contributing

This is an internal project. For development:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes following our [Development Guidelines](.claude/skills/README.md)
3. Run tests: `npm run test`
4. Commit with conventional commits: `git commit -m "feat: add new feature"`
5. Push and create PR: `git push origin feature/your-feature`

### Commit Convention

```
feat: new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📊 Key Metrics

### Success Criteria
- [ ] 80%+ test coverage
- [ ] <200ms API response time (p95)
- [ ] <1s page load time (cached)
- [ ] 99.5%+ uptime
- [ ] Zero high/critical security vulnerabilities
- [ ] User satisfaction >4.5/5

### Progress Tracking
- **Tasks Completed**: See [tasks.md](./dev/active/ndt-suite-rebuild/tasks.md)
- **Current Sprint**: Phase 1 Week 1
- **Next Milestone**: Week 2 - Project Setup Complete

## 🆘 Support

- **Issues**: Create GitHub issue
- **Questions**: Check documentation in `dev/active/`
- **Security**: See [SECURITY.md](./SECURITY.md)

## 📄 License

UNLICENSED - Internal use only

---

**Built with ❤️ by the NDT Suite Development Team**

Last Updated: 2025-11-08
