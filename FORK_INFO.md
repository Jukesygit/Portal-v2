# Fork Information

**Original Repository**: https://github.com/Jukesygit/NDT-SUITE-UMBER
**Forked Repository**: Portal-v2 (This Repository)
**Fork Date**: 2025-11-08
**Purpose**: Complete rebuild with modern tech stack for enterprise-grade NDT management platform

---

## 🔀 Relationship to Original

This is a **FORK**, not a branch. Changes here do **NOT** affect the original repository.

### Critical Understanding:
- 🔒 **Original repository**: Production system, continues running untouched
- 🚀 **This repository (fork)**: Complete rebuild, independent development
- 🚫 **No upstream merges**: This is a rebuild, not a refactor
- 📚 **Reference only**: We reference original for business logic understanding

---

## Original Repository Status

### Current State
- ✅ Running in production
- ✅ Serving active users
- ✅ No changes will be made during rebuild
- ✅ Serves as reference for:
  - Business logic
  - NDT calculation algorithms
  - Data structures
  - User workflows
  - Domain knowledge

### Technology Stack (Original)
- **Frontend**: Vanilla JavaScript
- **Architecture**: Monolithic client-heavy application
- **Database**: Supabase (PostgreSQL) with local storage fallback
- **Auth**: Basic authentication
- **Deployment**: Static hosting

---

## New Repository Status (This Fork)

### Transformation Goals
- 🏗️ **Complete Rebuild**: Not a refactor, but ground-up reconstruction
- 🎯 **Modern Tech Stack**: React 19, TypeScript, microservices
- 📈 **Enterprise Scale**: Multi-tenant, RBAC, compliance-ready
- 🔐 **Security First**: JWT authentication, audit trails, encryption
- 📱 **Multi-Platform**: Web + Mobile (React Native)

### New Technology Stack
- **Frontend**: React 19 + TypeScript + TanStack Router/Query + MUI v7
- **Backend**: Node.js + Express + TypeScript (microservices)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: JWT with refresh tokens + RBAC
- **State Management**: TanStack Query (server) + Zustand (client)
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Vercel (frontend) + Railway/Render (backend)
- **Monitoring**: Sentry (errors) + DataDog (APM)

### Architecture Evolution

```
Original (Monolithic)          →    New (Microservices)
─────────────────────                ───────────────────────

┌─────────────────┐                  ┌──────────────────────┐
│  Vanilla JS App │                  │   React 19 Web App   │
│  (Client-Heavy) │                  │   (TypeScript)       │
└────────┬────────┘                  └──────────┬───────────┘
         │                                      │
         │                           ┌──────────▼───────────┐
         │                           │    API Gateway       │
         │                           │  (Express + Auth)    │
         │                           └──────────┬───────────┘
         │                                      │
         │                           ┌──────────▼───────────────────┐
         │                           │     Microservices Layer      │
         │                           ├──────────────────────────────┤
         │                           │ Auth │ Project │ Personnel   │
         │                           │ Quality │ Equipment │ Client │
         │                           │ Notification │ Report        │
         │                           └──────────┬───────────────────┘
         │                                      │
    ┌────▼─────┐                     ┌─────────▼──────────┐
    │ Supabase │                     │  PostgreSQL        │
    │ (Limited │                     │  + Redis Cache     │
    │  Schema) │                     │  + Job Queue       │
    └──────────┘                     │  (Full Schema)     │
                                     └────────────────────┘
```

---

## What We're Preserving

### ✅ Domain Knowledge & Logic
1. **NDT Calculation Engines**
   - TOFD (Time-of-Flight Diffraction) coverage calculations
   - NII (Neutron Imaging) coverage formulas
   - C-Scan visualization algorithms
   - PEC (Pulsed Eddy Current) signal processing
   - 3D asset rendering logic
   - **Location**: `reference/original-calculations/`
   - **Status**: Preserved for reference, will be rewritten in TypeScript

2. **Data Structures**
   - Asset hierarchy concepts (Facility → System → Component → Weld)
   - Inspection data format
   - Report structure
   - User role concepts

3. **Business Logic**
   - NDT method specifics
   - Acceptance criteria
   - Industry terminology
   - User workflows

