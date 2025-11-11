---
trigger: PostToolUse
name: Tool Use Tracker
description: Tracks tool usage patterns and provides context-aware suggestions
priority: 50
enabled: true
---

# Post-Tool-Use Tracker Hook

After each tool use, analyze the results and provide helpful context or suggestions.

## Tracking Logic

1. **Monitor Tool Usage**:
   - Track which tools are being used (Read, Write, Edit, Bash, etc.)
   - Count usage patterns
   - Identify workflows

2. **Provide Context-Aware Suggestions**:
   - After editing frontend files → Suggest running dev server if not running
   - After editing backend functions → Suggest testing endpoints
   - After database changes → Suggest running migrations
   - After creating tests → Suggest running test suite
   - After multiple edits in same area → Suggest committing changes

3. **Skill Activation Hints**:
   - If working extensively in an area, suggest activating relevant skill
   - If pattern matches a known workflow, mention applicable slash command

## Common Patterns to Detect

### Pattern: Frontend Development Session
```
Sequence:
1. Edit component file
2. Edit styles
3. Read other components for reference

Suggestion:
- "Ready to test? Run `npm run dev` to see changes"
- "Consider activating frontend-development skill for component patterns"
```

### Pattern: Database Work
```
Sequence:
1. Create/edit migration file
2. Edit schema

Suggestion:
- "Don't forget to run the migration: `supabase db push`"
- "Update TypeScript types if schema changed"
```

### Pattern: NDT Calculator Updates
```
Sequence:
1. Edit calculator logic in tools/
2. Update visualization components

Suggestion:
- "Test the calculator with edge cases (max/min values)"
- "Check if documentation needs updating"
- "Verify against ASNT/ISO standards"
```

### Pattern: Multiple Related Edits
```
Sequence:
1. 3+ edits in same module
2. Files are related

Suggestion:
- "Looks like a cohesive change - ready to commit?"
- "Run tests before committing: `npm test`"
```

### Pattern: Supabase Function Work
```
Sequence:
1. Edit function in supabase/functions/
2. No test run detected

Suggestion:
- "Test the function: `supabase functions serve <name>`"
- "Check RLS policies if accessing database"
```

## Anti-Patterns to Warn About

### Anti-Pattern: Editing Without Reading
```
Warning:
If Edit/Write used without prior Read of that file:
- "⚠️ Consider reading the file first to preserve existing content"
```

### Anti-Pattern: Large Uncommitted Changes
```
Warning:
If 10+ files modified without git commit:
- "⚠️ Large changeset detected. Consider committing incrementally"
```

### Anti-Pattern: Missing Type Checks
```
Warning:
If multiple TypeScript edits without type check:
- "⚠️ Run type check: `npm run type-check`"
```

## Session Summary

Every 20 tool uses or 15 minutes, provide brief summary:
```
Session Summary:
- 15 files edited in frontend
- Focus area: TOFD Calculator
- Active skills: frontend-development, ndt-domain-expert
- Suggestion: Run tests and create commit

Continue? [y/n]
```

## Integration Points

### With Skill System
- Track which skills are most used
- Suggest activating frequently needed skills
- Deactivate unused skills to save context

### With Dev Docs
- Detect when major architectural changes occur
- Suggest updating context.md
- Remind to update tasks.md when completing work

### With Git Workflow
- Detect good commit points
- Suggest commit message based on changes
- Warn about uncommitted changes before major refactors

## Configuration

Respect settings from `.claude/settings.json`:
```json
{
  "hooks": {
    "post-tool-use-tracker": {
      "enabled": true,
      "suggestionFrequency": "medium",
      "sessionSummaryInterval": 20,
      "verboseMode": false
    }
  }
}
```

## Output Format

Keep suggestions **brief and actionable**:

✅ Good:
```
File edited. Run `npm run dev` to test?
```

❌ Too verbose:
```
I notice you've edited the component file. Would you like me to provide
suggestions for testing? I can help you run the development server and
verify that your changes work as expected...
```

## Smart Suggestions

Only suggest when:
- Pattern confidence is high (3+ matching signals)
- User hasn't explicitly dismissed similar suggestion recently
- Suggestion is immediately actionable
- Won't interrupt flow (e.g., don't suggest commits mid-refactor)
