# Dailier

Desktop application for preparing your *daily scrum* in advance and sending it automatically by email at the configured time.

## Basic project structure

```text
backend/    Spring Boot backend + SQLite + Liquibase
frontend/   Angular 21 application
desktop/    Electron wrapper and distributable packaging
docs/       Functional specifications and working notes
```

### Main modules

- `backend/`
  - REST API built with Spring Boot.
  - SQLite persistence.
  - Liquibase migrations.
  - Code organized by feature.
- `frontend/`
  - Standalone Angular application.
  - Consumes the backend through `/api/*`.
- `desktop/`
  - Runs the app as a desktop application with Electron.
  - Bundles the backend `jar` and the frontend build.
  - Generates the Windows installer.
- `pom.xml`
  - Maven entry point for backend, frontend build orchestration, and desktop packaging.
- `package-desktop.ps1`
  - Convenience script to generate the installer from the repository root.

## Requirements

- Java 21
- Node.js 20.19+ or 22.12+
- npm
- Windows PowerShell to use `package-desktop.ps1`

## Local development

### Backend

```powershell
./mvnw.cmd spring-boot:run -pl backend
```

### Frontend

```powershell
Set-Location .\frontend
npm install
npm start
```

## Maven build entry points

### Build the whole project

```powershell
./mvnw.cmd package -DskipTests
```

This command:

1. Packages the Spring Boot backend.
2. Installs frontend dependencies and builds the Angular app.
3. Installs desktop dependencies.
4. Prepares the Electron bundle in `desktop/app/` using the Maven-built artifacts.

### Generate the Windows distributable with Maven

```powershell
./mvnw.cmd package -Pdesktop-dist -DskipTests
```

This does everything from the full project build and also runs Electron Builder to produce the Windows installer in `desktop/dist/`.

## How to generate the distributable file

The Windows distributable is generated from the `desktop/` module using Electron Builder.

### Recommended option from the repository root

```powershell
./package-desktop.ps1
```

This script is a shortcut for the Maven packaging profile above and does the following:

1. Packages the backend with Maven.
2. Builds the frontend through Maven-driven npm executions.
3. Prepares the Electron app bundle in `desktop/app/`.
4. Generates the Windows installer in `desktop/dist/`.

### Manual option

```powershell
./mvnw.cmd package -Pdesktop-dist -DskipTests
```

## Generated artifacts

- Electron-ready bundle: `desktop/app/`
- Installer/output directory: `desktop/dist/`
- Backend JAR: `backend/target/`
- Frontend build: `frontend/dist/`

## Useful commands

### Run backend tests

```powershell
./mvnw.cmd test -pl backend -q
```

### Build only the frontend

```powershell
./mvnw.cmd compile -pl frontend
```

### Verify the desktop module

```powershell
./mvnw.cmd verify -pl desktop -DskipTests
```

## Additional documentation

- `desktop/README.md`: Electron packaging details.
- `docs/`: functional specifications.
- `AGENTS.md`: general technical guidance for the repository.


