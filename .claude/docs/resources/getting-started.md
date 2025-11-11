# Getting Started with Claude Code Infrastructure

**Audience**: Developers new to this Claude Code setup
**Estimated Time**: 15 minutes

## What Is This?

This infrastructure enables Claude Code to:
1. **Automatically activate relevant knowledge** based on what you're working on
2. **Provide specialized agents** for complex tasks like code review and refactoring
3. **Execute workflow commands** for common development tasks
4. **Preserve project knowledge** across sessions

## Quick Start (5 Minutes)

### 1. Verify Setup

The `.claude/` directory should exist with:
```bash
.claude/
├── skills/          # 4 skill files
├── hooks/           # 2 hook files
├── agents/          # 3 agent files
├── commands/        # 3 command files
└── docs/            # Documentation
```

### 2. Test Auto-Activation

Open a React component file and try:
```
"Add error handling to this component"
```

You should see:
```
I've activated the frontend-development skill which contains our React patterns...
```

### 3. Try a Command

Run:
```
/analyze-codebase
```

This will analyze the project structure and provide insights.

### 4. Use an Agent

Request:
```
Review the code in src/tools/tofd-calculator/
```

The code-reviewer agent will activate and provide structured feedback.

## How Auto-Activation Works

### The Magic Behind the Scenes

```
Your Prompt
    ↓
skill-activation-prompt Hook
    ↓
Analyzes:
- Current file paths
- Keywords in your prompt
- Recent edits
    ↓
Checks skill-rules.json
    ↓
Calculates relevance scores
    ↓
Activates matching skills
```

### Example

**You're editing**: `src/components/InspectionCard.jsx`

**You ask**: "Add loading state while fetching data"

**What happens**:
1. Hook detects you're in a `.jsx` file
2. Sees keywords: "loading", "fetching data"
3. Matches `frontend-development` skill rules
4. Auto-activates the skill
5. Provides React-specific patterns for loading states

## Common Workflows

### Creating a New Feature

```bash
# 1. Create dev-docs for planning
/dev-docs

# 2. Work on the feature with auto-activated skills

# 3. Before taking a break, update docs
/dev-docs-update

# 4. When ready for review
"Review the changes in [file/directory]"
```

### Refactoring Code

```bash
# 1. Request analysis
"Analyze src/tools/tofd-calculator for refactoring opportunities"

# 2. Review suggestions from refactoring-agent

# 3. Proceed with refactoring step-by-step

# 4. Run tests after each step
```

### Debugging

```bash
# 1. Describe the issue with context
"The TOFD calculator returns NaN for angles > 75 degrees"

# 2. Claude activates ndt-domain-expert + frontend-development

# 3. Get domain-specific debugging help

# 4. Implement fix with validation
```

## Customizing for Your Workflow

### Adjust Activation Sensitivity

In `skill-rules.json`:
```json
{
  "globalSettings": {
    "activationThreshold": 2  // Lower = more sensitive (try 1)
  }
}
```

### Add Keywords for Your Domain

In `skill-rules.json`, add to a skill's keywords:
```json
{
  "keywords": [
    // Existing keywords...
    "your-specific-term",
    "another-term"
  ]
}
```

### Create a New Skill

1. Copy an existing skill file as template
2. Customize for your needs
3. Add activation rules to `skill-rules.json`
4. Test with relevant prompts

## Tips for Success

### Be Specific in Prompts

❌ **Vague**: "Fix the bug"
✅ **Specific**: "Fix the TOFD calculator's division by zero error when angle is 0"

### Reference Files and Locations

❌ **Unclear**: "Update the component"
✅ **Clear**: "Update InspectionCard component in src/components/ to show loading state"

### Use Commands for Routine Tasks

Instead of asking Claude to create documentation structure each time, use:
```
/dev-docs
```

### Update Dev-Docs Regularly

Before context resets or long breaks:
```
/dev-docs-update
```

This preserves your progress and decisions.

## Understanding Skills

### When Each Skill Activates

**frontend-development**:
- Editing `.jsx` files
- Keywords: component, react, useState, etc.
- Creating UI, routing, styling

**backend-development**:
- Editing Supabase functions (`.ts`)
- Keywords: api, database, migration, etc.
- Backend logic, database work

**ndt-domain-expert**:
- Working in `tools/` directory
- Keywords: tofd, cscan, inspection, etc.
- NDT-specific calculations and logic

**testing-development**:
- Editing `.test.js` files
- Keywords: test, coverage, etc.
- Writing and running tests

### Multiple Skills Can Activate

Example: Working on TOFD calculator component
- `frontend-development` (it's a React component)
- `ndt-domain-expert` (TOFD domain knowledge)

Both provide relevant context!

## Troubleshooting

### "Skills aren't activating"

1. Check `settings.json` → `skills.autoActivation: true`
2. Try more specific prompts with keywords
3. Lower `activationThreshold` in `skill-rules.json`
4. Mention the skill name explicitly: "Using the frontend-development skill..."

### "I want to deactivate a skill"

Skills auto-deactivate when you move to different context, but you can say:
```
"Let's focus on just the backend work now"
```

### "How do I know which skills are active?"

Claude will mention activated skills:
```
"I've activated the frontend-development skill..."
```

## Next Steps

Now that you're familiar with the basics:

1. **Explore the skills**: Read through `.claude/skills/` to see available knowledge
2. **Try commands**: Test each command in `.claude/commands/`
3. **Use agents**: Request code reviews, refactoring analysis
4. **Customize**: Add your own patterns and keywords

## Resources

- [Full README](./../README.md)
- [System Architecture](./architecture/system-overview.md)
- [Skills Directory](./../skills/)
- [Original Blog Post](https://dev.to/diet-code103/claude-code-is-a-beast-tips-from-6-months-of-hardcore-use-572n)

---

**Remember**: The goal is "Skills activate when you need them, not when you remember them." Let the auto-activation system work for you!
