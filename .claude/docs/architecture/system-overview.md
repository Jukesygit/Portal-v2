# NDT Suite - System Architecture Overview

**Last Updated**: 2025-11-11
**Version**: Current System (Pre-Rebuild)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  React   │  │  Vite    │  │ IndexedDB│               │
│  │  App     │  │  Build   │  │ (Offline)│               │
│  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
                      ▲ │
                      │ ▼ HTTPS
┌─────────────────────────────────────────────────────────┐
│              Supabase Platform                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │   Auth   │  │  Edge    │  │ Storage  │               │
│  │ (JWT)    │  │ Functions│  │  (S3)    │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│  ┌─────────────────────────────────────┐                │
│  │     PostgreSQL Database              │                │
│  │     (Row-Level Security)             │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## Component Layers

### 1. Frontend Layer (React 19 + Vite)

**Location**: `NDT-SUITE-UMBER-Experimental/src/`

**Responsibilities**:
- User interface and interactions
- Client-side routing
- Data visualization (3D, charts, images)
- Offline data caching
- Form validation
- Report generation (client-side)

**Key Modules**:
```
src/
├── components/         # Reusable UI components
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   └── ...
├── pages/             # Route-level components
│   ├── LoginPage.jsx
│   ├── AdminDashboard.jsx
│   ├── DataHubPage.jsx
│   └── ...
├── tools/             # NDT-specific tools
│   ├── tofd-calculator/
│   ├── cscan-visualizer/
│   ├── pec-visualizer/
│   └── nii-coverage-calculator/
├── App.jsx            # Root component with routing
└── main.jsx           # Application entry point
```

**Technology Stack**:
- React 19 (functional components, hooks)
- React Router v7 (client-side routing)
- Vite 5 (build tool, dev server)
- Three.js (3D visualization)
- HTML2Canvas, jsPDF (report generation)

### 2. Backend Layer (Supabase)

**Location**: `NDT-SUITE-UMBER-Experimental/supabase/functions/`

**Edge Functions** (Deno runtime):
1. **submit-account-request**: Handle user registration requests
2. **approve-account-request**: Admin approval workflow
3. **transfer-asset**: Asset ownership transfers

**Database** (PostgreSQL):
- Organizations (multi-tenancy)
- Users and roles
- Assets (vessels, pipelines, welds)
- Inspections and results
- Reports and documents
- Equipment and calibrations
- Personnel certifications

**Row-Level Security (RLS)**:
- Organization-level data isolation
- Role-based access control
- Audit logging

### 3. Storage Layer

**IndexedDB** (Client-side):
- Offline data cache
- Sync queue for offline operations
- Local drafts

**Supabase Storage** (Server-side):
- Inspection images
- Generated reports (PDF)
- Calibration certificates
- Procedure documents

### 4. Authentication & Authorization

**Supabase Auth**:
- JWT-based authentication
- Email/password login
- Session management
- Password reset

**Authorization**:
- Role-based (Admin, Manager, Inspector, Viewer)
- Organization-based (multi-tenant isolation)
- RLS policies enforce permissions

## Data Flow

### Inspection Creation Flow

```
1. User → Fills inspection form (React component)
2. Validation → Client-side validation (React)
3. Calculate → NDT calculation engine (pure JS)
4. Display → Results shown to user
5. Save → Data sent to Supabase
6. Database → Inserted via RLS policies
7. Sync → IndexedDB updated for offline
8. Confirm → User sees success message
```

### Offline Sync Flow

```
1. User → Works offline
2. Queue → Changes stored in IndexedDB
3. Online → Connection restored
4. Sync → Queue processed sequentially
5. Resolve → Conflicts handled (last-write-wins)
6. Clean → Successfully synced items removed from queue
```

### Report Generation Flow

```
1. Request → User clicks "Generate Report"
2. Fetch → Load inspection data and related records
3. Render → HTML template populated with data
4. Convert → HTML to PDF (jsPDF/Puppeteer)
5. Store → PDF saved to Supabase Storage
6. Download → Presigned URL provided to user
```

## Integration Points

### Current Integrations

1. **Supabase Platform**
   - Database (PostgreSQL)
   - Authentication
   - Storage (S3-compatible)
   - Edge Functions
   - Realtime (subscriptions)

### Planned Integrations (Future)

1. **Email Service**: SendGrid/AWS SES
2. **Error Tracking**: Sentry
3. **Analytics**: DataDog/New Relic
4. **Calendar**: Google Calendar/Outlook
5. **Cloud Storage**: Google Drive/Dropbox
6. **ERP Systems**: SAP, Oracle (enterprise clients)

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS/TLS 1.3 only
- CORS policies
- Rate limiting (Supabase)

**Layer 2: Authentication**
- JWT with short expiration (15 min)
- Refresh tokens (7 days)
- Secure httpOnly cookies
- Password requirements

**Layer 3: Authorization**
- Role-based access control (RBAC)
- Row-Level Security (RLS) policies
- Organization-level isolation

