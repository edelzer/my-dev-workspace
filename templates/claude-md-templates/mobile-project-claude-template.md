# CLAUDE.md Template (Mobile Project)

This file provides guidance to Claude Code (claude.ai/code) when working with this React Native mobile application, incorporating BMAD multi-agent workflows and mobile-first development practices.

## Mobile Project Overview

**Project Type**: React Native Mobile Application
**Framework**: React Native + TypeScript + Expo / React Native CLI
**State Management**: [Redux Toolkit|Zustand|Context API|Recoil]
**Navigation**: React Navigation v6
**Testing**: Jest + React Native Testing Library + Detox (E2E)

## Mobile-First Development Philosophy

### Mobile Security-First
- Secure storage implementation for sensitive data (Keychain/Keystore)
- Certificate pinning for API communications
- Biometric authentication integration
- App transport security compliance
- Code obfuscation and anti-tampering measures
- Secure deep linking implementation

### Cross-Platform Performance
- Platform-specific optimizations (iOS/Android)
- Memory management and performance profiling
- Battery usage optimization
- Network efficiency and offline capabilities
- Native module integration when necessary
- App size optimization and bundle splitting

### User Experience Excellence
- Platform design guideline adherence (iOS Human Interface Guidelines, Material Design)
- Accessibility compliance and screen reader support
- Responsive design for various screen sizes
- Touch interaction optimization and gesture handling
- Loading states and error boundary implementation

## BMAD Multi-Agent Mobile Workflow

### Planning Phase Agents
- `/analyst` - Mobile market research, platform-specific feature analysis, user behavior patterns
- `/pm` - Mobile user stories, platform feature parity decisions, app store requirements
- `/architect` - Mobile architecture patterns, offline synchronization, native bridge design
- `/ux-expert` - Mobile UI/UX design, platform-specific interaction patterns, accessibility guidelines

### Development Phase Agents
- `/dev` - React Native implementation, native module integration, performance optimization
- `/ux-expert` - Platform-specific styling, animation implementation, user feedback systems
- `/sm` - Mobile development sprint coordination, device testing coordination, app store submission tracking

### Quality Assurance Agents
- `/qa` - Device testing, platform compatibility, performance testing, security validation, app store compliance

## Mobile-Specific Build Commands

```bash
# Development
npm run start            # Metro bundler start
npm run ios              # iOS simulator launch
npm run android          # Android emulator launch
npm run dev:network      # Network debugging with Flipper
npm run test:tdd         # Jest TDD mode with watch
npm run lint:fix         # ESLint with auto-fix for mobile patterns

# Platform-Specific Development
npm run ios:device       # Deploy to physical iOS device
npm run android:device   # Deploy to physical Android device
npm run ios:release      # iOS release build testing
npm run android:release  # Android release build testing

# Quality Assurance
npm run build:ios        # iOS production build
npm run build:android    # Android production build (.apk/.aab)
npm run test:e2e:ios     # Detox end-to-end iOS testing
npm run test:e2e:android # Detox end-to-end Android testing
npm run test:performance # Performance profiling and analysis
npm run security:scan    # Mobile-specific security scanning

# App Store Preparation
npm run build:ios:store   # iOS App Store build preparation
npm run build:android:store # Google Play Store build preparation
npm run icons:generate    # App icon generation for all sizes
npm run screenshots:generate # Automated screenshot generation
```

## Mobile Component Development Standards

### Component Structure
```typescript
// components/MobileComponent/index.tsx
interface MobileComponentProps {
  // [BMAD /ux-expert]: Mobile-specific prop interfaces with platform considerations
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

const MobileComponent: React.FC<MobileComponentProps> = ({}) => {
  // [BMAD /dev]: Mobile-specific hooks and state management
  // [BMAD /ux-expert]: Platform-specific styling and interactions
  
  return (
    <View style={styles.container} testID="mobile-component">
      {/* Mobile-optimized JSX implementation */}
    </View>
  );
};

// Platform-specific styling
const styles = StyleSheet.create({
  container: {
    // [BMAD /ux-expert]: Platform-specific styles with responsive design
    ...Platform.select({
      ios: { /* iOS-specific styles */ },
      android: { /* Android-specific styles */ },
    }),
  },
});

export default MobileComponent;
```

