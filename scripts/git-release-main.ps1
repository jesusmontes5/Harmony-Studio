param(
    [string]$Message = "Actualiza proyecto"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "== Harmony Studio: develop -> main ==" -ForegroundColor Cyan

git fetch origin

if ((git branch --show-current).Trim() -ne "develop") {
    git switch develop
}

git pull --ff-only origin develop
git add -A

$hasChanges = -not [string]::IsNullOrWhiteSpace((git status --porcelain))
if ($hasChanges) {
    Write-Host "Creando commit en develop: $Message"
    git commit -m $Message
} else {
    Write-Host "No hay cambios locales para commitear en develop."
}

git push origin develop

Write-Host "Fusionando develop en main..."
git switch main
git pull --ff-only origin main
git merge --no-ff develop -m "Fusiona develop en main"
git push origin main

git switch develop

Write-Host "Subida a develop y main completada." -ForegroundColor Green
