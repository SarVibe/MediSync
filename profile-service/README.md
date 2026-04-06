# Profile Service

Profile Service stores and manages patient/doctor profile data for the healthcare platform.

## Responsibilities

- Patient profile create/update/read/soft-delete
- Doctor upgrade request profile data (pending/approved/rejected)
- Doctor profile update/read
- Internal endpoints used by `auth-service`:
  - `POST /api/profiles/init`
  - `POST /api/profiles/status-update`

## Security Model

- User-facing profile endpoints require a bearer token.
- Tokens are validated by calling `auth-service` `POST /auth/validate`.
- Internal endpoints require `X-Internal-Api-Key`.

## Key Config

Set in `src/main/resources/application.properties` or environment variables:

- `AUTH_SERVICE_BASE_URL` (default `http://localhost:8082`)
- `PROFILE_INTERNAL_API_KEY` (must match auth `INTERNAL_API_KEY`)
- MySQL datasource settings for `profile_db`

## Quick Start

```bash
./mvnw clean test
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

