# NDT Domain Expert Skill

**Domain**: Non-Destructive Testing (NDT)
**Project**: NDT Tool Suite
**Last Updated**: 2025-11-11

## Quick Reference

This skill provides domain expertise for Non-Destructive Testing methods, calculations, compliance requirements, and industry standards.

**NDT Methods Covered**:
- TOFD (Time-of-Flight Diffraction)
- C-Scan (Ultrasonic C-Scan Imaging)
- PEC (Pulsed Eddy Current)
- NII (Normally Incident Inspection)
- 3D Visualization

**Compliance Standards**:
- ASNT SNT-TC-1A (Personnel Certification)
- ISO 9712 (Personnel Certification)
- ASME Section V (NDT Methods)
- ISO 9001 (Quality Management)

**Key Files**:
- TOFD Calculator: `src/tools/tofd-calculator/`
- C-Scan Visualizer: `src/tools/cscan-visualizer/`
- PEC Visualizer: `src/tools/pec-visualizer/`
- NII Calculator: `src/tools/nii-coverage-calculator/`
- 3D Viewer: `src/tools/3d-viewer/`

---

## NDT Methods Overview

### TOFD (Time-of-Flight Diffraction)

**Purpose**: Detect and size flaws in welds and materials using ultrasonic waves

**Key Concepts**:
```javascript
// Coverage Calculation
// Coverage = Width of inspection zone between probes
// Dead Zone = Area where detection is not possible

// Lateral Wave Dead Zone (top surface)
const lateralDeadZone = (PCS / 2) * Math.tan(angleRad);

// Backwall Dead Zone (bottom surface)
const backwallDeadZone = PCS / (2 * Math.tan(angleRad));

// Upper Dead Zone
const upperDeadZone = PCS * Math.tan(angleRad) / 2;

// Lower Dead Zone
const lowerDeadZone = PCS / (2 * Math.tan(angleRad));
```

**Input Parameters**:
- **PCS** (Probe Center Spacing): Distance between transmitter and receiver probes (mm)
- **Angle**: Refracted angle of ultrasonic beam (degrees)
- **Thickness**: Material thickness (mm)
- **Frequency**: Probe frequency (MHz)
- **Velocity**: Sound velocity in material (m/s)

**Critical Calculations**:
```javascript
// Convert angle to radians
const angleRad = (angle * Math.PI) / 180;

// Coverage width at specific depth
function calculateCoverage(pcs, angle, depth) {
  const angleRad = (angle * Math.PI) / 180;
  return pcs - (2 * depth * Math.tan(angleRad));
}

// Total coverage zone
function calculateTotalCoverage(pcs, angle, thickness) {
  const upperDZ = calculateUpperDeadZone(pcs, angle);
  const lowerDZ = calculateLowerDeadZone(pcs, angle);
  return {
    effectiveThickness: thickness - upperDZ - lowerDZ,
    coverage: pcs - (2 * upperDZ * Math.tan(angle))
  };
}
```

**Acceptance Criteria**:
- Dead zones should be minimized
- Coverage must span full inspection volume
- Overlapping scans for critical areas
- Minimum 10% overlap between scan passes

### C-Scan (Ultrasonic Imaging)

**Purpose**: Create 2D/3D images of material internal structure

**Data Structure**:
```javascript
// C-Scan data format
{
  width: number,    // Scan width (mm)
  height: number,   // Scan height (mm)
  resolution: {
    x: number,      // Points per mm in X
    y: number       // Points per mm in Y
  },
  data: number[][],  // Amplitude matrix
  threshold: number, // Alarm threshold
  metadata: {
    frequency: number,
    velocity: number,
    gate: { start: number, end: number }
  }
}
```

**Visualization Requirements**:
- Color mapping: Low (blue) → High (red) amplitude
- Threshold overlay for indications
- Measurement tools (distance, area)
- Export to PDF/image formats

**Analysis Features**:
- Indication detection (above threshold)
- Size measurement (length, width, area)
- Depth calculation from gate settings
- Statistical analysis (min, max, average amplitude)

### PEC (Pulsed Eddy Current)

**Purpose**: Detect corrosion and wall thickness loss under insulation (CUI)

**Key Principles**:
- Electromagnetic induction
- Penetrates insulation and coating
- Measures remaining wall thickness
- Sensitive to corrosion

**Data Interpretation**:
```javascript
// PEC Signal Analysis
{
  nominalThickness: number,  // Original wall thickness
  measuredThickness: number, // Current wall thickness
  wallLoss: number,          // Thickness loss (mm)
  percentLoss: number,       // Percentage loss
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Calculate severity
function calculateSeverity(percentLoss) {
  if (percentLoss < 10) return 'low';
  if (percentLoss < 20) return 'medium';
  if (percentLoss < 30) return 'high';
  return 'critical';
}
```

### NII (Normally Incident Inspection)

**Purpose**: Calculate coverage for corrosion mapping inspections

