# Working with Projects

## Creating New Projects

Use the project creation script to create independent project repositories:

```bash
node scripts/create-project-repo.js <project-name> <project-type>
```

**Important**: This creates independent repositories in `~/development/`, NOT nested projects in the workspace.

## Available Project Types

### Web Template (`web`)
**Stack**: React + TypeScript + Vite + Security configs

**Features**:
- React 18 with TypeScript
- Vite for build tooling
- ESLint + TypeScript + Security rules
- Vitest for testing with TDD setup
- Security-first configurations (CSP, HTTPS, etc.)
- Debt tracking and documentation templates

**Use Cases**: Single-page applications, progressive web apps, dashboards

---

### API Template (`api`)
**Stack**: Node.js + TypeScript + Express + Security middleware

**Features**:
- Node.js with TypeScript
- Express.js framework
- Security middleware (Helmet, CORS, rate limiting)
- Jest for testing with comprehensive coverage
- Input validation and authentication patterns
- Monitoring and logging for security events

**Use Cases**: REST APIs, microservices, backend services

---

### Python Template (`python`)
**Stack**: FastAPI + Async + Security + Testing + Docker

**Features**:
- FastAPI framework with async support
- Pydantic for data validation and serialization
- SQLAlchemy ORM with Alembic migrations
- pytest testing framework with comprehensive coverage
- Security middleware and authentication patterns
- Docker containerization and deployment configs

**Use Cases**: Python APIs, data processing services, ML backends

---

### Java Template (`java`)
**Stack**: Spring Boot + Security + Monitoring + Docker

**Features**:
- Spring Boot framework with Security
- JPA/Hibernate for database integration
- JWT authentication and authorization
- JUnit testing with comprehensive test coverage
- Docker containerization and monitoring
- Production-ready configuration management

**Use Cases**: Enterprise applications, microservices, Java backends

---

### Go Template (`go`)
**Stack**: Gin + High Performance + Security + Docker

**Features**:
- Gin framework for high-performance APIs
- GORM for database operations and migrations
- JWT authentication and middleware
- Go testing framework with benchmarks
- Docker containerization and deployment
- Security-first design with rate limiting

**Use Cases**: High-performance APIs, concurrent systems, cloud-native apps

---

### Mobile Template (`mobile`)
**Stack**: React Native (template ready)

**Status**: Template configured, ready for project creation

**Use Cases**: Cross-platform mobile applications

---

### Desktop Template (`desktop`)
**Stack**: Electron (template ready)

**Status**: Template configured, ready for project creation

**Use Cases**: Cross-platform desktop applications

---

## Multi-Agent Development Teams

### Custom Claude Code Agents
**Location**: `.claude/agents/`

**Foundation Team (Planning & Architecture)**:
- **project-manager**: Workflow coordination, team management
- **spec-analyst**: Requirements analysis, user story creation
- **spec-architect**: System design, technology selection
- **spec-planner**: Task decomposition, effort estimation

**Implementation Team (Development)**:
- **frontend-developer**: UI/UX implementation, React/TypeScript
- **backend-developer**: Server-side logic, API development
- **spec-developer**: Full-stack integration, system coordination

**Quality & Security Team (Validation)**:
- **spec-tester**: Testing strategies, quality validation
- **quality-assurance-specialist**: Code review, requirements auditing, deployment readiness (enhanced with Req-ing Ball methodology)
- **security-specialist**: Security analysis, threat modeling

### BMAD Strategic Agents
**Location**: `.claude/commands/BMad/`

**Planning Agents**:
- **/analyst**: Market research, competitive analysis
- **/pm**: Product management, requirements coordination
- **/architect**: Technical architecture, integration planning
- **/po**: Product ownership, backlog management

**Development Agents**:
- **/dev**: Implementation coordination
- **/ux-expert**: User experience design and validation
- **/qa**: Quality assurance validation
- **/sm**: Scrum master, agile facilitation

**Orchestration Agents**:
- **/bmad-orchestrator**: Multi-agent workflow coordination
- **/bmad-master**: High-level strategic oversight

### Agent Selection Guide

**Use Custom Agents for**:
- Code-level implementation work
- Testing and quality validation
- Security analysis and threat modeling
- Debugging and troubleshooting

**Use BMAD Agents for**:
- Strategic planning and business analysis
- Cross-project coordination
- Product management decisions
- Agile workflow management

### Recommended Workflow Sequence

1. **Strategic Planning**: /analyst → /pm → /po (BMAD agents)
2. **Technical Foundation**: spec-analyst → spec-architect → spec-planner (Custom agents)
3. **Implementation**: backend-developer + frontend-developer + /ux-expert (Hybrid)
4. **Quality Assurance**: spec-tester → quality-assurance-specialist → security-specialist (Custom agents)
5. **Deployment**: /qa → /bmad-orchestrator (BMAD agents)

---

## Planning Methodology Selection

### When to use BMAD Agents (Default)

**Ideal for**:
- Rapid prototyping and iterative development
- Projects with evolving requirements
- Agile sprints and continuous delivery
- Internal tools and MVPs
- When speed and flexibility are priorities

**Benefits**:
- Faster iteration cycles
- Flexible requirement changes
- Agile-friendly workflow
- Lower upfront planning overhead

---

### When to use Spec-Kit

**Ideal for**:
- Client projects requiring formal documentation
- Regulatory/compliance-driven development
- Fixed-bid contracts with detailed specifications
- Projects with multiple stakeholder approvals
- When comprehensive upfront design is required

**Benefits**:
- Formal specification documents
- Comprehensive upfront planning
- Stakeholder approval tracking
- Compliance documentation

**Decision Criteria**:
```
IF project requires:
  - Formal specification documents → Use Spec-Kit
  - Multiple approval cycles → Use Spec-Kit
  - Regulatory compliance docs → Use Spec-Kit
  - Fixed requirements upfront → Use Spec-Kit
ELSE:
  - Use BMAD agents (faster, more flexible)
```

### Spec-Kit Workflow

See [spec-kit-planning.md](spec-kit-planning.md) for complete documentation.

**Core workflow commands** (use in sequence):
```bash
/speckit.constitution  # Define project principles and governance
/speckit.specify       # Create baseline feature specification
/speckit.plan          # Generate technical implementation plan
/speckit.tasks         # Break down into actionable tasks
/speckit.implement     # Execute specification-compliant implementation
```

**Optional enhancement commands**:
```bash
/speckit.clarify       # Ask structured questions (use before /speckit.plan)
/speckit.analyze       # Cross-artifact consistency report (use after /speckit.tasks)
/speckit.checklist     # Generate quality checklists (use after /speckit.plan)
```

---

## Project Creation Examples

### Example 1: React Web Application
```bash
node scripts/create-project-repo.js my-dashboard web
cd ~/development/my-dashboard
npm install
npm run dev
```

### Example 2: FastAPI Python Service
```bash
node scripts/create-project-repo.js user-service python
cd ~/development/user-service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Example 3: Spring Boot Java API
```bash
node scripts/create-project-repo.js payment-api java
cd ~/development/payment-api
./mvnw spring-boot:run
```

### Example 4: Go High-Performance API
```bash
node scripts/create-project-repo.js analytics-api go
cd ~/development/analytics-api
go mod download
go run main.go
```
