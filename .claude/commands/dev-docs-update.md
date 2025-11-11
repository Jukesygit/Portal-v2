---
name: dev-docs-update
description: Update development documentation before context resets to preserve knowledge
---

# Update Development Documentation

Preserve project knowledge by updating dev-docs before context window resets.

## Your Task

1. **Identify Active Dev Docs**:
   - Look in project root for `*-plan.md`, `*-context.md`, `*-tasks.md`
   - Check `.claude/settings.json` for tracked docs
   - Ask user which docs to update if multiple exist

2. **Review Recent Changes**:
   - Check git log for recent commits
   - Review files that were recently modified
   - Identify new architectural decisions
   - Note completed tasks

3. **Update Context File**:
   - Add any new architectural decisions
   - Update key file locations if structure changed
   - Add new integration points
   - Document new issues or workarounds
   - Update "Last Updated" date

4. **Update Tasks File**:
   - Mark completed tasks as [x]
   - Add new tasks discovered during work
   - Update status of in-progress tasks
   - Move completed tasks to "Completed" section
   - Update "Last Updated" date

5. **Update Plan File (if needed)**:
   - Adjust timelines if needed
   - Update phase status
   - Add learnings to success criteria

## What to Capture

### Critical to Document
- **Architectural decisions**: Why we chose X over Y
- **Key file changes**: New modules, renamed files
- **Integrations**: New external services
- **Breaking changes**: API changes, schema migrations
- **Completed work**: What's done vs planned
- **Blockers**: What's preventing progress
- **Learnings**: What worked, what didn't

### Don't Bother With
- Trivial changes (typo fixes, formatting)
- Temporary debug code
- Changes that were reverted
- Internal implementation details unlikely to matter later

## Update Strategy

### Quick Update (5 min)
When you've made progress but not major changes:
- Update tasks checkboxes
- Add any new blockers
- Update "Last Updated" date

### Comprehensive Update (15 min)
Before context reset or end of work session:
- Full review of all three files
- Add architectural decisions
- Document integration points
- Clean up and reorganize if needed

### Major Milestone Update (30 min)
After completing a phase:
- Update all sections
- Add retrospective notes
- Document lessons learned
- Update success criteria status

## Output Format

After updating, provide summary:

```markdown
## Dev Docs Updated

### Files Updated
- [x] ndt-suite-rebuild-context.md
- [x] ndt-suite-rebuild-tasks.md
- [ ] ndt-suite-rebuild-plan.md (no changes needed)

### Key Updates

**Context**:
- Added Decision 11: State management with TanStack Query
- Updated integration points (added Sentry)
- Documented RLS policy pattern

**Tasks**:
- Marked 5 tasks complete (Phase 1)
- Added 3 new tasks discovered during implementation
- Updated blocker: Waiting on Supabase tier upgrade

**Plan**:
- No updates needed

### Next Context Reset
Ready for next session. All critical decisions and progress documented.
```

## Integration

This command pairs with:
- `/dev-docs` - Initial creation
- Project workflow - Run before long breaks or context resets
- `.claude/hooks/` - Could be automated via hook