### Mobile State Management Patterns
- **Local State**: useState and useReducer for component state with memory optimization
- **Global State**: Redux Toolkit/Zustand for app-wide state with persistence
- **Async State**: React Query/SWR for API data with offline synchronization
- **Secure Storage**: React Native Keychain for sensitive data storage
- **Navigation State**: React Navigation state management and deep linking

## Mobile Security Implementation

### Data Security
- [ ] Sensitive data stored in Keychain (iOS) / Keystore (Android)
- [ ] Certificate pinning implemented for API communications
- [ ] Network security configuration for Android
- [ ] App Transport Security compliance for iOS
- [ ] Root/jailbreak detection implementation
- [ ] Anti-tampering and code obfuscation measures

### Authentication Security
- [ ] Biometric authentication integration (Face ID, Touch ID, Fingerprint)
- [ ] Secure token storage with automatic refresh
- [ ] Session management with automatic logout
- [ ] Multi-factor authentication support
- [ ] OAuth 2.0 / OpenID Connect implementation

### Runtime Security
- [ ] Screen recording and screenshot protection for sensitive screens
- [ ] Background app snapshot protection
- [ ] Debug mode detection and prevention in production
- [ ] SSL/TLS validation with certificate verification
- [ ] Secure deep link validation and sanitization

## Platform-Specific Considerations

### iOS Development
- **Human Interface Guidelines**: Navigation patterns, visual design, interaction paradigms
- **iOS-Specific Features**: 3D Touch, Spotlight Search, Siri Shortcuts, Widgets
- **App Store Guidelines**: Review guidelines compliance, metadata requirements
- **Performance**: Memory management, Core Animation optimization, background processing

### Android Development
- **Material Design Guidelines**: Component library usage, theming, responsive design
- **Android-Specific Features**: Adaptive icons, shortcuts, Android Auto, wear OS compatibility
- **Google Play Guidelines**: Policy compliance, target SDK requirements, permissions usage
- **Performance**: Proguard optimization, APK size reduction, battery optimization

## Mobile Testing Strategy

### Testing Pyramid for Mobile
- **Unit Tests**: Component logic, utility functions, custom hooks, business logic
- **Integration Tests**: Navigation flows, state management, API integrations, offline scenarios
- **UI Tests**: Component rendering, user interactions, accessibility compliance
- **End-to-End Tests**: Critical user journeys across platforms, app store scenarios

### Device Testing Strategy
- **Simulator/Emulator Testing**: Rapid development and automated testing
- **Physical Device Testing**: Real-world performance, hardware feature testing
- **Device Farm Testing**: Cross-device compatibility validation
- **Beta Testing**: TestFlight (iOS) and Play Console (Android) beta distribution

### Performance Testing
- **Launch Time**: App startup performance optimization
- **Memory Usage**: Memory leak detection and optimization
- **Battery Usage**: Background processing and battery drain analysis
- **Network Performance**: API response handling and offline capability testing

## Accessibility Standards

### Mobile Accessibility Compliance
- [ ] Screen reader support (VoiceOver, TalkBack)
- [ ] Dynamic type support for text scaling
- [ ] High contrast mode support
- [ ] Reduced motion respect for animations
- [ ] Keyboard navigation for external keyboards
- [ ] Focus management for screen readers
- [ ] Semantic labeling for all interactive elements

### Inclusive Design Principles
- [ ] Color contrast ratios meet WCAG standards
- [ ] Touch targets meet minimum size requirements (44pt iOS, 48dp Android)
- [ ] Alternative input methods support
- [ ] Internationalization and localization support

## Quality Gates Validation

