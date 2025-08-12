# CLAUDE.md Template (Desktop Project)

This file provides guidance to Claude Code (claude.ai/code) when working with this Electron desktop application, incorporating BMAD multi-agent workflows and cross-platform desktop development practices.

## Desktop Project Overview

**Project Type**: Electron Desktop Application
**Framework**: Electron + React/Vue/Angular + TypeScript
**Architecture**: Main Process + Renderer Process(es)
**Build System**: [Electron Builder|Electron Forge|Custom]
**Testing**: Jest + Spectron/Playwright Electron + Native Testing

## Desktop-First Development Philosophy

### Desktop Security-First
- Main process isolation and secure IPC communication
- Context isolation and preload script security
- Content Security Policy for renderer processes
- Secure file system access with permission validation
- Auto-updater security with code signing verification
- Native OS integration security (keychain, credential management)

### Cross-Platform Native Experience
- Platform-specific UI/UX patterns (Windows, macOS, Linux)
- Native system integration (file associations, protocol handlers, system tray)
- Performance optimization for desktop workflows
- Offline-first capabilities with local data storage
- Multi-window management and state synchronization

### Enterprise-Ready Architecture
- Installer and auto-updater implementation
- Configuration management and enterprise deployment
- System resource management and performance monitoring
- Accessibility compliance for desktop environments
- Native hardware integration (cameras, microphones, printers)

## BMAD Multi-Agent Desktop Workflow

### Planning Phase Agents
- `/analyst` - Desktop software market analysis, competitor feature comparison, platform-specific requirements
- `/pm` - Desktop user stories, platform feature requirements, enterprise deployment planning
- `/architect` - Electron architecture design, IPC communication patterns, native integration architecture
- `/ux-expert` - Desktop UI patterns, platform-specific design guidelines, accessibility requirements

### Development Phase Agents
- `/dev` - Electron main/renderer implementation, native module integration, IPC communication
- `/ux-expert` - Platform-specific UI implementation, native styling, window management UX
- `/sm` - Desktop development coordination, platform testing coordination, release management

### Quality Assurance Agents
- `/qa` - Cross-platform testing, native integration testing, performance validation, security auditing

## Desktop-Specific Build Commands

```bash
# Development
npm run dev              # Electron development with hot reload
npm run dev:main         # Main process development with debugging
npm run dev:renderer     # Renderer process development
npm run dev:debug        # Electron with DevTools and debugging enabled
npm run test:tdd         # Jest TDD mode for desktop components

# Platform-Specific Development
npm run dev:windows      # Windows-specific development environment
npm run dev:macos        # macOS-specific development environment
npm run dev:linux        # Linux-specific development environment

# Building and Packaging
npm run build           # Production build for all platforms
npm run build:windows   # Windows executable (.exe, .msi)
npm run build:macos     # macOS application (.dmg, .pkg, Mac App Store)
npm run build:linux     # Linux packages (.deb, .rpm, .AppImage, .snap)
npm run build:portable  # Portable executables for all platforms

# Testing
npm run test:e2e        # End-to-end testing with Spectron/Playwright
npm run test:integration # Native integration testing
npm run test:performance # Desktop performance and memory testing
npm run security:scan   # Desktop security scanning and vulnerability assessment

# Distribution
npm run release         # Automated release with code signing
npm run publish         # Publish to distribution channels
npm run notarize:macos  # macOS notarization for Gatekeeper compliance
```

## Desktop Application Architecture

### Main Process Implementation
```typescript
// main/main.ts
import { app, BrowserWindow, ipcMain, Menu } from 'electron';

class DesktopApplication {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    // [BMAD /architect]: Secure main process initialization
    this.initializeApp();
    this.setupIpcHandlers();
    this.createMainWindow();
  }

  private initializeApp(): void {
    // [BMAD /dev]: App lifecycle management with security considerations
    app.whenReady().then(() => this.createMainWindow());
    app.on('window-all-closed', () => this.handleWindowsClosed());
    app.on('activate', () => this.handleActivate());
  }

  private createMainWindow(): void {
    // [BMAD /ux-expert]: Platform-specific window configuration
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,    // Security: Disable node in renderer
        contextIsolation: true,    // Security: Context isolation enabled
        enableRemoteModule: false, // Security: Disable remote module
        preload: path.join(__dirname, 'preload.js'), // Secure preload script
      },
    });
  }
}

// [BMAD /qa]: Comprehensive main process testing
describe('Desktop Application Main Process', () => {
  // Test main process functionality, IPC, and security
});
```

