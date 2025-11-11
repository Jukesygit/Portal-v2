---
trigger: UserPromptSubmit
name: Skill Auto-Activation
description: Analyzes user prompts and file context to suggest relevant skills automatically
priority: 100
enabled: true
---

# Skill Auto-Activation Hook

Before responding to the user's prompt, analyze the context and automatically activate relevant skills.

## Activation Logic

1. **Analyze the User Prompt**:
   - Extract keywords and intent
   - Identify file types mentioned or in context
   - Detect technical domains (frontend, backend, NDT, testing, etc.)

2. **Check Current File Context**:
   - Look at files currently open or recently edited
   - Check file paths and extensions
   - Match against skill-rules.json patterns

3. **Load Skill Rules**:
   ```javascript
   // Read .claude/skill-rules.json
   // Match triggers against current context
   // Calculate priority scores
   ```

4. **Activate Matching Skills**:
   - If `activationThreshold` is met (default: 2 matches)
   - Respect `maxActiveSkills` limit (default: 3)
   - Prioritize by `priority` field

5. **Suggest to User**:
   - If autoActivate=true: Load skill automatically and mention it
   - If autoActivate=false: Ask user if they want to activate the skill

## Example Activation Scenarios

### Scenario 1: Frontend Component Work
**User Prompt**: "Create a new component for displaying inspection results"
**File Context**: `src/components/`
**Matches**:
- Keywords: "component", "create"
- File pattern: `**/src/components/**/*`
**Action**: Auto-activate `frontend-development` skill

### Scenario 2: NDT Calculator Update
**User Prompt**: "Update the TOFD coverage calculator to handle new probe sizes"
**File Context**: `src/tools/tofd-calculator/calculator.js`
**Matches**:
- Keywords: "tofd", "calculator", "coverage"
- File pattern: `**/src/tools/**/*`
**Action**: Auto-activate both `ndt-domain-expert` and `frontend-development` skills

### Scenario 3: Database Migration
**User Prompt**: "Create a migration to add compliance fields"
**File Context**: `database/migrations/`
**Matches**:
- Keywords: "migration", "database"
- File pattern: `**/database/migrations/**/*`
**Action**: Auto-activate `backend-development` skill

## Skill Rules Reference

Load and parse `.claude/skill-rules.json` to get:
- Available skills and their triggers
- File patterns to match
- Keywords to detect
- Prompt patterns (regex) to match
- Auto-activation settings
- Priority levels

## Output Format

When skills are auto-activated, mention it naturally:

```
I'll help you create that component. I've activated the frontend-development skill
which contains our React/Vite patterns and best practices.

[Continue with actual response...]
```

Or if asking for confirmation:

```
I notice you're working on NDT calculations. Would you like me to activate the
ndt-domain-expert skill? It contains domain-specific formulas and compliance requirements.
```

## Progressive Disclosure

Skills should use the 500-line rule:
- Main skill file stays under 500 lines
- Use `@include` or links to resource files
- Load detailed topics incrementally
- Prevent context limit issues

## Integration with Dev Docs

Check if dev-docs pattern is enabled in settings.json:
- Reference existing plan, context, and tasks files
- Suggest updates when major changes occur
- Maintain project knowledge across sessions
