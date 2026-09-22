# Dailier

Aplicación de escritorio para preparar el *daily scrum* con antelación y enviarlo automáticamente por correo a la hora configurada.

## Estructura básica del proyecto

```text
backend/    Backend Spring Boot + SQLite + Liquibase
frontend/   Aplicación Angular 21
desktop/    Envoltorio Electron y empaquetado del distributable
.docs/      No existe: la documentación funcional real está en docs/
docs/       Especificaciones funcionales y notas de trabajo
```

### Módulos principales

- `backend/`
  - API REST en Spring Boot.
  - Persistencia en SQLite.
  - Migraciones con Liquibase.
  - Código organizado por funcionalidades.
- `frontend/`
  - Aplicación Angular standalone.
  - Consume el backend vía `/api/*`.
- `desktop/`
  - Ejecuta la app como escritorio con Electron.
  - Embebe el `jar` del backend y el build del frontend.
  - Genera el instalador para Windows.
- `package-desktop.ps1`
  - Script de conveniencia para generar el instalador desde la raíz.

## Requisitos

- Java 25
- Node.js 20.19+ o 22.12+
- npm
- Windows PowerShell para usar `package-desktop.ps1`

## Desarrollo local

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

## Cómo generar el fichero distributable

El distributable de Windows se genera desde el módulo `desktop/` usando Electron Builder.

### Opción recomendada desde la raíz

```powershell
./package-desktop.ps1
```

Este script hace lo siguiente:

1. Instala dependencias de `desktop/`.
2. Ejecuta `npm --prefix desktop run package:win`.
3. Durante ese proceso se llama a `desktop/scripts/prepare-bundle.mjs`, que:
   - compila el backend con Maven,
   - compila el frontend con Angular,
   - copia ambos artefactos a `desktop/app/`.
4. `electron-builder` genera el instalador en `desktop/dist/`.

### Opción manual

```powershell
Set-Location .\desktop
npm install
npm run package:win
```

## Artefactos generados

- Bundle preparado para Electron: `desktop/app/`
- Instalador/directorio de salida: `desktop/dist/`
- JAR backend: `backend/target/`
- Build frontend: `frontend/dist/`

## Comandos útiles

### Ejecutar tests del backend

```powershell
./mvnw.cmd test -pl backend -q
```

### Construir solo el frontend

```powershell
Set-Location .\frontend
npm run build
```

### Verificar el módulo desktop

```powershell
Set-Location .\desktop
npm run verify
```

## Documentación adicional

- `desktop/README.md`: detalles del empaquetado Electron.
- `docs/`: especificaciones funcionales.
- `AGENTS.md`: guía técnica general del repositorio.