### ❌ What We're Replacing

1. **Technology Choices**
   - Vanilla JS → React 19 + TypeScript
   - Manual components → MUI component library
   - Basic auth → JWT + RBAC
   - Local storage → PostgreSQL with proper schema
   - Monolithic → Microservices architecture

2. **Development Practices**
   - No tests → Comprehensive test coverage (80%+)
   - Manual deployment → CI/CD pipeline
   - No type safety → Strict TypeScript
   - No documentation → Comprehensive docs
   - No code review → Mandatory reviews

---

## Synchronization Strategy

### Data Sync (NOT Code Sync)
- ❌ **We do NOT sync code changes** from original
- ❌ **We do NOT merge branches** from original
- ✅ **We DO reference original** for:
  - Understanding business requirements
  - Extracting calculation formulas
  - Learning user workflows
  - Identifying data patterns

### Reference Commands
```bash
# View original remote
git remote -v

# Fetch original (read-only, for reference)
git fetch upstream

# View original file without checking it out
git show upstream/main:src/tools/tofd-calculator.js

# Or use our preserved reference
cat reference/original-calculations/tofd-calculator.js

# NEVER merge from upstream (this is a rebuild)
# ❌ git merge upstream/main  # DON'T DO THIS
```

---

## Migration Plan

### Phase 1: Parallel Development (Months 1-12)
```
Original System                Fork (This Repo)
───────────────                ────────────────
Production use    ────────►    Active development
Untouched                      Building new platform
Users continue                 Beta testing begins
```

### Phase 2: Parallel Run (Month 13)
```
Original System                New System (This Repo)
───────────────                ──────────────────────
Production use    ────────►    Beta production
Read-only sync    ────────►    Receives data sync
Backup system                  Primary testing
30-60 days                     User acceptance
```

### Phase 3: Migration & Cutover (Month 14)
1. Enable maintenance mode on original
2. Final data export from original
3. Run migration scripts (30-60 min)
4. Validate migration success
5. Switch DNS to new system
6. Monitor for 48 hours
7. Keep original read-only for 30 days
8. Archive original repository

### Phase 4: Post-Migration (Month 14+)
```
Original System                New System (This Repo)
───────────────                ──────────────────────
Archived (read-only)          Production system
Historical reference          All users migrated
30-day backup                 Primary platform
Then shut down               Ongoing development
```

---

## Development Rules

### ✅ ALLOWED:
1. All development in this fork
2. Feature branches from main
3. Pull requests for code review
4. Commits to this repository
5. Reading original for reference
6. Testing with original data (anonymized)

### ❌ FORBIDDEN:
1. **NEVER** push to upstream (original repo)
2. **NEVER** merge from upstream
3. **NEVER** modify original production system
4. **NEVER** copy-paste without understanding
5. **NEVER** deploy fork changes to original domain
6. **NEVER** access original production database directly

---

## Repository Structure

### This Fork
```
Portal-v2/
├── .claude/                      # Claude Code infrastructure
│   ├── skills/                   # Development guidelines
│   ├── hooks/                    # Quality enforcement
│   ├── agents/                   # AI assistants
│   └── commands/                 # Custom commands
├── dev/                          # Development documentation
│   └── active/
│       └── ndt-suite-rebuild/    # Project planning docs
├── reference/                    # Preserved original logic
│   └── original-calculations/    # Original JS files (read-only)
├── apps/                         # (To be created) Monorepo apps
│   ├── web/                      # React frontend
│   └── mobile/                   # React Native app
├── packages/                     # (To be created) Shared packages
│   ├── shared-types/             # TypeScript types
│   ├── ndt-calculations/         # Calculation engine library
│   └── ui-components/            # Shared components
├── services/                     # (To be created) Microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── project-service/
│   ├── personnel-service/
│   ├── quality-service/
│   ├── equipment-service/
│   ├── client-service/
│   ├── notification-service/
│   └── report-service/
└── prisma/                       # (To be created) Database schema
```

---

## Success Criteria

### Repository Successfully Forked When:
- [x] Fork created on GitHub
- [x] Cloned locally
- [x] Development branch created
- [x] Original calculations preserved in reference/
- [x] Claude Code infrastructure set up
- [x] Dev docs organized in dev/active/
- [x] FORK_INFO.md created
- [ ] No upstream remote or upstream is read-only
- [ ] Ready to start Phase 1 development

