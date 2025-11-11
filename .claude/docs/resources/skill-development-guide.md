# Skill Development Guide

**Audience**: Developers creating new skills for the Claude Code infrastructure
**Level**: Intermediate

## What Makes a Good Skill?

A skill should be:
1. **Focused**: Covers one domain or technology area
2. **Actionable**: Provides concrete patterns and examples
3. **Maintainable**: Follows the 500-line rule with progressive disclosure
4. **Project-specific**: Tailored to your project's architecture and patterns

## Skill Anatomy

### Required Sections

```markdown
# Skill Name

**Domain**: What this skill covers
**Project**: Project name
**Last Updated**: YYYY-MM-DD

## Quick Reference
- Overview
- Key technologies
- File locations

## Core Principles
- Fundamental concepts
- Key patterns
- Decision guidelines

## Project-Specific Patterns
- How things work in THIS project
- Not generic knowledge

## Common Tasks
- Step-by-step guides
- Code examples
- Troubleshooting

## Resources
- Links to detailed docs
- External references
```

### Optional Sections

```markdown
## Testing Approach
## Performance Guidelines
## Security Considerations
## Common Issues & Solutions
## Skill Maintenance
```

## The 500-Line Rule

### Why 500 Lines?

- **Context limits**: Large files consume too much context
- **Focused content**: Forces you to stay on-topic
- **Progressive disclosure**: Users get overview first, details on demand
- **Maintainability**: Easier to update smaller files

### How to Stay Under 500 Lines

1. **Be concise**: No fluff, just facts
2. **Use examples**: Show, don't tell (but keep them short)
3. **Link to resources**: Detail goes in resource files
4. **Prioritize**: Include must-know information only

### When to Split

**Main skill file** should contain:
- Quick reference (what/where)
- Core principles (how/why)
- Common patterns (when)
- Pointers to detailed resources

**Resource files** should contain:
- Comprehensive examples
- Edge cases
- Advanced topics
- Detailed troubleshooting

### Example Split

**Main skill**: `frontend-development.md` (450 lines)
```markdown
## React 19 Features

React 19 provides modern features like hooks and Suspense.

For detailed guide on hooks, see:
→ `.claude/docs/resources/react-hooks-guide.md`

For Suspense patterns, see:
→ `.claude/docs/resources/react-suspense-guide.md`
```

**Resource file**: `react-hooks-guide.md` (800 lines)
```markdown
# React Hooks - Comprehensive Guide

## useState
[Detailed explanation with 10 examples...]

## useEffect
[Detailed explanation with edge cases...]

## Custom Hooks
[Full patterns and examples...]
```

## Creating a New Skill

### Step 1: Identify the Need

