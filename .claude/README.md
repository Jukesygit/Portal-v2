# Claude Code Infrastructure

**Project**: NDT Tool Suite
**Created**: 2025-11-11
**Based on**: "Claude Code is a Beast" best practices ([source](https://github.com/diet103/claude-code-infrastructure-showcase))

This directory contains the Claude Code infrastructure that enables intelligent skill auto-activation, specialized agents, workflow commands, and comprehensive documentation.

## 📁 Directory Structure

```
.claude/
├── README.md                    # This file
├── settings.json                # Project configuration
├── skill-rules.json             # Auto-activation rules
├── skills/                      # Reusable knowledge & patterns
│   ├── frontend-development.md
│   ├── backend-development.md
│   ├── ndt-domain-expert.md
│   └── testing-development.md
├── hooks/                       # Event-triggered automations
│   ├── skill-activation-prompt.md
│   └── post-tool-use-tracker.md
├── agents/                      # Specialized task agents
│   ├── code-reviewer.md
│   ├── refactoring-agent.md
│   └── documentation-agent.md
├── commands/                    # Slash commands
│   ├── dev-docs.md
│   ├── dev-docs-update.md
│   └── analyze-codebase.md
└── docs/                        # Project documentation
    ├── architecture/            # System architecture docs
    │   └── system-overview.md
    └── resources/               # Detailed guides (future)
```

## 🎯 Core Concepts

### Skills

**What**: Reusable knowledge bases containing patterns, best practices, and how-to guides

**When activated**: Automatically based on file context and user intent, or manually requested

**Current skills**:
- **frontend-development**: React 19, Vite, component patterns
- **backend-development**: Supabase Edge Functions, PostgreSQL, RLS
- **ndt-domain-expert**: NDT methods, calculations, compliance standards
- **testing-development**: Testing strategy, Vitest, RTL, Playwright

**Key feature**: Skills follow the **500-line rule** - main file stays under 500 lines with references to detailed resource files for progressive disclosure.

### Hooks

**What**: Event-driven automations that run at specific points in the workflow

**Current hooks**:
- **skill-activation-prompt** (UserPromptSubmit): Analyzes prompts and context to auto-activate relevant skills
- **post-tool-use-tracker** (PostToolUse): Tracks tool usage patterns and provides context-aware suggestions

**How it works**: Hooks analyze context (files being edited, prompt keywords, recent actions) and suggest or activate relevant skills automatically.

### Agents

**What**: Specialized AI agents focused on specific complex tasks

**Current agents**:
- **code-reviewer**: Reviews code for quality, security, performance, and standards
- **refactoring-agent**: Performs systematic refactoring with step-by-step plans
- **documentation-agent**: Creates and maintains comprehensive documentation

**When to use**: Call agents for specialized tasks that require focused expertise and multi-step workflows.

### Commands

**What**: Slash commands for common workflows

**Current commands**:
- `/dev-docs`: Create structured documentation (plan, context, tasks)
- `/dev-docs-update`: Update docs before context resets
- `/analyze-codebase`: Comprehensive codebase analysis

**How to use**: Type `/command-name` to activate the workflow.

## 🚀 Auto-Activation System

The heart of this infrastructure is the **skill auto-activation system**.

### How It Works

1. **User submits a prompt** → Triggers `skill-activation-prompt` hook
2. **Hook analyzes context**:
   - Current file paths and types
   - Keywords in prompt
   - Recent file edits
   - Pattern matching against `skill-rules.json`
3. **Score calculation**: Each skill gets a relevance score
4. **Activation decision**:
   - If score ≥ threshold (default: 2 matches)
   - If `autoActivate: true` in rules
   - Respect `maxActiveSkills` limit (default: 3)
5. **Skill loaded**: Relevant knowledge injected into context
6. **User notified**: "I've activated the [skill-name] skill..."

### Example Auto-Activation

**Scenario**: User says "Update the TOFD calculator to handle new probe sizes"

**Matching**:
- Keywords: "tofd", "calculator" → Matches `ndt-domain-expert`
- File pattern: Working in `src/tools/tofd-calculator/` → Matches `frontend-development`
- Prompt pattern: "update.*calculator" → Matches both skills

**Result**: Both skills auto-activated with priority to `ndt-domain-expert` (priority: 2)

## 📊 Skill Rules Configuration

`skill-rules.json` defines when each skill activates:

```json
{
  "skillName": "frontend-development",
  "triggers": {
    "filePatterns": ["**/src/**/*.jsx", "**/src/components/**/*"],
    "keywords": ["react", "component", "useState", "jsx"],
    "promptPatterns": ["create.*component", "add.*page"]
  },
  "autoActivate": true,
  "priority": 1
}
```

**Customization**: Edit `skill-rules.json` to:
- Add new skills
- Adjust file patterns for your project structure
- Add domain-specific keywords
- Change activation thresholds

## 🛠️ Usage Examples

### Working with Frontend Components

```
You: "Create a new inspection results component"

Claude: "I'll help you create that component. I've activated the
frontend-development skill which contains our React/Vite patterns.

[Creates component following project patterns...]"
```

### NDT Calculations

```
You: "Fix the TOFD dead zone calculation for steep angles"

Claude: "I've activated both the ndt-domain-expert and frontend-development
skills for this task.

From the NDT domain knowledge, for steep angles (>75°), we need to account
for...

[Provides domain-specific guidance and implements fix...]"
```

### Code Review

```
You: "Review the changes in src/tools/cscan-visualizer/"

Claude: "I'll activate the code-reviewer agent for this.

[Performs comprehensive review with security, performance, and quality checks...]"
```

## 📋 Dev-Docs Pattern

The **dev-docs pattern** preserves project knowledge across Claude sessions using three files:

1. **{feature}-plan.md**: Implementation plan, phases, success criteria
2. **{feature}-context.md**: Architectural decisions, key files, integrations
3. **{feature}-tasks.md**: Task checklist, progress, blockers

**Workflow**:
```bash
# Start new feature
/dev-docs

# Work on feature...

# Before context reset
/dev-docs-update
```

**Current dev-docs** (existing):
- `ndt-suite-rebuild-plan.md`
- `ndt-suite-rebuild-context.md`
- `ndt-suite-rebuild-tasks.md`

## 🎨 Customization Guide

### Adding a New Skill

1. Create `skills/your-skill-name.md`
2. Follow the template:
   ```markdown
   # Skill Name
   **Domain**: What it covers
   **Last Updated**: YYYY-MM-DD

   ## Quick Reference
   [Brief overview]

   ## Core Principles
   [Key concepts]

   ## Common Tasks
   [How-to guides]

   ## Resources
   Links to detailed docs
   ```
3. Keep main file under 500 lines
4. Add activation rules to `skill-rules.json`
5. Test activation with relevant prompts

### Adding a New Agent

1. Create `agents/your-agent.md`
2. Define mission and workflow
3. Specify when to use the agent
4. Document output format

### Adding a New Command

1. Create `commands/your-command.md`
2. Add frontmatter with name and description
3. Define the workflow steps
4. Test with `/your-command`

## 🔧 Configuration

### settings.json

Controls infrastructure behavior:

```json
{
  "skills": {
    "autoActivation": true,           // Enable/disable auto-activation
    "rulesFile": ".claude/skill-rules.json"
  },
  "hooks": {
    "enabled": {
      "skill-activation-prompt": true,
      "post-tool-use-tracker": true
    }
  },
  "project": {
    "type": "monorepo-candidate",
    "framework": "react-vite",
    "paths": {
      // Project-specific paths
    }
  }
}
```

### skill-rules.json

Controls auto-activation logic:

```json
{
  "rules": [...],
  "globalSettings": {
    "maxActiveSkills": 3,              // Max simultaneous skills
    "activationThreshold": 2,          // Min matches to activate
    "deactivateOnContextSwitch": false,
    "verboseLogging": false
  }
}
```

## 📈 Best Practices

### 1. Progressive Disclosure

**Main skill file** (under 500 lines):
- Quick reference
- Core principles
- Common tasks
- Links to detailed resources

**Resource files** (no limit):
- Detailed guides
- Comprehensive examples
- Edge cases
- Advanced topics

### 2. Specificity in Prompts

❌ Vague: "Fix the calculator"
✅ Specific: "Fix the TOFD calculator's upper dead zone calculation for angles > 75°"

### 3. Documentation Hierarchy

```
Broad Overview (system-overview.md)
    ↓
Module Documentation (skill files)
    ↓
Detailed Guides (resource files)
    ↓
Code Comments (JSDoc)
```

### 4. Regular Updates

- Update skills when patterns change
- Update dev-docs before context resets
- Review skill-rules quarterly
- Keep documentation in sync with code

## 🎓 Learning Resources

### Internal Documentation

- [System Architecture](docs/architecture/system-overview.md)
- [Rebuild Plan](../NDT-SUITE-UMBER-Experimental/ndt-suite-rebuild-plan.md)
- [Rebuild Context](../NDT-SUITE-UMBER-Experimental/ndt-suite-rebuild-context.md)

### External Resources

- [Claude Code Best Practices (Reddit/DEV.to)](https://dev.to/diet-code103/claude-code-is-a-beast-tips-from-6-months-of-hardcore-use-572n)
- [Infrastructure Showcase (GitHub)](https://github.com/diet103/claude-code-infrastructure-showcase)
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)

## 🧪 Testing the System

### Test Auto-Activation

1. Edit a file in `src/components/`
2. Prompt: "Add error handling to this component"
3. Expected: `frontend-development` skill activates

### Test Agents

1. Run: Request code review for recent changes
2. Expected: `code-reviewer` agent activates with structured review

### Test Commands

1. Run: `/dev-docs`
2. Expected: Creates plan, context, and tasks files

## 🐛 Troubleshooting

### Skills Not Auto-Activating

**Check**:
1. `settings.json` → `skills.autoActivation: true`
2. `skill-rules.json` → File patterns match your structure
3. Prompt contains matching keywords
4. At least 2 triggers matching (default threshold)

**Solution**: Lower `activationThreshold` to 1, or add more keywords/patterns

### Hooks Not Running

**Check**:
1. `settings.json` → Hook enabled
2. Hook file exists in `hooks/`
3. Frontmatter correct (trigger, name, enabled)

### Commands Not Found

**Check**:
1. File exists in `commands/`
2. Frontmatter has `name` field
3. Try full path: `/dev-docs` not just `dev-docs`

## 📊 Infrastructure Stats

- **Skills**: 4 (frontend, backend, NDT, testing)
- **Hooks**: 2 (activation, tracker)
- **Agents**: 3 (reviewer, refactoring, documentation)
- **Commands**: 3 (dev-docs workflows, analysis)
- **Documentation**: System architecture + resources
- **Total Size**: ~1500 lines of knowledge (following 500-line rule)

## 🚀 Next Steps

### Immediate (Phase 1)

- [ ] Test auto-activation with real workflows
- [ ] Gather team feedback on skills
- [ ] Add project-specific resource files
- [ ] Document any missing patterns

### Short-term (Phase 2)

- [ ] Create additional skills as needed
- [ ] Add more specialized agents
- [ ] Expand resource documentation
- [ ] Create workflow-specific commands

### Long-term (Phase 3)

- [ ] Track metrics on skill usage
- [ ] Optimize activation rules
- [ ] Create skill templates for common patterns
- [ ] Expand to mobile development (React Native)

## 🤝 Contributing

When adding to this infrastructure:

1. **Follow the 500-line rule** for skills
2. **Test auto-activation** before committing
3. **Update this README** if adding new concepts
4. **Document your additions** with clear examples
5. **Keep consistency** with existing patterns

## 📝 Maintenance

### Weekly

- [ ] Review skill activation patterns
- [ ] Update dev-docs before context resets

### Monthly

- [ ] Review and update outdated skills
- [ ] Check for new patterns to document
- [ ] Optimize skill-rules based on usage

### Quarterly

- [ ] Comprehensive infrastructure review
- [ ] Update based on team feedback
- [ ] Align with project evolution
- [ ] Clean up unused components

## 📞 Support

For questions about this infrastructure:
1. Review this README and referenced docs
2. Check the showcase repository for examples
3. Experiment with `/analyze-codebase` command
4. Consult the original "Claude Code is a Beast" article

---

**Remember**: This infrastructure is designed to **activate when you need it, not when you remember it**. The auto-activation system learns your workflow and provides relevant knowledge contextually.

Happy coding with Claude! 🚀
