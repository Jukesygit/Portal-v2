---
name: dev-docs
description: Create structured development documentation (plan, context, tasks)
---

# Create Development Documentation

Create the three-file dev-docs pattern to preserve project knowledge across context resets.

## Files to Create

### 1. Plan File (`{feature}-plan.md`)

Contains:
- Feature overview and goals
- Technical approach
- Phase breakdown
- Timeline estimates
- Success criteria

### 2. Context File (`{feature}-context.md`)

Contains:
- Architectural decisions and rationale
- Key file locations
- Integration points
- Data structures
- Performance considerations
- Security considerations
- Known issues and workarounds

### 3. Tasks File (`{feature}-tasks.md`)

Contains:
- Checklist of all tasks
- Current progress
- Blockers and dependencies
- Next steps

## Your Task

1. Ask the user what feature/project they're documenting
2. Review existing code and documentation
3. Create all three files with comprehensive information
4. Use the existing `ndt-suite-rebuild-*` files as templates
5. Ensure cross-references between files
6. Save files in the project root: `NDT-SUITE-UMBER-Experimental/`

## Template Structure

Follow this structure for consistency with existing docs:

**Plan File**:
```markdown
# [Feature] - Implementation Plan

## Overview
Brief description

## Goals
- Goal 1
- Goal 2

## Technical Approach
### Architecture
### Technology Stack
### Key Components

## Implementation Phases
### Phase 1: [Name]
**Duration**: X weeks
**Goals**:
**Deliverables**:

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

**Context File**:
```markdown
# [Feature] - Context Document

**Last Updated**: YYYY-MM-DD

## Current System Analysis
### Existing Structure
### What We're Preserving
### What We're Replacing

## Critical Architectural Decisions
### Decision 1: [Name]
**Decision**:
**Rationale**:
**Alternatives Considered**:

## Key File Locations
List important files with descriptions

## Integration Points
External systems and services

## Performance Considerations
Optimization strategies

## Security Considerations
Auth, validation, compliance

## Known Issues & Workarounds
Current problems and temporary solutions
```

**Tasks File**:
```markdown
# [Feature] - Task List

**Status**: In Progress / Complete
**Last Updated**: YYYY-MM-DD

## Phase 1: [Name]
- [ ] Task 1
- [ ] Task 2
- [x] Completed task

## Current Sprint
### In Progress
- Task currently being worked on

### Blocked
- Task blocked by X

### Up Next
- Next priority tasks

## Completed
- [x] Task completed on DATE
```

## Integration

After creating docs:
1. Update project README to link to new docs
2. Add docs to `.claude/settings.json` if they should be referenced regularly
3. Inform user of file locations
4. Suggest using `/dev-docs-update` command to maintain them
