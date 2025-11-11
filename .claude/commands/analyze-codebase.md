---
name: analyze-codebase
description: Perform comprehensive codebase analysis for architecture, patterns, and issues
---

# Analyze Codebase

Perform a thorough analysis of the codebase to understand:
- Architecture and structure
- Code patterns and conventions
- Potential issues and tech debt
- Improvement opportunities

## Your Task

### 1. Structure Analysis

**Map the codebase**:
```bash
# Get directory structure
# Count files by type
# Identify main modules/features
# Document file organization
```

**Output**:
```markdown
## Codebase Structure

### Overview
- Total files: X
- Lines of code: Y
- Primary language: JavaScript/TypeScript
- Framework: React 19

### Directory Structure
\`\`\`
src/
├── components/     (15 files) - Reusable UI components
├── pages/          (8 files)  - Route components
├── tools/          (12 files) - NDT calculation tools
└── ...
\`\`\`

### Key Modules
1. **TOFD Calculator** - Coverage and dead zone calculations
2. **C-Scan Visualizer** - Ultrasonic data visualization
...
```

### 2. Pattern Analysis

**Identify patterns**:
- Component patterns (class vs functional, hooks usage)
- State management approach
- Data fetching patterns
- Error handling patterns
- Styling approach
- Testing coverage

**Output**:
```markdown
## Code Patterns

### Component Architecture
- **Pattern**: Functional components with hooks
- **Consistency**: 90% (2 old class components)
- **Recommendation**: Convert remaining class components

### State Management
- **Pattern**: useState for local, lifting state for sharing
- **Issues**: Some prop drilling (3+ levels)
- **Recommendation**: Introduce Zustand for complex shared state

### Data Fetching
- **Pattern**: useEffect + Supabase client
- **Issues**: No loading states in 30% of components
- **Recommendation**: Migrate to TanStack Query
```

### 3. Code Quality Analysis

**Check for**:
- Large files (>300 lines)
- Complex functions (cyclomatic complexity >10)
- Duplicate code
- Missing error handling
- Missing tests
- Security issues

**Output**:
```markdown
## Code Quality Issues

### Large Files
1. `src/tools/tofd-calculator/calculator.js` - 450 lines
   - **Recommendation**: Split into calculation.js and validation.js

### Complex Functions
1. `processInspectionData()` - Complexity: 15
   - **Recommendation**: Extract validation and formatting

### Duplicate Code
Found 3 instances of similar validation logic:
- `src/tools/tofd-calculator/`
- `src/tools/cscan-visualizer/`
- `src/tools/nii-calculator/`
**Recommendation**: Create shared validation utility

### Missing Tests
- **Coverage**: ~10%
- **Priority**: Add tests for calculation engines
```

### 4. Dependency Analysis

**Analyze**:
- package.json dependencies
- Outdated packages
- Security vulnerabilities
- Bundle size contributors

**Output**:
```markdown
## Dependencies

### Current Stack
- React: 19.2.0 ✅ (latest)
- Vite: 5.0.0 ✅ (latest)
- Supabase: 2.75.0 ⚠️ (2.80.0 available)

### Security Issues
- None found ✅

### Bundle Size
- Total: 450 KB
- Largest: three.js (180 KB)
- **Recommendation**: Lazy load 3D viewer
```

### 5. Architecture Assessment

**Evaluate**:
- Separation of concerns
- Modularity
- Scalability
- Maintainability

**Output**:
```markdown
## Architecture Assessment

### Strengths
✅ Clear separation: components/pages/tools
✅ Domain logic separated from UI (calculators)
✅ Consistent naming conventions

### Weaknesses
⚠️ Mixed JS and JSX extensions
⚠️ No clear data layer abstraction
⚠️ Testing infrastructure minimal

### Scalability
**Current**: Supports current feature set well
**Future**: Will struggle with:
- Multiple simultaneous inspections
- Real-time collaboration
- Complex data visualizations

**Recommendation**: Follow rebuild plan (microservices architecture)
```

### 6. Technical Debt

**Identify**:
- TODO comments
- Commented-out code
- Temporary workarounds
- Known bugs

**Output**:
```markdown
## Technical Debt

### High Priority
1. **Missing input validation** - TOFD/CSCAN calculators
   - Risk: Invalid calculations
   - Effort: 2 days

2. **No error boundaries** - App crashes on component errors
   - Risk: Poor UX
   - Effort: 1 day

### Medium Priority
1. **Inconsistent error handling**
2. **Missing loading states**

### Low Priority
1. **Console.log statements** (15 found)
2. **TODO comments** (8 found)
```

## Comprehensive Report Format

Combine all analyses into a structured report:

```markdown
# Codebase Analysis Report
**Date**: YYYY-MM-DD
**Analyzer**: Claude Code

## Executive Summary
Brief overview of findings and recommendations

## 1. Codebase Structure
[Structure analysis]

## 2. Code Patterns
[Pattern analysis]

## 3. Code Quality
[Quality issues]

## 4. Dependencies
[Dependency analysis]

## 5. Architecture
[Architecture assessment]

## 6. Technical Debt
[Debt inventory]

## Recommendations

### Immediate Actions (This Week)
1. Fix high-priority security issues
2. Add error boundaries

### Short-Term (This Month)
1. Improve test coverage to 50%
2. Refactor large files

### Long-Term (This Quarter)
1. Follow rebuild plan
2. Migrate to microservices

## Conclusion
Overall health: Good / Fair / Needs Improvement
Ready for scaling: Yes / With modifications / No
```

## Usage

Run this command when:
- Starting work on a new codebase
- Before major refactoring
- Quarterly health checks
- Before architectural decisions

## Output Location

Save report to: `.claude/docs/analysis/codebase-analysis-YYYY-MM-DD.md`
