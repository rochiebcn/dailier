# Dailier Desktop (Electron)

This module packages the application as a desktop app, embedding:

- the compiled Angular frontend
- the Spring Boot backend (`dailier-backend.jar`)

## Structure

- `main.js`: Electron main process.
- `preload.js`: minimal bridge for the renderer process.
- `scripts/prepare-bundle.mjs`: prepares `desktop/app/` from the backend JAR and the frontend build.
- `pom.xml`: Maven bridge for desktop dependency installation, bundle preparation, verification, and optional Windows packaging.

## Commands

### From Maven (recommended)

```powershell
./mvnw.cmd package -DskipTests
./mvnw.cmd package -Pdesktop-dist -DskipTests
```

- `package` builds the backend and frontend and prepares `desktop/app/`.
- `package -Pdesktop-dist` also generates the unsigned Windows installer in `desktop/dist/`.

### From the repository root

```powershell
./package-desktop.ps1
```

This script delegates to Maven with the `desktop-dist` profile.

### Direct npm workflow

```powershell
Set-Location .\desktop
npm install
npm run verify
npm run start
npm run package:win
```

`package:win` generates an **unsigned** installer, suitable for local development.

## Packaging flow

### Maven-driven flow

1. Maven packages `backend/`.
2. Maven runs `npm install --legacy-peer-deps` and `npm run build` in `frontend/`.
3. Maven runs `npm install` in `desktop/`.
4. Maven runs `npm run prepare:bundle:skip-build` to copy artifacts into `desktop/app/`.
5. With `-Pdesktop-dist`, Maven also runs `npm run package:win:skip-build` to generate the installer in `desktop/dist/`.

### Direct npm flow

1. `npm run prepare:bundle`
   - runs `mvnw.cmd -pl backend -DskipTests package`
   - runs `npm run build` in `frontend/`
   - copies the generated backend and frontend artifacts into `desktop/app/`
2. `electron-builder` generates the installer in `desktop/dist/`

## Notes

- The embedded backend runs with its `cwd` inside Electron's user data directory (`app.getPath('userData')`) so `dailier.db` is stored outside the installation directory.
- The frontend is served from an internal local Electron HTTP server and proxies `/api/*` to the embedded backend.

## Basic code signing on Windows

`electron-builder` signs automatically when these environment variables are present:

- `CSC_LINK` (path to the `.pfx` certificate or URL)
- `CSC_KEY_PASSWORD` (certificate password)

PowerShell example:

```powershell
$env:CSC_LINK = "C:\certs\dailier-code-sign.pfx"
$env:CSC_KEY_PASSWORD = "<password>"
npm run package:win:signed
```

If your environment blocks symlinks while extracting `winCodeSign`, run PowerShell as administrator or enable Developer Mode in Windows.

