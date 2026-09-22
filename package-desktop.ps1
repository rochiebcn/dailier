$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

& "$repoRoot\mvnw.cmd" -Pdesktop-dist -DskipTests package
if ($LASTEXITCODE -ne 0) {
  throw 'The Maven desktop packaging build failed.'
}