### Pre-Release Checklist
- [ ] Platform-specific testing completed on real devices
- [ ] Performance benchmarks met (startup time, memory usage, battery impact)
- [ ] Security scanning completed with no critical vulnerabilities
- [ ] App store compliance validation completed
- [ ] Accessibility testing completed with assistive technologies
- [ ] Offline functionality tested and validated

### BMAD Agent Handoff Validation
- [ ] `/analyst` + `/pm`: Mobile requirements specified with platform considerations
- [ ] `/architect`: Mobile architecture documented with offline sync patterns
- [ ] `/dev` + `/ux-expert`: Platform-specific implementation matching design specifications
- [ ] `/qa`: Cross-device testing, performance validation, security testing completed
- [ ] `/bmad-orchestrator`: App store submission readiness validated

## App Store Deployment

### iOS App Store Process
1. **Development**: Code signing and provisioning profiles configuration
2. **Testing**: TestFlight beta testing with internal and external testers
3. **Submission**: App Store Connect metadata, screenshots, and binary submission
4. **Review**: Apple review process compliance and response procedures

### Google Play Store Process
1. **Development**: Keystore management and signed APK/AAB generation
2. **Testing**: Play Console internal testing and closed/open testing tracks
3. **Submission**: Play Console store listing, content rating, and binary upload
4. **Release**: Staged rollout strategy with monitoring and rollback procedures

## Monitoring and Analytics

### Mobile-Specific Monitoring
- **Crash Reporting**: Crashlytics, Sentry, or Bugsnag integration
- **Performance Monitoring**: App startup time, screen load times, memory usage
- **User Analytics**: User behavior patterns, feature adoption, retention metrics
- **Business Metrics**: Conversion tracking, revenue attribution, user engagement

### Remote Configuration
- **Feature Flags**: A/B testing and gradual feature rollout
- **Remote Config**: Dynamic configuration without app store updates
- **Push Notifications**: Targeted messaging and user engagement campaigns

## Emergency Procedures

### Critical Bug Response
1. **Detection**: Automated crash reporting and user feedback monitoring
2. **Assessment**: `/qa` impact analysis and device-specific testing
3. **Hotfix**: `/dev` emergency patch development with expedited testing
4. **Deployment**: Emergency app store update with expedited review request

### Security Incident Response
1. **Containment**: API endpoint protection and user communication
2. **Investigation**: Mobile-specific vulnerability analysis and impact assessment
3. **Remediation**: Security patch deployment and user update enforcement

### Performance Degradation
1. **Monitoring**: Real-time performance metrics and user feedback analysis
2. **Analysis**: `/architect` performance bottleneck identification
3. **Optimization**: `/dev` performance improvements and memory leak fixes

## Platform Integration Features

### iOS Integration
- [ ] Siri Shortcuts and voice command integration
- [ ] Spotlight Search indexing for app content
- [ ] 3D Touch / Haptic Touch quick actions
- [ ] iOS Widgets and Today View extensions
- [ ] Apple Pay integration for commerce apps
- [ ] HealthKit, MapKit, or other iOS framework integration

### Android Integration
- [ ] Android Shortcuts and launcher integration
- [ ] Google Assistant actions and voice commands
- [ ] Adaptive icons and themed icons
- [ ] Android Widgets and home screen integration
- [ ] Google Pay integration for commerce apps
- [ ] Android Auto or Wear OS companion features

## Project-Specific Context

### Current Focus
- [CUSTOMIZE: Current mobile development priorities and feature implementation]

### Platform Priority
- [CUSTOMIZE: iOS-first, Android-first, or simultaneous development strategy]

### Performance Requirements
- [CUSTOMIZE: App startup time targets, memory usage limits, battery impact goals]

### Integration Requirements
- [CUSTOMIZE: Third-party SDK integrations, native module requirements, backend API specifications]

**Mobile Development Integration Command**: When implementing mobile features, coordinate `/ux-expert` and `/dev` agents for platform-specific optimization, validate through `/qa` cross-device testing, and ensure both iOS and Android platform guidelines compliance throughout development.