### Renderer Process Implementation
```typescript
// renderer/App.tsx
import React from 'react';
import { useElectronAPI } from './hooks/useElectronAPI';

const App: React.FC = () => {
  // [BMAD /dev]: Secure IPC communication with main process
  const electronAPI = useElectronAPI();

  // [BMAD /ux-expert]: Platform-specific UI implementation
  return (
    <div className="desktop-app">
      {/* Desktop-optimized React components */}
    </div>
  );
};

export default App;
```

### Secure IPC Communication
```typescript
// preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// [BMAD /architect]: Secure API exposure to renderer process
const electronAPI = {
  // File system operations with security validation
  readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('fs:write-file', filePath, data),
  
  // System integration with permission checks
  showNotification: (message: string) => ipcRenderer.invoke('system:show-notification', message),
  openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

## Platform-Specific Implementation

### Windows Desktop Integration
- **Native Windows Features**: Windows 10/11 notifications, taskbar integration, Windows Hello authentication
- **Windows Store Distribution**: MSIX packaging, Windows Store submission requirements
- **Windows-Specific UI**: Fluent Design integration, Windows theming support
- **Enterprise Features**: Active Directory integration, Group Policy support, Windows Updates compatibility

### macOS Desktop Integration
- **Native macOS Features**: Touch Bar support, macOS notifications, Keychain integration, Spotlight indexing
- **Mac App Store Distribution**: Mac App Store guidelines, sandboxing requirements, entitlements configuration
- **macOS-Specific UI**: Native macOS styling, menu bar integration, dock customization
- **Apple Platform Features**: Handoff support, Universal Clipboard, iCloud integration possibilities

### Linux Desktop Integration
- **Linux Distribution Support**: .deb (Debian/Ubuntu), .rpm (Red Hat/SUSE), .AppImage (universal), Snap packages
- **Desktop Environment Integration**: GNOME, KDE, XFCE compatibility, system theme integration
- **Linux-Specific Features**: Desktop file associations, system tray support, package manager integration
- **Enterprise Linux**: Red Hat Enterprise, SUSE Enterprise compatibility, system administration tools

## Desktop Security Implementation

### Application Security
- [ ] Code signing for all platforms (Windows Authenticode, macOS Developer ID, Linux GPG)
- [ ] Context isolation enabled with secure preload scripts
- [ ] Content Security Policy implemented for all renderer processes
- [ ] Node.js integration disabled in renderer processes
- [ ] Secure auto-updater with signature verification
- [ ] File system access validation and sandboxing

### Data Protection
- [ ] Secure local storage with platform-native encryption
- [ ] Keychain/Credential Manager integration for sensitive data
- [ ] Database encryption for local data storage
- [ ] Secure inter-process communication validation
- [ ] Memory protection and secure memory clearing
- [ ] Audit logging for security-sensitive operations

### Network Security
- [ ] Certificate pinning for remote API communications
- [ ] Secure WebSocket connections with proper validation
- [ ] Proxy support with enterprise network compatibility
- [ ] Network request validation and sanitization
- [ ] Offline capability with secure local data caching

## Desktop Testing Strategy

### Testing Architecture
- **Unit Tests**: Main process logic, renderer components, utility functions, IPC handlers
- **Integration Tests**: Main-renderer communication, native module integration, file system operations
- **End-to-End Tests**: Complete user workflows, multi-window scenarios, platform-specific features
- **Platform Tests**: Cross-platform compatibility, native integration validation

### Automated Testing Tools
- **Spectron/Playwright Electron**: Automated UI testing across platforms
- **Jest**: Unit testing for both main and renderer processes
- **Native Testing**: Platform-specific testing tools integration
- **Performance Testing**: Memory usage, startup time, resource consumption analysis

### Manual Testing Strategy
- **Platform-Specific Testing**: Windows, macOS, and Linux native behavior validation
- **Hardware Integration Testing**: Camera, microphone, printer, external device integration
- **Accessibility Testing**: Screen readers, keyboard navigation, high contrast mode support
- **Enterprise Environment Testing**: Corporate network, proxy, security policy compliance

## Performance Optimization

### Desktop Performance Targets
- **Application Startup**: Target < 3 seconds for first window display
- **Memory Usage**: Efficient memory management with garbage collection optimization
- **CPU Usage**: Background process efficiency and resource-conscious operation
- **Disk Usage**: Minimal disk footprint with efficient local storage

### Optimization Strategies
- **Bundle Optimization**: Tree shaking, code splitting, lazy loading for renderer processes
- **Native Module Optimization**: Efficient native code integration and memory management
- **Multi-Process Architecture**: Worker processes for CPU-intensive operations
- **Caching Strategies**: Intelligent local caching with cache invalidation

## Quality Gates Validation

### Pre-Release Checklist
- [ ] Cross-platform testing completed on all target operating systems
- [ ] Code signing certificates configured and functional
- [ ] Auto-updater tested with staged rollout capability
- [ ] Native integrations tested (file associations, protocol handlers, system tray)
- [ ] Security scanning completed with vulnerability remediation
- [ ] Performance benchmarks met across all platforms
- [ ] Accessibility compliance validated with assistive technologies

### BMAD Agent Handoff Validation
- [ ] `/analyst` + `/pm`: Desktop requirements specified with platform-specific considerations
- [ ] `/architect`: Electron architecture documented with security and performance considerations
- [ ] `/dev` + `/ux-expert`: Platform-specific implementation with native integration
- [ ] `/qa`: Cross-platform testing, security validation, performance optimization completed
- [ ] `/bmad-orchestrator`: Distribution readiness and deployment procedures validated

## Distribution and Deployment

### Automated Distribution
- **GitHub Releases**: Automated release creation with cross-platform binaries
- **Update Server**: Self-hosted or third-party update distribution
- **Package Repositories**: Linux package repository distribution
- **Enterprise Distribution**: MSI packages, Mac Enterprise distribution, Linux repository inclusion

### Code Signing and Notarization
- **Windows**: Authenticode signing with Extended Validation certificates
- **macOS**: Developer ID signing and Apple notarization for Gatekeeper compliance
- **Linux**: GPG signing for package integrity verification

## Monitoring and Analytics

### Desktop Application Monitoring
- **Crash Reporting**: Electron crash reporting with stack trace analysis
- **Performance Monitoring**: Application performance metrics and resource usage tracking
- **User Analytics**: Feature usage patterns, workflow analysis, user engagement metrics
- **Update Analytics**: Update adoption rates, rollback frequency, version distribution

### Error Handling and Recovery
- **Crash Recovery**: Automatic restart and state restoration capabilities
- **Data Recovery**: Automatic backup and recovery procedures for user data
- **Error Reporting**: User-friendly error reporting with diagnostic information collection

## Emergency Procedures

### Critical Issue Response
1. **Detection**: Automated crash reporting and user feedback analysis
2. **Assessment**: `/qa` cross-platform impact analysis and severity assessment
3. **Hotfix**: `/dev` emergency patch development with expedited testing
4. **Distribution**: Emergency update distribution with automatic rollout

### Security Incident Response
1. **Containment**: Application kill switches and remote configuration updates
2. **Investigation**: Desktop-specific vulnerability analysis and attack vector assessment
3. **Remediation**: Security patch development and mandatory update enforcement

### Performance Crisis Response
1. **Monitoring**: Real-time performance metrics and resource usage alerts
2. **Analysis**: `/architect` performance bottleneck identification and resource optimization
3. **Optimization**: `/dev` performance improvements and memory leak resolution

## Native Integration Features

### File System Integration
- [ ] File associations and default application registration
- [ ] Drag-and-drop support for external files
- [ ] Recent documents and quick access integration
- [ ] File system watching and change notification

### System Integration
- [ ] System tray/menu bar integration with context menus
- [ ] Global keyboard shortcuts and hotkey registration
- [ ] System startup and background service capabilities
- [ ] Protocol handler registration for deep linking

### Hardware Integration
- [ ] Camera and microphone access with permission management
- [ ] Printer integration and print dialog customization
- [ ] USB device detection and communication
- [ ] Bluetooth device integration and management

## Project-Specific Context

### Current Focus
- [CUSTOMIZE: Current desktop development priorities and feature implementation]

### Platform Priority
- [CUSTOMIZE: Windows-first, macOS-first, Linux support strategy]

### Enterprise Requirements
- [CUSTOMIZE: Corporate deployment requirements, security compliance, integration needs]

### Performance Requirements
- [CUSTOMIZE: Startup time targets, memory usage limits, resource consumption goals]

**Desktop Development Integration Command**: When implementing desktop features, coordinate `/architect` and `/dev` agents for secure cross-platform implementation, validate through `/qa` native integration testing, and ensure platform-specific guidelines compliance for Windows, macOS, and Linux throughout development.