**Coverage Calculation**:
```javascript
// Grid coverage for NII scans
function calculateNIICoverage(params) {
  const {
    scanLength,      // Length of scan area (mm)
    scanWidth,       // Width of scan area (mm)
    beamDiameter,    // Probe beam diameter (mm)
    indexOffset      // Spacing between scan lines (mm)
  } = params;

  // Number of scan lines
  const numLines = Math.ceil(scanWidth / indexOffset) + 1;

  // Coverage per line
  const coveragePerLine = scanLength * beamDiameter;

  // Total coverage
  const totalCoverage = coveragePerLine * numLines;

  // Area to be inspected
  const totalArea = scanLength * scanWidth;

  // Coverage percentage
  const coveragePercent = (totalCoverage / totalArea) * 100;

  return {
    numLines,
    totalCoverage,
    totalArea,
    coveragePercent,
    overlap: calculateOverlap(beamDiameter, indexOffset)
  };
}

function calculateOverlap(beamDiameter, indexOffset) {
  if (indexOffset >= beamDiameter) {
    return 0; // No overlap
  }
  const overlap = beamDiameter - indexOffset;
  return (overlap / beamDiameter) * 100;
}
```

**Minimum Requirements**:
- 100% coverage for critical areas
- Minimum 10% overlap recommended
- Grid pattern documented
- Scan plan approved before execution

---

## Compliance & Standards

### ASNT SNT-TC-1A

**Personnel Certification Levels**:
```javascript
const certificationLevels = {
  'Level I': {
    requirements: [
      'Perform inspections under supervision',
      'Record results',
      'Basic interpretation'
    ],
    minHours: 40,  // Training hours
    minExperience: 3  // Months
  },
  'Level II': {
    requirements: [
      'Perform and interpret inspections',
      'Write procedures',
      'Train Level I personnel',
      'Report results'
    ],
    minHours: 80,
    minExperience: 12
  },
  'Level III': {
    requirements: [
      'Establish procedures',
      'Interpret standards',
      'Certify Level I & II personnel',
      'Technical guidance'
    ],
    minHours: 120,
    minExperience: 48
  }
};
```

**Tracking Requirements**:
- Certification expiration (typically 3-5 years)
- Vision test (annual)
- Continuing education hours
- Method-specific certifications
- Employer certification documents

### ASME Section V

**Written Practice Requirements**:
```javascript
// Required elements in written procedure
const procedureElements = [
  'Scope and applicability',
  'Personnel qualifications',
  'Equipment requirements',
  'Calibration requirements',
  'Examination technique',
  'Recording of results',
  'Acceptance criteria',
  'Documentation requirements'
];
```

**Equipment Calibration**:
- **Frequency**: Before each use, periodic intervals
- **Standards**: Reference blocks, calibration samples
- **Documentation**: Calibration certificates, dates, results
- **Traceability**: Equipment serial numbers, calibration history

### ISO 9001 Quality Management

**Document Control**:
```javascript
// Document metadata
{
  documentId: string,
  version: string,
  revisionDate: Date,
  author: string,
  approver: string,
  status: 'draft' | 'approved' | 'obsolete',
  distributionList: string[],
  changeHistory: Array<{
    version: string,
    date: Date,
    changes: string,
    author: string
  }>
}
```

**Required Records**:
- Inspection reports
- Procedure qualifications (PQR)
- Personnel qualifications
- Equipment calibration
- Non-conformance reports (NCR)
- Corrective actions (CAPA)

---

## Calculation Best Practices

### Input Validation

**Always validate NDT parameters**:
```javascript
function validateTOFDInputs(pcs, angle, thickness, frequency) {
  const errors = [];

  // PCS validation
  if (pcs <= 0 || pcs > 500) {
    errors.push('PCS must be between 0 and 500 mm');
  }

  // Angle validation
  if (angle < 30 || angle > 90) {
    errors.push('Angle must be between 30° and 90°');
  }

  // Thickness validation
  if (thickness <= 0 || thickness > 500) {
    errors.push('Thickness must be between 0 and 500 mm');
  }

  // Frequency validation
  if (frequency < 0.5 || frequency > 15) {
    errors.push('Frequency must be between 0.5 and 15 MHz');
  }

  // Geometric validation
  const angleRad = (angle * Math.PI) / 180;
  const upperDeadZone = (pcs * Math.tan(angleRad)) / 2;
  const lowerDeadZone = pcs / (2 * Math.tan(angleRad));

  if (upperDeadZone + lowerDeadZone >= thickness) {
    errors.push('Dead zones exceed material thickness - adjust PCS or angle');
  }

  return errors;
}
```

### Unit Conversions

**Common Conversions**:
```javascript
// Length conversions
const mmToInches = (mm) => mm / 25.4;
const inchesToMm = (inches) => inches * 25.4;

// Velocity conversions
const mpsToInchesPerUs = (mps) => mps / 25400;
const inchesPerUsToMps = (ipus) => ipus * 25400;

// Always store in SI units internally
// Display in user's preferred units
```

### Precision & Rounding

**Appropriate Precision**:
```javascript
// Measurements typically to 0.1 mm precision
const roundToTenth = (value) => Math.round(value * 10) / 10;

// Percentages to 1 decimal
const roundPercent = (value) => Math.round(value * 10) / 10;

// Angles to 1 decimal degree
const roundAngle = (angle) => Math.round(angle * 10) / 10;

// Use toFixed() for display only, not calculations
const displayValue = roundToTenth(calculatedValue).toFixed(1);
```

