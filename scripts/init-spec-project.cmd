@echo off
REM Spec-Driven Project Initialization Script for Windows
REM Downloads and sets up GitHub Spec-Kit templates

if "%1"=="" (
    echo Error: Project name required
    echo Usage: init-spec-project.cmd ^<project-name^> [ai-assistant]
    echo Example: init-spec-project.cmd my-app claude
    exit /b 1
)

set PROJECT_NAME=%1
set AI=%2
if "%AI%"=="" set AI=claude

set PROJECT_PATH=projects\%PROJECT_NAME%

if exist "%PROJECT_PATH%" (
    echo Error: Project "%PROJECT_NAME%" already exists
    exit /b 1
)

echo Initializing spec-driven project: %PROJECT_NAME%
echo Using AI assistant: %AI%

REM Create project directory
mkdir "%PROJECT_PATH%" 2>nul

REM Download latest release info
echo Fetching latest Spec-Kit release...
curl -s -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/github/spec-kit/releases/latest > %TEMP%\spec-kit-release.json

REM Extract download URL using PowerShell
for /f "delims=" %%i in ('powershell -Command "(Get-Content '%TEMP%\spec-kit-release.json' | ConvertFrom-Json).assets | Where-Object {$_.name -like 'spec-kit-template-%AI%-*.zip'} | Select-Object -First 1 -ExpandProperty browser_download_url"') do set DOWNLOAD_URL=%%i

if "%DOWNLOAD_URL%"=="" (
    echo Error: No template found for AI assistant "%AI%"
    rmdir /s /q "%PROJECT_PATH%"
    exit /b 1
)

REM Download the template
echo Downloading template...
curl -L -o "%TEMP%\spec-kit-template.zip" "%DOWNLOAD_URL%"

REM Extract template
echo Extracting template...
powershell -Command "Expand-Archive -Path '%TEMP%\spec-kit-template.zip' -DestinationPath '%PROJECT_PATH%' -Force"

REM Handle nested directory (if exists)
powershell -Command "$items = Get-ChildItem '%PROJECT_PATH%'; if ($items.Count -eq 1 -and $items[0].PSIsContainer) { Get-ChildItem $items[0].FullName -Force | Move-Item -Destination '%PROJECT_PATH%' -Force; Remove-Item $items[0].FullName -Force }"

REM Add workspace integration to CLAUDE.md
echo. >> "%PROJECT_PATH%\CLAUDE.md"
echo ## Workspace Integration >> "%PROJECT_PATH%\CLAUDE.md"
echo. >> "%PROJECT_PATH%\CLAUDE.md"
echo This project uses GitHub Spec-Kit for specification-driven development integrated with workspace protocols. >> "%PROJECT_PATH%\CLAUDE.md"
echo. >> "%PROJECT_PATH%\CLAUDE.md"
echo ### Specification Commands >> "%PROJECT_PATH%\CLAUDE.md"
echo - /constitution - Establish project principles >> "%PROJECT_PATH%\CLAUDE.md"
echo - /specify - Define requirements >> "%PROJECT_PATH%\CLAUDE.md"
echo - /plan - Create technical plan >> "%PROJECT_PATH%\CLAUDE.md"
echo - /tasks - Generate task breakdown >> "%PROJECT_PATH%\CLAUDE.md"
echo - /implement - Execute implementation >> "%PROJECT_PATH%\CLAUDE.md"

REM Clean up
del "%TEMP%\spec-kit-release.json" 2>nul
del "%TEMP%\spec-kit-template.zip" 2>nul

REM Initialize git if available
where git >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Initializing git repository...
    pushd "%PROJECT_PATH%"
    git init
    git add .
    git commit -m "Initial commit from Spec-Kit template"
    popd
)

echo.
echo ✅ Spec-driven project initialized successfully!
echo.
echo Project location: %CD%\%PROJECT_PATH%
echo.
echo Next steps:
echo   1. cd %PROJECT_PATH%
echo   2. Use Claude Code with the following commands:
echo      /constitution - Define project principles
echo      /specify - Create specifications
echo      /plan - Technical planning
echo      /tasks - Task breakdown
echo      /implement - Execute implementation