Ask:
- **What domain?** (Frontend, backend, testing, domain-specific)
- **What problem does it solve?** (What will users ask about)
- **What exists already?** (Don't duplicate existing skills)
- **How often needed?** (Is this common enough to warrant a skill?)

### Step 2: Research Your Project

Gather:
- **File locations**: Where does this code live?
- **Patterns**: How do we currently do X?
- **Conventions**: Naming, structure, style
- **Common issues**: What problems occur repeatedly?
- **Best practices**: What works well?

### Step 3: Create the Outline

```markdown
# [Skill Name]

**Domain**:
**Project**:
**Last Updated**:

## Quick Reference
- [ ] Overview paragraph
- [ ] Key technologies list
- [ ] File locations

## Core Principles
- [ ] Principle 1
- [ ] Principle 2
- [ ] Principle 3

## Project-Specific Patterns
- [ ] Pattern 1 with example
- [ ] Pattern 2 with example

## Common Tasks
- [ ] Task 1 step-by-step
- [ ] Task 2 step-by-step

## Resources
- [ ] Link to resource 1
- [ ] Link to resource 2
```

### Step 4: Fill in Content

**Quick Reference** (100 words max):
```markdown
## Quick Reference

This skill covers [X] development in the NDT Suite project.

**Key Technologies**:
- Technology 1 (version)
- Technology 2 (version)

**File Locations**:
- Main code: `path/to/code/`
- Tests: `path/to/tests/`
```

**Core Principles** (400 words max):
```markdown
## Core Principles

### 1. Principle Name

Brief explanation of why this matters.

**Example**:
\`\`\`javascript
// Good example
\`\`\`

### 2. Another Principle

Explanation...
```

**Project-Specific Patterns** (600 words max):
```markdown
## Project-Specific Patterns

### Pattern Name

**When to use**: Description

**How we do it**:
\`\`\`javascript
// Code example specific to OUR project
\`\`\`

**Don't** (anti-pattern):
\`\`\`javascript
// What NOT to do
\`\`\`
```

**Common Tasks** (800 words max):
```markdown
## Common Tasks

### Task: Create New Component

**Steps**:
1. Create file in `path/`
2. Use this template:
   \`\`\`javascript
   // Template code
   \`\`\`
3. Register in router
4. Add tests

**Example**:
[Concrete example]
```

**Resources** (100 words max):
```markdown
## Resources

For detailed information:
- Topic 1 → `.claude/docs/resources/topic1.md`
- Topic 2 → `.claude/docs/resources/topic2.md`
- External docs → https://...

## Skill Maintenance

**Update When**:
- Technology upgrades
- Patterns change
- New best practices emerge

**Last Review**: YYYY-MM-DD
**Next Review**: [When]
```

### Step 5: Add Activation Rules

In `skill-rules.json`:

```json
{
  "skillName": "your-skill-name",
  "triggers": {
    "filePatterns": [
      "**/path/to/relevant/files/**/*",
      "**/*.extension"
    ],
    "keywords": [
      "keyword1",
      "keyword2",
      "technology-name",
      "domain-term"
    ],
    "promptPatterns": [
      "create.*component",
      "update.*feature",
      "fix.*bug"
    ]
  },
  "autoActivate": true,
  "priority": 1
}
```

**Priority levels**:
- `1`: General skills (frontend, backend, testing)
- `2`: Domain-specific skills (NDT, business logic)
- `3`: Documentation and optional skills

### Step 6: Test Activation

Create test scenarios:

```markdown
**Test 1: File Pattern Match**
1. Edit file matching pattern: `src/your/path/file.ext`
2. Prompt: "Update this file"
3. Expected: Skill auto-activates

**Test 2: Keyword Match**
1. Any file
2. Prompt: "Create a new [keyword1] with [keyword2]"
3. Expected: Skill auto-activates

**Test 3: Combined Match**
1. Edit matching file
2. Prompt with keywords
3. Expected: High confidence activation
```

Run tests and adjust rules if needed.

### Step 7: Create Resource Files (Optional)

For topics exceeding skill file limits:

```markdown
# Detailed Topic Guide

**Part of**: [Skill Name]
**Audience**: Developers needing deep dive into [topic]

## Contents
- Comprehensive examples
- Edge cases
- Advanced patterns
- Troubleshooting guide

[Unlimited length - all the details]
```

Save to: `.claude/docs/resources/topic-name-guide.md`

Reference from skill:
```markdown
For detailed [topic] guide, see:
→ `.claude/docs/resources/topic-name-guide.md`
```

## Skill Maintenance

### Regular Updates

**Weekly**: Review activation patterns
- Are skills activating appropriately?
- Any missed activations?
- Any false activations?

**Monthly**: Content review
- Are examples still accurate?
- Have patterns changed?
- Are there new common tasks?

**Quarterly**: Comprehensive review
- Update all sections
- Refresh examples
- Add new learnings
- Remove outdated content

### Version Control

Track changes in skill files:
```markdown
## Skill Maintenance

**Update History**:
- 2025-11-11: Initial creation
- 2025-11-15: Added section on X
- 2025-12-01: Updated examples for Y change

**Last Review**: 2025-11-11
**Next Review**: 2025-12-11
```

## Best Practices

### Do's

✅ **Be project-specific**: "In OUR project, we do X because Y"
✅ **Use concrete examples**: Show actual code from the project
✅ **Link to resources**: For details, point to resource files
✅ **Update regularly**: Keep content fresh
✅ **Test activation**: Ensure rules work as expected

### Don'ts

❌ **Generic knowledge**: Don't just copy React docs
❌ **Exceed 500 lines**: Split into resources instead
❌ **Include everything**: Prioritize common tasks
❌ **Forget to maintain**: Outdated skills are worse than none
❌ **Duplicate content**: One source of truth per topic

## Examples from This Project

### Good Skill: ndt-domain-expert.md

**Why it's good**:
- Highly focused (NDT domain only)
- Project-specific calculations
- Concrete formulas with examples
- References standards (ASNT, ISO)
- Under 500 lines
- Links to detailed guides

### Needs Improvement: (Hypothetical)

**If we had**:
```markdown
# Everything-You-Need-To-Know.md (2000 lines)
- React patterns
- Backend patterns
- NDT knowledge
- Testing
- Deployment
- ...
```

**Problem**: Too broad, too long, unmaintainable

**Fix**: Split into:
- `frontend-development.md` (450 lines)
- `backend-development.md` (400 lines)
- `ndt-domain-expert.md` (500 lines)
- `testing-development.md` (420 lines)

## Skill Templates

### Minimal Skill Template

```markdown
# Skill Name

**Domain**: [What]
**Project**: NDT Tool Suite
**Last Updated**: YYYY-MM-DD

## Quick Reference

[1 paragraph overview]

**Key Technologies**: [List]
**File Locations**: [Paths]

## Core Principles

### Principle 1
[Explanation + example]

## Common Tasks

### Task 1
**Steps**: [1, 2, 3]
**Example**: [Code]

## Resources

- [Link to detailed docs]

## Skill Maintenance

**Last Review**: [Date]
**Next Review**: [Date]
```

### Comprehensive Skill Template

See existing skills in `.claude/skills/` for full examples.

## Conclusion

Creating effective skills:
1. Focuses on project-specific knowledge
2. Follows the 500-line rule
3. Provides actionable guidance
4. Links to detailed resources
5. Maintains relevance through updates

**Remember**: Skills should activate when needed, not remembered. Make activation rules broad enough to catch relevant work, narrow enough to avoid noise.

## Resources

- [Existing Skills](./../skills/)
- [Skill Rules](./../../skill-rules.json)
- [Main README](./../README.md)
- [Original Best Practices](https://github.com/diet103/claude-code-infrastructure-showcase)
