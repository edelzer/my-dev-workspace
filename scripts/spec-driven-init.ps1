# Spec-Driven Project Initialization Script
# Downloads and sets up GitHub Spec-Kit templates directly

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$ProjectName,

    [Parameter(Position=1)]
    [string]$AI = "claude",

    [switch]$NoGit
)

$ErrorActionPreference = "Stop"

# Validate project name
if ([string]::IsNullOrWhiteSpace($ProjectName)) {
    Write-Error "Project name cannot be empty"
    exit 1
}

$ProjectPath = Join-Path (Get-Location) "projects" $ProjectName

if (Test-Path $ProjectPath) {
    Write-Error "Project '$ProjectName' already exists at $ProjectPath"
    exit 1
}

Write-Host "Initializing spec-driven project: $ProjectName" -ForegroundColor Cyan

# Create project directory
New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null

# Download Spec-Kit template from GitHub releases
$ReleaseUrl = "https://api.github.com/repos/github/spec-kit/releases/latest"
Write-Host "Fetching latest Spec-Kit release..." -ForegroundColor Yellow

try {
    $Release = Invoke-RestMethod -Uri $ReleaseUrl -Headers @{Accept="application/vnd.github.v3+json"}

    # Find the appropriate template asset
    $AssetName = "spec-kit-template-$AI-ps.zip"
    $Asset = $Release.assets | Where-Object { $_.name -eq $AssetName }

    if (-not $Asset) {
        # Fallback to shell script version
        $AssetName = "spec-kit-template-$AI-sh.zip"
        $Asset = $Release.assets | Where-Object { $_.name -eq $AssetName }
    }

    if (-not $Asset) {
        Write-Error "No template found for AI assistant: $AI"
        Write-Host "Available assets:" -ForegroundColor Yellow
        $Release.assets | ForEach-Object { Write-Host "  - $($_.name)" }
        exit 1
    }

    Write-Host "Downloading template: $AssetName" -ForegroundColor Yellow
    $TempZip = Join-Path $env:TEMP "$AssetName"

    # Download the template
    Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $TempZip

    # Extract to project directory
    Write-Host "Extracting template..." -ForegroundColor Yellow
    Expand-Archive -Path $TempZip -DestinationPath $ProjectPath -Force

    # Handle nested directory structure (GitHub releases often have a single root folder)
    $ExtractedItems = Get-ChildItem -Path $ProjectPath
    if ($ExtractedItems.Count -eq 1 -and $ExtractedItems[0].PSIsContainer) {
        $NestedDir = $ExtractedItems[0].FullName
        Get-ChildItem -Path $NestedDir -Force | Move-Item -Destination $ProjectPath -Force
        Remove-Item -Path $NestedDir -Force
    }

    # Clean up
    Remove-Item -Path $TempZip -Force

} catch {
    Write-Error "Failed to download or extract template: $_"
    if (Test-Path $ProjectPath) {
        Remove-Item -Path $ProjectPath -Recurse -Force
    }
    exit 1
}

# Add workspace integration to CLAUDE.md
$ClaudeMdPath = Join-Path $ProjectPath "CLAUDE.md"
$IntegrationContent = @"

## Workspace Integration

This project uses GitHub Spec-Kit for specification-driven development while following workspace protocols.

### Specification Commands

- ``/constitution`` - Establish project principles and guidelines
- ``/specify`` - Define functional requirements and user stories
- ``/plan`` - Create technical implementation plan
- ``/tasks`` - Generate task breakdown
- ``/implement`` - Execute implementation

### Workspace Protocol Alignment

**Law #1 (Uncertainty)**: Stop if specifications are unclear
**Law #2 (Protocol)**: Specification phases are mandatory before implementation
**Law #3 (Orchestration)**: Use agents for spec validation and implementation
**Law #4 (Efficiency)**: Keep specifications minimal but complete
**Law #5 (Leadership)**: Report specification progress and get approval

### Workflow

1. Start with ``/constitution`` to define principles
2. Use ``/specify`` for requirements (iterate until complete)
3. Create ``/plan`` with technical approach
4. Generate ``/tasks`` for implementation
5. Execute with ``/implement`` using workspace agents
"@

Add-Content -Path $ClaudeMdPath -Value $IntegrationContent

# Initialize git repository if requested
if (-not $NoGit) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    Push-Location $ProjectPath
    try {
        git init
        git add .
        git commit -m "Initial commit from Spec-Kit template"
        Write-Host "Git repository initialized" -ForegroundColor Green
    } catch {
        Write-Host "Failed to initialize git repository: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

Write-Host "`n✅ Spec-driven project initialized successfully!" -ForegroundColor Green
Write-Host "`nProject location: $ProjectPath" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. cd projects\$ProjectName"
Write-Host "  2. Use Claude Code with the following commands:"
Write-Host "     /constitution - Define project principles"
Write-Host "     /specify - Create specifications"
Write-Host "     /plan - Technical planning"
Write-Host "     /tasks - Task breakdown"
Write-Host "     /implement - Execute implementation"