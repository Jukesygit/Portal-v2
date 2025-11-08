# NDT Suite V2 - Web Application

Enterprise-grade React 19 web application for NDT project and quality management.

## Tech Stack

- **React 19** - Latest React with new features
- **TypeScript** - Strict type safety
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **MUI v7** - Material-UI component library
- **React Hook Form + Zod** - Form management with validation
- **Zustand** - Lightweight client state management

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# From repository root
npm install

# Or from this directory
npm install
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
src/
├── routes/              # File-based routing
│   ├── __root.tsx       # Root layout
│   └── index.tsx        # Home page
├── components/          # Reusable components
│   ├── ui/              # Generic UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── lib/                 # Configuration and utilities
│   ├── theme.ts         # MUI theme configuration
│   └── query-client.ts  # TanStack Query config
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── main.tsx             # Application entry point
```

## Key Features

### Routing
Uses TanStack Router for type-safe, file-based routing. Routes are automatically generated from files in `src/routes/`.

### State Management
- **Server State**: TanStack Query for API data
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form

### Styling
MUI v7 with custom theme configuration. Theme supports light/dark modes and is customized for NDT industry colors.

### Type Safety
Strict TypeScript configuration with:
- No implicit any
- Strict null checks
- Unused variable detection
- Full IDE autocomplete support

## Development Guidelines

See the project skills in `.claude/skills/`:
- `frontend-dev-guidelines` - React and TypeScript patterns
- `api-design` - API client best practices

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building

```bash
# Production build
npm run build

# The build output will be in dist/
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_NAME=NDT Suite V2
```

## License

UNLICENSED - Internal use only