### Fork Ready for Production When:
- [ ] All 5 phases completed (12-14 months)
- [ ] 80%+ test coverage maintained
- [ ] All compliance requirements met
- [ ] User acceptance testing passed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Data migration validated
- [ ] Parallel run successful (30-60 days)

---

## Team & Access

### Development Team (This Fork)
- **Lead Developer**: Full-stack architecture and implementation
- **Claude Code**: AI-assisted development following best practices
- **Code Reviewers**: 2+ human reviewers per PR
- **QA Team**: Manual testing and UAT coordination
- **Domain Expert**: NDT standards compliance validation

### Original Repository Access
- **Read Access**: Team can view original code for reference
- **Write Access**: ❌ **NOBODY** has write access to original
- **Rationale**: Prevents accidental modifications to production system

---

## Monitoring Both Systems (During Parallel Run)

### Health Checks
```yaml
Original System:
  URL: https://ndt-suite.example.com/health
  Status: Production (active)
  Users: All current users
  Monitoring: Every 5 minutes

New System (This Fork):
  URL: https://ndt-suite-v2.example.com/health
  Status: Beta production
  Users: Beta testers only
  Monitoring: Every 5 minutes

Comparison:
  - Response times
  - Error rates
  - User activity
  - Feature usage
```

---

## Emergency Procedures

### If Fork Accidentally Modified Original
1. Immediately notify team lead
2. Revert changes in original repository
3. Verify production system unaffected
4. Review access controls
5. Document incident
6. Prevent recurrence

### If Migration Fails
1. Execute rollback procedure
2. Restore original system to full operation
3. Analyze failure causes
4. Fix issues in fork
5. Schedule new migration attempt
6. Communicate to stakeholders

---

## Related Documentation

### Planning Documents
- **Strategic Plan**: `dev/active/ndt-suite-rebuild/plan.md`
- **Context**: `dev/active/ndt-suite-rebuild/context.md`
- **Tasks**: `dev/active/ndt-suite-rebuild/tasks.md`
- **Quick Start**: `dev/active/ndt-suite-rebuild/claude-code-quick-start.md`
- **Repository Guide**: `dev/active/ndt-suite-rebuild/repository-fork-guide.md`
- **Executive Summary**: `dev/active/ndt-suite-rebuild/executive-summary.md`

### Technical References
- **Original Calculations**: `reference/original-calculations/README.md`
- **Database Schema**: (To be created) `prisma/schema.prisma`
- **API Documentation**: (To be created) Swagger/OpenAPI specs
- **Architecture Diagrams**: `dev/active/ndt-suite-rebuild/plan.md`

---

## Questions & Answers

**Q: Can we ever merge changes from the original repository?**
A: No. This is a rebuild, not a refactor. If production needs fixes, handle those separately in the original repo. Don't merge them here.

**Q: What if we find a bug in the original calculation logic?**
A: Fix it in the new system with proper tests and documentation. If critical for production, notify the team to fix the original separately.

**Q: How do we handle user feedback during the parallel run?**
A: Collect feedback for both systems separately. Apply improvements to the new system (this fork) only.

**Q: When do we rename this fork to the main repository name?**
A: After successful migration and archival of the original (30 days post-cutover).

**Q: What if users want new features during the rebuild?**
A: Add them to the new system (this fork) only. Don't add features to original unless critical for production.

---

## Changelog

### 2025-11-08 (Initial Fork)
- ✅ Repository forked from original
- ✅ Development branch created: `claude/ndt-suite-rebuild-011CUvnYb3tNj3MKM6f7ae9n`
- ✅ Original calculations preserved in `reference/`
- ✅ Claude Code infrastructure set up
- ✅ Dev docs organized
- ✅ FORK_INFO.md created
- 📋 Ready to begin Phase 1 development

---

**Document Status**: ✅ COMPLETE
**Last Updated**: 2025-11-08
**Next Action**: Begin Phase 1 Week 1 - Project Setup & Tooling
**Owner**: Claude Code + Development Team
