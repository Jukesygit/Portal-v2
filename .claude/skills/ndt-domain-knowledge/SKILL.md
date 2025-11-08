# NDT Domain Knowledge

**Purpose**: Non-Destructive Testing methods, standards, and industry knowledge
**Type**: Domain Expertise
**Priority**: Critical
**Auto-Activate**: When working on inspection features, calculations, compliance

---

## Overview

Non-Destructive Testing (NDT) encompasses various methods to inspect materials, components, and structures without causing damage. This skill provides essential NDT domain knowledge for building inspection management software.

---

## NDT Inspection Methods

### 1. RT - Radiographic Testing

**Purpose**: Detect internal flaws using X-rays or gamma rays
**Applications**: Welds, castings, composites
**Standards**: ASME Section V Article 2, ASTM E94, E142, E1742

#### Key Parameters
- Source type (X-ray, gamma)
- Film type and classification
- Exposure time and distance
- Film density and contrast
- IQI (Image Quality Indicator) placement

#### Acceptance Criteria
- Crack indications: Rejectable
- Porosity: Based on size and distribution
- Slag inclusions: Based on size limits
- Incomplete fusion/penetration: Rejectable

```typescript
interface RTInspection {
  method: 'RT';
  source: 'x-ray' | 'gamma' | 'iridium-192' | 'cobalt-60';
  filmType: string;
  exposureTime: number; // seconds
  sourceDistance: number; // inches or mm
  filmDensity: number; // 1.8-4.0 typical range
  iqi: {
    type: string;
    placement: 'source' | 'film';
    visible: boolean;
  };
  defects: RTDefect[];
}

interface RTDefect {
  type: 'porosity' | 'crack' | 'slag' | 'incomplete-fusion' | 'incomplete-penetration';
  location: string;
  size: number; // mm or inches
  severity: 'acceptable' | 'repair' | 'reject';
}
```

---

### 2. UT - Ultrasonic Testing

**Purpose**: Detect internal discontinuities using high-frequency sound waves
**Applications**: Welds, thickness measurement, material characterization
**Standards**: ASME Section V Article 4, ASTM E164, E114, E2700

#### Key Parameters
- Frequency: 0.5-25 MHz (typical: 2-5 MHz for welds)
- Probe type: Straight beam, angle beam
- Angle: 45°, 60°, 70° (for shear waves)
- Couplant: Water, gel, oil
- Scan pattern: Raster, grid, perpendicular
- Sensitivity: Reference block calibration

#### Key Formulas

**Beam Path Calculation**:
```
Sound Path = (Thickness / cos(refracted angle)) × number of legs
```

**Skip Distance**:
```
Skip Distance = 2 × Thickness × tan(refracted angle)
```

```typescript
interface UTInspection {
  method: 'UT';
  frequency: number; // MHz
  probeType: 'straight' | 'angle';
  probeAngle?: number; // degrees (for angle beams)
  couplant: string;
  calibration: {
    blockType: string;
    referenceAmplitude: number; // %
    scanSensitivity: number; // dB above reference
  };
  measurements: UTMeasurement[];
}

interface UTMeasurement {
  location: string;
  thickness?: number; // mm or inches (for thickness gauging)
  indication: {
    amplitude: number; // % of full screen height
    depth: number; // mm or inches
    length: number; // mm or inches
    classification: 'acceptable' | 'repair' | 'reject';
  };
}
```

---

### 3. TOFD - Time-of-Flight Diffraction

**Purpose**: Highly accurate weld inspection technique for detecting and sizing flaws
**Applications**: Pressure vessel welds, pipeline welds, critical structures
**Standards**: ASME Section V Article 4 Appendix III, BS EN ISO 10863

#### Key Concepts
- Uses pairs of ultrasonic probes
- Detects diffracted signals from flaw tips
- Highly accurate depth and height sizing
- Less operator-dependent than conventional UT

#### Critical Calculations

**Coverage Calculation**:
```
Coverage = Probe Spacing - (Upper Dead Zone + Lower Dead Zone)
```

**Upper Dead Zone (near surface)**:
```
UDZ = (Probe Spacing × Velocity) / (2 × Frequency)
```

**Lower Dead Zone (back wall)**:
```
LDZ = Thickness - UDZ
```

**Probe Spacing Selection**:
- Typically 1.5-2.5× weld thickness
- Consider material velocity
- Account for weld geometry

