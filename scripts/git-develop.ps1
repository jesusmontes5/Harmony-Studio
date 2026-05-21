param(
    [string]$Message = "Actualiza proyecto"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "== Harmony Studio: subida a develop ==" -ForegroundColor Cyan

$currentBranch = (git branch --show-current).Trim()
if (-not $currentBranch) {
    throw "No se ha podido detectar la rama actual."
}

if ($currentBranch -ne "develop") {
    Write-Host "Cambiando a develop..."
    git fetch origin develop
    git switch develop
}

git pull --ff-only origin develop
git add -A

$hasChanges = -not [string]::IsNullOrWhiteSpace((git status --porcelain))
if ($hasChanges) {
    Write-Host "Creando commit: $Message"
    git commit -m $Message
} else {
    Write-Host "No hay cambios locales para commitear."
}

git push origin develop

Write-Host "Subida a develop completada." -ForegroundColor Green
