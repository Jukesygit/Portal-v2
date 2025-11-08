# Original Calculation Engines - READ ONLY

**Purpose**: Preserved from original NDT-SUITE-UMBER system for reference during rebuild
**Status**: REFERENCE ONLY - DO NOT MODIFY
**Created**: 2025-11-08

---

## ⚠️ CRITICAL INSTRUCTIONS

These files are **READ-ONLY REFERENCES**. They represent the battle-tested logic from the production system.

### When Reimplementing:

1. **STUDY** the logic thoroughly
2. **REWRITE** in TypeScript with proper types
3. **ADD** comprehensive unit tests
4. **VALIDATE** output matches original (within tolerance)
5. **DOCUMENT** any improvements or changes made

### DO NOT:
- ❌ Copy-paste code directly without understanding
- ❌ Modify these reference files
- ❌ Use vanilla JS patterns in new system
- ❌ Skip testing against original output

---

## Preserved Calculation Engines

### TOFD Calculator (`tofd-calculator.js`)
**Size**: ~21KB
**Purpose**: Time-of-Flight Diffraction coverage and dead zone calculations
**Critical**: Physics-based formulas for probe spacing, frequency, thickness
**Tests Required**: Validate against known test cases with ±0.01mm tolerance

### NII Coverage Calculator (`nii-coverage-calculator.js`)
**Size**: ~37KB
**Purpose**: Neutron Imaging Inspection coverage calculations
**Critical**: Domain-specific coverage formulas
**Tests Required**: Validate against production data

### C-Scan Visualizer (`cscan-visualizer.js`)
**Size**: ~86KB
**Purpose**: C-Scan ultrasonic data visualization and rendering
**Critical**: Data interpretation and rendering logic
**Tests Required**: Visual regression testing, data parsing accuracy

### PEC Visualizer (`pec-visualizer.js`)
**Size**: ~33KB
**Purpose**: Pulsed Eddy Current (PEC) data visualization
**Critical**: Eddy current signal processing
**Tests Required**: Signal processing accuracy, visualization correctness

### 3D Viewer (`3d-viewer.js`)
**Size**: ~74KB
**Purpose**: 3D asset visualization
**Critical**: 3D rendering pipeline, camera controls
**Tests Required**: Rendering performance, interaction accuracy

---

## Migration Strategy

### Phase 1: Extract and Understand
1. Read the original code
2. Document inputs, outputs, and formulas
3. Create test cases from production data
4. Identify dependencies and data structures

### Phase 2: Reimplement in TypeScript
```typescript
// Example transformation:
// Original (vanilla JS):
function calculateTOFD(probe, freq, thickness) { ... }

// New (TypeScript):
interface TOFDParams {
  probeSpacing: number;  // mm
  frequency: number;      // MHz
  thickness: number;      // mm
}

interface TOFDResult {
  coverage: number;       // mm
  deadZone: {
    upper: number;        // mm
    lower: number;        // mm
  };
}

export function calculateTOFD(params: TOFDParams): TOFDResult { ... }
```

### Phase 3: Test Parity
```typescript
// tests/validation/tofd-parity.test.ts
import { calculateTOFD } from '@/services/calculations/tofd';
import originalTestCases from '@/test-data/tofd-cases.json';

describe('TOFD Parity Tests', () => {
  originalTestCases.forEach(testCase => {
    it(`should match original for ${testCase.name}`, () => {
      const result = calculateTOFD(testCase.input);
      expect(result.coverage).toBeCloseTo(testCase.expected.coverage, 2);
    });
  });
});
```

---

## Key Formulas to Preserve

### TOFD Dead Zone Calculation
```javascript
// Upper dead zone = (probe spacing × velocity) / (2 × frequency)
// Lower dead zone = (thickness - upper dead zone)
```

### NII Coverage
```javascript
// Coverage area = inspection width × effective penetration depth
```

---

## Data Structures Used

### Inspection Parameters
```javascript
{
  method: 'TOFD' | 'UT' | 'RT' | 'MT' | 'PT' | 'VT' | 'ET',
  parameters: {
    frequency: number,
    probeSpacing: number,
    thickness: number,
    // ... method-specific
  }
}
```

### Calculation Results
```javascript
{
  coverage: number,
  deadZones: { upper: number, lower: number },
  effectiveness: number,  // 0-100%
  acceptance: 'pass' | 'fail' | 'review'
}
```

---

## Validation Requirements

Each reimplemented calculation MUST:
1. ✅ Pass all original test cases
2. ✅ Match within specified tolerance (±0.01mm for dimensions)
3. ✅ Handle edge cases (zero values, extremes)
4. ✅ Provide clear error messages
5. ✅ Include performance benchmarks
6. ✅ Document any formula improvements

---

## Notes on Original Code Quality

### Strengths
- ✅ Correct physics-based calculations
- ✅ Battle-tested in production
- ✅ Handles complex NDT scenarios
- ✅ Well-commented formulas

### Areas for Improvement in Rewrite
- 🔄 Add TypeScript types for safety
- 🔄 Separate pure calculation logic from UI
- 🔄 Add comprehensive error handling
- 🔄 Improve performance with memoization
- 🔄 Add input validation with Zod schemas
- 🔄 Create calculation services layer
- 🔄 Add logging for debugging

---

## Reference Commands

### View Original Implementation
```bash
# View TOFD calculator
cat reference/original-calculations/tofd-calculator.js

# Compare with new implementation
diff reference/original-calculations/tofd-calculator.js packages/ndt-calculations/src/tofd.ts
```

### Extract Test Cases
```bash
# Generate test cases from original code comments
grep -A 10 "// Test case" reference/original-calculations/tofd-calculator.js
```

---

## Related Documentation

- Original repo: https://github.com/Jukesygit/NDT-SUITE-UMBER
- NDT standards: ASNT SNT-TC-1A, ISO 9712, ASME Section V
- Physics references: [Add ultrasonic testing physics references]
- Migration guide: `dev/active/ndt-suite-rebuild/plan.md`

---

## Changelog

- **2025-11-08**: Initial preservation of 5 calculation engines
- Future: Document discovered edge cases or bugs

---

**Status**: ✅ PRESERVED
**Next Action**: Study these files during Phase 1 Week 10 (NDT calculations migration)
**Owner**: Claude Code + NDT Domain Expert