---

## Data Management

### Inspection Data Structure

**Comprehensive Inspection Record**:
```javascript
{
  id: uuid,
  inspectionNumber: string,
  asset: {
    id: uuid,
    name: string,
    type: 'vessel' | 'pipeline' | 'weld' | 'other',
    location: string
  },
  method: 'TOFD' | 'CSCAN' | 'PEC' | 'NII',
  inspector: {
    id: uuid,
    name: string,
    certification: {
      level: 'I' | 'II' | 'III',
      expirationDate: Date,
      certifyingBody: string
    }
  },
  procedure: {
    id: string,
    revision: string,
    title: string
  },
  equipment: [{
    type: string,
    manufacturer: string,
    serialNumber: string,
    calibrationDate: Date,
    calibrationDue: Date
  }],
  parameters: {
    // Method-specific parameters
  },
  results: {
    indications: [{
      location: { x, y, z },
      size: { length, width, depth },
      severity: string,
      acceptability: 'accept' | 'reject' | 'repair'
    }],
    coverage: number,  // Percentage
    completeness: boolean
  },
  documentation: {
    scanData: string[],  // File paths
    images: string[],
    reports: string[]
  },
  timestamps: {
    created: Date,
    started: Date,
    completed: Date
  },
  status: 'planned' | 'in-progress' | 'completed' | 'approved',
  approvals: [{
    approver: uuid,
    date: Date,
    role: string
  }]
}
```

### Report Generation

**Required Report Sections**:
```javascript
const reportSections = [
  {
    section: 'Cover Page',
    elements: ['Project name', 'Inspection date', 'Report number', 'Revision']
  },
  {
    section: 'Executive Summary',
    elements: ['Scope', 'Results summary', 'Recommendations']
  },
  {
    section: 'Procedure',
    elements: ['Method', 'Procedure number/revision', 'Equipment', 'Personnel']
  },
  {
    section: 'Results',
    elements: ['Scan data', 'Indications', 'Measurements', 'Images']
  },
  {
    section: 'Analysis',
    elements: ['Interpretation', 'Severity assessment', 'Acceptance criteria']
  },
  {
    section: 'Conclusions',
    elements: ['Findings', 'Recommendations', 'Follow-up actions']
  },
  {
    section: 'Appendices',
    elements: ['Certifications', 'Calibrations', 'Raw data', 'Procedures']
  }
];
```

---

## Common NDT Workflows

### TOFD Inspection Workflow

```javascript
// 1. Setup
const setup = {
  pcs: 100,          // Based on thickness and coverage requirements
  angle: 60,         // Typical for many applications
  thickness: 25,     // Material thickness
  frequency: 5       // MHz, based on grain structure
};

// 2. Calculate dead zones
const deadZones = calculateDeadZones(setup);

// 3. Verify coverage
if (deadZones.upper + deadZones.lower >= setup.thickness) {
  // Adjust parameters
  setup.pcs = optimizePCS(setup.thickness, setup.angle);
}

// 4. Perform scan
// 5. Analyze A-scans for indications
// 6. Measure and characterize indications
// 7. Generate report
```

### C-Scan Inspection Workflow

```javascript
// 1. Define scan area
const scanArea = {
  startX: 0,
  startY: 0,
  width: 200,   // mm
  height: 300,  // mm
  resolution: 0.5  // mm per point
};

// 2. Set up data acquisition
const acquisition = {
  frequency: 5,
  gate: { start: 0, end: 50 },  // mm
  threshold: 40  // % FSH
};

// 3. Perform raster scan
// 4. Generate C-scan image
// 5. Identify indications above threshold
// 6. Measure indication sizes
// 7. Correlate with acceptance criteria
```

---

## Resources

Detailed guides for specific topics:
- TOFD calculations → `.claude/docs/resources/tofd-detailed-guide.md`
- C-Scan visualization → `.claude/docs/resources/cscan-rendering-guide.md`
- Compliance checklists → `.claude/docs/resources/compliance-checklists.md`
- Industry standards → `.claude/docs/resources/ndt-standards.md`

## Common Issues & Solutions

### Issue: Dead Zones Too Large
**Solution**: Reduce PCS or adjust angle. Use dual-technique approach (add pulse-echo for dead zones).

### Issue: Insufficient Coverage
**Solution**: Increase overlap between scan passes. Reduce index offset.

### Issue: Signal Noise
**Solution**: Adjust frequency (lower for coarse grain, higher for fine grain). Check coupling.

### Issue: Calibration Drift
**Solution**: Re-calibrate equipment. Check environmental conditions (temperature).

---

## Skill Maintenance

**Update When**:
- New NDT methods added to suite
- Standards updated (ASNT, ASME, ISO)
- Calculation formulas refined
- Industry best practices evolve

**Domain Expert Contact**: Consult with certified Level III personnel for complex interpretations

**Last Review**: 2025-11-11
**Next Review**: Quarterly or when standards update