**Layer 4: Data**
- Database encryption at rest
- Sensitive field encryption
- Input validation (client + server)
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escapes)

**Layer 5: Application**
- Error boundaries (graceful failures)
- Audit logging
- Session timeout
- CSRF protection

## Performance Architecture

### Frontend Performance

**Bundle Optimization**:
- Code splitting by route
- Lazy loading for heavy components (3D viewer)
- Tree-shaking (Vite)
- Minification and compression

**Runtime Optimization**:
- React.memo for expensive components
- useMemo for expensive calculations
- Virtual scrolling for large lists
- Debounced search inputs

**Caching Strategy**:
- IndexedDB for offline data
- Service worker (future)
- Browser cache for static assets

### Backend Performance

**Database**:
- Indexes on foreign keys and frequent queries
- Connection pooling (Prisma/Supabase)
- Pagination for large result sets
- Database views for complex queries

**Edge Functions**:
- Stateless (horizontal scaling)
- Cold start optimization
- Minimal dependencies

## Scalability Considerations

### Current Limits

- **Users**: ~100 concurrent users
- **Data**: ~10k inspections, 5k assets
- **Storage**: ~100 GB
- **Database Connections**: 10 (free tier)

### Scaling Strategy (From Rebuild Plan)

**Phase 1: Optimize Current Architecture**
- Add caching layer (Redis)
- Optimize queries
- Upgrade Supabase tier

**Phase 2: Microservices Architecture**
- Split into services (auth, projects, reports, etc.)
- API Gateway pattern
- Service mesh for communication
- Horizontal scaling

**Phase 3: Global Distribution**
- CDN for static assets
- Multi-region database
- Edge computing for calculations

## Deployment Architecture

### Current Deployment

```
┌─────────────────────────────────────┐
│         Vercel/Netlify              │
│  ┌─────────────────────────────┐   │
│  │   React App (Static)         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Supabase Cloud              │
│  ┌────────┐  ┌─────────────────┐   │
│  │  Auth  │  │   PostgreSQL    │   │
│  ├────────┤  ├─────────────────┤   │
│  │ Edge   │  │   Storage       │   │
│  │Functions│  │   (S3)          │   │
│  └────────┘  └─────────────────┘   │
└─────────────────────────────────────┘
```

### Future Deployment (Rebuild Plan)

```
┌──────────────────────────────────────────────────────┐
│                CI/CD Pipeline                         │
│  GitHub Actions → Build → Test → Deploy              │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              Infrastructure (AWS/GCP)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   API      │  │  Services  │  │   Workers  │     │
│  │  Gateway   │  │ (Docker)   │  │  (Queue)   │     │
│  └────────────┘  └────────────┘  └────────────┘     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ PostgreSQL │  │   Redis    │  │    S3      │     │
│  │   (RDS)    │  │  (Cache)   │  │ (Storage)  │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└──────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Current Monitoring

- **Client**: Browser console, basic error logging
- **Server**: Supabase dashboard logs
- **Database**: Query performance stats

### Planned Monitoring

- **APM**: DataDog, New Relic
- **Error Tracking**: Sentry
- **Logging**: Structured logs with correlation IDs
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty for critical issues

## Compliance Architecture

### Regulatory Requirements

1. **ASNT SNT-TC-1A**: Personnel certification tracking
2. **ISO 9712**: International personnel certification
3. **ASME Section V**: NDT procedure requirements
4. **ISO 9001**: Quality management system
5. **GDPR/CCPA**: Data protection and privacy

### Compliance Implementation

- **Audit Trails**: All data changes logged
- **Version Control**: Document revision history
- **Access Control**: Role-based permissions
- **Data Retention**: Configurable retention policies
- **Privacy Controls**: Data export, right to deletion

## Technology Decision Matrix

| Requirement | Technology | Rationale |
|-------------|------------|-----------|
| Frontend Framework | React 19 | Modern, well-supported, team expertise |
| Build Tool | Vite | Fast, modern, ESM-native |
| Backend | Supabase | Rapid development, PostgreSQL, auth included |
| Database | PostgreSQL | Relational data, RLS, proven at scale |
| Auth | Supabase Auth | Built-in, JWT-based, social providers |
| Hosting | Vercel/Netlify | Easy deployment, CDN, HTTPS |
| 3D Graphics | Three.js | Industry standard for WebGL |

## Future Architecture (Rebuild Plan)

See `ndt-suite-rebuild-context.md` for detailed rebuild architecture:
- Monorepo with Turborepo
- Microservices (8+ services)
- TanStack Query for server state
- Zustand for UI state
- Vitest + Playwright for testing
- CI/CD with GitHub Actions

## References

- [Rebuild Plan](../../NDT-SUITE-UMBER-Experimental/ndt-suite-rebuild-plan.md)
- [Rebuild Context](../../NDT-SUITE-UMBER-Experimental/ndt-suite-rebuild-context.md)
- [Skills](./../skills/)
- [Supabase Documentation](https://supabase.com/docs)
