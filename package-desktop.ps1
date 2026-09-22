$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

npm --prefix "$repoRoot\desktop" install
if ($LASTEXITCODE -ne 0) {
  throw 'Fallo npm install en desktop.'
}

npm --prefix "$repoRoot\desktop" run package:win
if ($LASTEXITCODE -ne 0) {
  throw 'Fallo el empaquetado Windows en desktop.'
}

