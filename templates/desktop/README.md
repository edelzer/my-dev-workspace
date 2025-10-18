# Electron Desktop App Template

Production-ready Electron template for cross-platform desktop applications.

## Features
- Electron 25+
- TypeScript configuration
- Cross-platform (Windows, macOS, Linux)
- ESLint + Prettier
- Auto-updater ready

## Quick Start

```bash
# Create new desktop project
node scripts/create-project-repo.js my-desktop-app desktop
cd ~/development/my-desktop-app
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

## Development
- `npm run dev` - Start in development mode
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## Build Targets
- Windows (exe, portable)
- macOS (dmg, app)
- Linux (AppImage, deb)

## Requirements
- Node.js 18+
- Platform-specific build tools

## Documentation
See workspace README.md for full template documentation.