```typescript
interface TOFDInspection {
  method: 'TOFD';
  probeSpacing: number; // mm
  frequency: number; // MHz (typical: 5-15 MHz)
  waveType: 'longitudinal';
  thickness: number; // mm
  material: Material;
  coverage: {
    upperDeadZone: number; // mm
    lowerDeadZone: number; // mm
    effectiveCoverage: number; // mm
  };
  indications: TOFDIndication[];
}

interface TOFDIndication {
  depthFromSurface: number; // mm
  throughWallHeight: number; // mm
  length: number; // mm
  classification: 'crack' | 'lack-of-fusion' | 'porosity';
  severity: 'acceptable' | 'repair' | 'reject';
}

// TOFD calculation functions
function calculateTOFDCoverage(params: {
  probeSpacing: number;
  frequency: number;
  velocity: number;
  thickness: number;
}): TOFDCoverage {
  const { probeSpacing, frequency, velocity, thickness } = params;

  // Upper dead zone
  const upperDeadZone = (probeSpacing * velocity) / (2 * frequency * 1000);

  // Lower dead zone (simplified)
  const lowerDeadZone = thickness - upperDeadZone;

  // Effective coverage
  const effectiveCoverage = Math.max(0, thickness - upperDeadZone - lowerDeadZone);

  return {
    upperDeadZone,
    lowerDeadZone,
    effectiveCoverage,
    coveragePercentage: (effectiveCoverage / thickness) * 100,
  };
}
```

---

### 4. MT - Magnetic Particle Testing

**Purpose**: Detect surface and near-surface discontinuities in ferromagnetic materials
**Applications**: Welds, castings, forgings
**Standards**: ASME Section V Article 7, ASTM E709, E1444

#### Key Parameters
- Magnetization method: Prod, yoke, coil
- Current type: AC, DC, rectified AC
- Particle type: Dry, wet, fluorescent
- Demagnetization required

```typescript
interface MTInspection {
  method: 'MT';
  magnetizationType: 'continuous' | 'residual';
  current: 'AC' | 'DC' | 'HWDC';
  particleType: 'dry' | 'wet' | 'fluorescent';
  amperage: number;
  indications: MTIndication[];
  demagnetized: boolean;
}
```

---

### 5. PT - Liquid Penetrant Testing

**Purpose**: Detect surface-breaking discontinuities
**Applications**: Non-magnetic materials, complex geometries
**Standards**: ASME Section V Article 6, ASTM E165, E1417

#### Process Steps
1. Pre-cleaning
2. Penetrant application (dwell time: 10-30 min)
3. Excess penetrant removal
4. Developer application
5. Inspection under appropriate lighting

```typescript
interface PTInspection {
  method: 'PT';
  penetrantType: 'visible' | 'fluorescent';
  sensitivity: 'Type I' | 'Type II' | 'Type III' | 'Type IV';
  dwellTime: number; // minutes
  developerDwellTime: number; // minutes
  indications: PTIndication[];
}
```

---

### 6. VT - Visual Testing

**Purpose**: Direct visual inspection for surface conditions
**Applications**: Welds, corrosion, damage assessment
**Standards**: ASME Section V Article 9, ASTM E165

#### Requirements
- Lighting: Minimum 1000 lux (100 ft-candles)
- Visual acuity: Jaeger #2 at 12 inches (annual test)
- Inspection distance: Typically 24 inches max
- Magnification: Allowed when specified

```typescript
interface VTInspection {
  method: 'VT';
  lighting: number; // lux
  distance: number; // inches or mm
  magnification?: number; // e.g., 5x
  findings: VTFinding[];
}
```

---

### 7. ET - Eddy Current Testing

**Purpose**: Detect surface and near-surface flaws in conductive materials
**Applications**: Tubing, aircraft structures, welds
**Standards**: ASME Section V Article 8, ASTM E309, E571

```typescript
interface ETInspection {
  method: 'ET';
  probeType: 'surface' | 'encircling' | 'bobbin';
  frequency: number; // kHz or MHz
  indications: ETIndication[];
}
```

---

## NDT Certification Standards

### ASNT SNT-TC-1A (American Society for Nondestructive Testing)

**Personnel Qualification**:
- **Level I**: Performs inspections, records results under supervision
- **Level II**: Sets up, calibrates, interprets results, trains Level I
- **Level III**: Establishes procedures, interprets codes, certifies personnel

**Requirements**:
- Training hours (method-specific)
- Experience hours (method-specific)
- Vision examination (annually)
- Written examination
- Practical examination

```typescript
interface Certification {
  standard: 'ASNT_SNT_TC_1A' | 'ISO_9712' | 'EN_473';
  method: NDTMethod;
  level: 'I' | 'II' | 'III';
  certificationNumber: string;
  issueDate: Date;
  expirationDate: Date;
  issuingBody: string;
  trainingHours: number;
  experienceHours: number;
  visionExamDate: Date;
  visionExamResult: 'pass' | 'fail';
}

type NDTMethod = 'RT' | 'UT' | 'MT' | 'PT' | 'VT' | 'ET' | 'TOFD';
```

### ISO 9712

International standard for NDT personnel qualification and certification.

**Key Differences from SNT-TC-1A**:
- Third-party certification required
- Standardized examination process
- Internationally recognized

### EN 473

European standard (now superseded by ISO 9712).

---

## Industry Codes & Standards

### ASME Boiler and Pressure Vessel Code

