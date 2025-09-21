@echo off
REM Simple script to copy Spec-Kit template to a new project

if "%1"=="" (
    echo Usage: use-spec-kit.cmd ^<project-name^>
    echo.
    echo This will create a new project with Spec-Kit commands in:
    echo   projects\^<project-name^>
    echo.
    echo After creation, use these commands in Claude Code:
    echo   /constitution - Define project principles
    echo   /specify - Create specifications
    echo   /plan - Technical planning
    echo   /tasks - Task breakdown
    echo   /implement - Execute implementation
    exit /b 1
)

set PROJECT_NAME=%1
set PROJECT_PATH=projects\%PROJECT_NAME%
set TEMPLATE_PATH=templates\spec-kit-template

if exist "%PROJECT_PATH%" (
    echo Error: Project "%PROJECT_NAME%" already exists
    exit /b 1
)

echo Creating spec-driven project: %PROJECT_NAME%

REM Copy template to project
xcopy "%TEMPLATE_PATH%" "%PROJECT_PATH%" /E /I /Q >nul

REM Create CLAUDE.md with integration notes
(
echo # %PROJECT_NAME%
echo.
echo This project uses GitHub Spec-Kit for specification-driven development.
echo.
echo ## Spec-Kit Commands
echo.
echo - `/constitution` - Define project principles and guidelines
echo - `/specify` - Create functional requirements and user stories
echo - `/plan` - Develop technical implementation plan
echo - `/tasks` - Generate task breakdown for implementation
echo - `/implement` - Execute the implementation
echo.
echo ## Workspace Integration
echo.
echo This project integrates with workspace protocols:
echo.
echo **Law #1 ^(Uncertainty^)**: Stop if specifications are unclear
echo **Law #2 ^(Protocol^)**: Follow specification phases before implementation
echo **Law #3 ^(Orchestration^)**: Use agents for validation and implementation
echo **Law #4 ^(Efficiency^)**: Keep specifications minimal but complete
echo **Law #5 ^(Leadership^)**: Report progress and get approval on specifications
echo.
echo ## Workflow
echo.
echo 1. Start with `/constitution` to establish project principles
echo 2. Use `/specify` to define requirements ^(iterate until complete^)
echo 3. Create `/plan` with technical approach and architecture
echo 4. Generate `/tasks` for systematic implementation
echo 5. Execute with `/implement` using workspace agents
) > "%PROJECT_PATH%\CLAUDE.md"

REM Initialize git if available
where git >nul 2>&1
if %ERRORLEVEL%==0 (
    pushd "%PROJECT_PATH%"
    git init >nul 2>&1
    git add . >nul 2>&1
    git commit -m "Initial commit: Spec-Kit project template" >nul 2>&1
    popd
    echo ✓ Git repository initialized
)

echo ✓ Project created at: %PROJECT_PATH%
echo.
echo Next steps:
echo   1. cd %PROJECT_PATH%
echo   2. Open in Claude Code
echo   3. Use /constitution to begin