**Section V**: Nondestructive Examination
- Article 1: General Requirements
- Article 2: Radiographic Examination
- Article 4: Ultrasonic Examination Methods
- Article 6: Liquid Penetrant Examination
- Article 7: Magnetic Particle Examination
- Article 8: Eddy Current Examination
- Article 9: Visual Examination

### AWS (American Welding Society)

**D1.1**: Structural Welding Code - Steel
- Provides acceptance criteria for welds
- Specifies NDT requirements

**D1.5**: Bridge Welding Code

### API (American Petroleum Institute)

**API 510**: Pressure Vessel Inspection Code
**API 570**: Piping Inspection Code
**API 653**: Tank Inspection, Repair, Alteration, and Reconstruction

---

## Acceptance Criteria

### General Principles

1. **Rejectable Defects** (most codes):
   - Cracks (any length)
   - Incomplete fusion/penetration
   - Excessive porosity
   - Tungsten inclusions

2. **Acceptable Defects** (size/distribution limits):
   - Isolated porosity (below size limits)
   - Isolated slag (below size limits)
   - Undercut (within limits)

### Size and Distribution Rules

**Porosity Acceptance (example from AWS D1.1)**:
```typescript
function isPorositySumAcceptable(
  porosity: Defect[],
  weldThickness: number
): boolean {
  const maxPoreDiameter = weldThickness / 4; // 1/4t rule
  const sumOfDiameters = porosity.reduce((sum, p) => sum + p.size, 0);
  const inspectionLength = 6 * weldThickness; // 6t rule

  // Sum of pore diameters must not exceed 3/8 inch in any 6t length
  return sumOfDiameters <= 3 / 8;
}
```

---

## Material Properties (for UT/TOFD)

```typescript
interface Material {
  name: string;
  longitudinalVelocity: number; // m/s or in/µs
  shearVelocity: number; // m/s or in/µs
  density: number; // g/cm³
  attenuationCoefficient: number; // dB/cm at frequency
}

const commonMaterials: Record<string, Material> = {
  steel: {
    name: 'Carbon Steel',
    longitudinalVelocity: 5900, // m/s
    shearVelocity: 3200, // m/s
    density: 7.85,
    attenuationCoefficient: 0.01, // at 5 MHz
  },
  stainlessSteel: {
    name: 'Stainless Steel (austenitic)',
    longitudinalVelocity: 5700,
    shearVelocity: 3100,
    density: 8.0,
    attenuationCoefficient: 0.15,
  },
  aluminum: {
    name: 'Aluminum',
    longitudinalVelocity: 6300,
    shearVelocity: 3100,
    density: 2.7,
    attenuationCoefficient: 0.005,
  },
};
```

---

## Inspection Documentation Requirements

### Minimum Required Information

1. **Procedure Identification**
   - Procedure number and revision
   - Applicable code/standard

2. **Equipment**
   - Manufacturer and model
   - Serial numbers
   - Calibration status

3. **Personnel**
   - Inspector name and certification
   - Level and method

4. **Inspection Details**
   - Date and time
   - Location/component identification
   - Surface condition
   - Material and thickness

5. **Results**
   - Accept/reject status
   - Defect locations and characterization
   - Disposition (accept, repair, reject)

```typescript
interface InspectionReport {
  reportNumber: string;
  procedure: {
    number: string;
    revision: string;
    standard: string;
  };
  inspector: {
    name: string;
    certificationNumber: string;
    level: 'I' | 'II' | 'III';
    method: NDTMethod;
  };
  inspection: {
    date: Date;
    location: string;
    componentId: string;
    material: string;
    thickness: number;
    surfaceCondition: string;
  };
  results: {
    status: 'accept' | 'repair' | 'reject';
    defects: Defect[];
    notes: string;
  };
  reviewer?: {
    name: string;
    certificationNumber: string;
    level: 'II' | 'III';
    reviewDate: Date;
  };
}
```

---

## Common Industry Terminology

- **Indication**: A response from an NDT method
- **Discontinuity**: An interruption in the material structure
- **Defect**: A discontinuity that fails to meet acceptance criteria
- **Flaw**: Another term for defect
- **Sensitivity**: Ability to detect small discontinuities
- **Resolution**: Ability to distinguish between nearby indications
- **Acceptance Criteria**: Standards for determining accept/reject
- **DAC**: Distance Amplitude Correction (UT)
- **TCG**: Time Corrected Gain (UT)
- **IQI**: Image Quality Indicator (RT)
- **IIW**: International Institute of Welding

---

## Related Resources

- [Inspection Methods Deep Dive](./resources/inspection-methods.md)
- [Certification Requirements](./resources/certification-requirements.md)
- [Acceptance Criteria Guide](./resources/acceptance-criteria.md)
- [Calculation Formulas](./resources/calculation-formulas.md)
- [Material Properties Reference](./resources/material-properties.md)
- [Code Requirements Summary](./resources/code-requirements.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active
**Maintainer**: NDT Domain Expert + Claude Code
