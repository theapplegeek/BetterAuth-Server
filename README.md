# better-auth-server

Backend API basato su [Hono](https://hono.dev), [Better Auth](https://www.better-auth.com) e [Drizzle ORM](https://orm.drizzle.team) con database PostgreSQL.

Espone:
- endpoint auth sotto `/api/auth/*` (gestiti da Better Auth + plugin)
- endpoint admin custom sotto `/api/admin/*` (RBAC, utenti, ruoli, permessi)
- healthcheck su `/health`

## Stack tecnico

- Runtime: Bun
- Framework HTTP: Hono
- Auth framework: Better Auth
- ORM: Drizzle ORM
- DB: PostgreSQL
- Validazione input: Valibot (`@hono/standard-validator`)

## Cosa fa il backend

- Gestisce autenticazione con:
  - email/password + verifica email
  - OAuth Google e Discord
  - passkey (WebAuthn)
  - magic link
  - 2FA (TOTP + backup codes)
  - JWT con JWKS
- Gestisce autorizzazioni in due livelli:
  - `user.role` (campo utente Better Auth, usato dal middleware admin)
  - RBAC custom (`role`, `permission`, `user_role`, `role_permission`)
- Arricchisce sessione/JWT con ruoli e permessi provenienti dalle tabelle RBAC custom.

## Architettura ad alto livello

1. `src/index.ts` inizializza Hono e CORS su `/api/*`.
2. `/api/auth/*` è instradato direttamente a `auth.handler(...)`.
3. `/api/admin/*` usa middleware:
   - `requireSession`: sessione valida obbligatoria
   - `requireRole("admin")`: utente con ruolo admin obbligatorio
4. I service admin usano Drizzle per CRUD su utenti/ruoli/permessi.

## Prerequisiti

- Bun (consigliato >= 1.3.x)
- PostgreSQL
- Variabili ambiente configurate (`.env`)

## Configurazione `.env`

Parti da `.env.example`, ma **attenzione**: il codice legge `AUTH_SECRET` (non `BETTER_AUTH_SECRET`).

Esempio minimo funzionante:

```env
AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://app:app@localhost:5432/betterauth
TRUSTED_ORIGIN=http://localhost:4200

RP_ID=localhost
RP_NAME=Better Auth Demo App
APP_NAME=Better Auth Demo

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

Variabili supportate dal codice:

- `AUTH_SECRET`: secret Better Auth
- `BETTER_AUTH_URL`: URL base backend
- `DATABASE_URL`: connessione PostgreSQL
- `TRUSTED_ORIGIN`: origin frontend consentita CORS/trusted origins
- `APP_NAME`: nome applicazione auth
- `RP_ID`, `RP_NAME`: passkey/WebAuthn
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth Google
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`: OAuth Discord

Nota email:
- Esistono variabili SMTP in `.env.example`, ma `src/utils/email.utils.ts` è uno stub e logga a console (`SEND EMAIL`) finché non integri un provider reale.

## Avvio progetto

### 1) Locale (app in Bun + DB esterno/locale)

```bash
bun install
bun run run-migrations.ts
bun run dev
```

Server disponibile su:
- `http://localhost:3000`

### 2) Docker Compose (app + db)

```bash
docker compose up --build
```

Il container:
- esegue le migration all'avvio (`run.sh` + `run-migrations.ts`)
- avvia poi `dist/index.js`

## Comandi utili

Da `package.json`:

```bash
bun run dev     # hot reload
bun run build   # build in dist/
bun run start   # avvio da dist/
```

Migrazioni / Drizzle:

```bash
bun run run-migrations.ts
bunx drizzle-kit migrate
bunx drizzle-kit generate --name=<nome>
```

Comandi nel `justfile`:

```bash
just generate-db-schema
just generate-db-migration <name>
just db-migrate
just db-check
```

## Database e migrazioni

Schema in:
- `src/db/schema/auth-schema.ts` (tabelle Better Auth)
- `src/db/schema/rbac-schema.ts` (ruoli/permessi custom)

Migrations SQL in `drizzle/`.

`run-migrations.ts` usa un advisory lock PostgreSQL (`pg_advisory_lock`) per evitare race condition su avvii concorrenti.

## Autenticazione (`/api/auth/*`)

Gli endpoint auth sono forniti dal runtime Better Auth e montati con:
- `GET/POST /api/auth/*`

Plugin attivi:
- Admin plugin
- JWT plugin (JWKS path `/.well-known/jwks.json`, JWT expiration `3m`)
- Magic link (`expiresIn: 300s`)
- Two factor (TOTP + backup code)
- Passkey (WebAuthn)

Sessione custom:
- in `auth.ts` viene aggiunto a `session.user`:
  - `roles: string[]`
  - `permissions: string[]`
  recuperati dalle tabelle RBAC (`user_role`, `role_permission`).

## API custom admin (`/api/admin/*`)

Tutti gli endpoint:
- richiedono sessione valida
- richiedono ruolo admin (`requireRole("admin")`)
- accettano/ritornano JSON

### 1) Utenti

#### `GET /api/admin/user`

Lista utenti (query inoltrata a `auth.api.listUsers`).

Risposta:
- payload Better Auth + arricchimento:
  - `users[].roles` (oggetti ruolo RBAC)
  - `users[].permissions` (oggetti permesso RBAC deduplicati)

Codici:
- `200` ok
- `401` unauthorized
- `403` forbidden
- `500` internal error

#### `POST /api/admin/user`

Crea utente via Better Auth + associazioni RBAC (`user_role`).

Body:

```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "S3cure!Pass",
  "emailVerified": false,
  "image": "https://example.com/avatar.png",
  "role": "admin",
  "roleIds": [1, 2]
}
```

Validazioni principali:
- `email` valida
- password min 8, maiuscola, minuscola, numero, carattere speciale
- `role`: `"user"` o `"admin"` (anche array ammesso)
- `roleIds`: numeri, default `[]`

Risposta:
- `200`: `{ "userId": "<id>" }`
- `400`: ruolo inesistente / validazione
- `500`: errore interno

#### `PUT /api/admin/user/:userId`

Aggiorna utente (partial update; password non ammessa).

Body: stessa struttura del create ma opzionale (senza `password`).

Comportamento ruoli RBAC:
- elimina le associazioni correnti in `user_role`
- se `roleIds` è presente e non vuoto: inserisce quelle nuove
- se `roleIds` è `[]`: lascia l'utente senza ruoli RBAC
- se `roleIds` non viene inviato: **nell'implementazione corrente** le associazioni vengono comunque rimosse

Risposta:
- `200`: `{ "userId": "<id>" }`
- `404`: utente non trovato
- `400`: ruolo inesistente / validazione
- `500`: errore interno

### 2) Ruoli

#### `GET /api/admin/role`

Restituisce tutti i ruoli.

Risposta:
- `200`: `RoleDto[]`

#### `GET /api/admin/role/permissions`

Restituisce ruoli con relativi permessi.

Risposta:
- `200`: `RoleDto[]` con `permissions`

#### `POST /api/admin/role`

Body:

```json
{
  "name": "manager",
  "description": "Ruolo manager",
  "permissionIds": [1, 2]
}
```

Risposta:
- `200`: `{ "id": <roleId> }`
- `400`: ruolo già esistente / permission inesistente / validazione
- `500`: errore creazione

#### `PUT /api/admin/role/:roleId`

Aggiorna ruolo e rimpiazza la relazione `role_permission`.

Body uguale al create role.

Risposta:
- `200`: `{ "id": <roleId> }`
- `404`: ruolo non trovato
- `400`: permission inesistente / validazione
- `500`: errore update

#### `DELETE /api/admin/role/:roleId`

Elimina ruolo.

Risposta:
- `200`: `{}`
- `404`: ruolo non trovato

### 3) Permessi

#### `GET /api/admin/permission`

Lista permessi.

Risposta:
- `200`: `PermissionDto[]`

#### `POST /api/admin/permission`

Body:

```json
{
  "code": "user.read",
  "name": "Read users",
  "description": "Permette lettura utenti"
}
```

Risposta:
- `200`: `{ "id": <permissionId> }`
- `400`: duplicato (`code`/`name`) o validazione
- `500`: errore creazione

#### `PUT /api/admin/permission/:permissionId`

Aggiorna permesso.

Risposta:
- `200`: `{ "id": <permissionId> }`
- `404`: permission non trovata
- `500`: errore update

#### `DELETE /api/admin/permission/:permissionId`

Elimina permesso.

Risposta:
- `200`: `{}`
- `404`: permission non trovata

## Healthcheck

Endpoint:
- `GET /health`

Risposta:

```json
{
  "ok": true
}
```

## Note operative importanti

- CORS è applicato su `/api/*` con `origin = TRUSTED_ORIGIN` e `credentials: true`.
- Le chiamate admin richiedono cookie/sessione Better Auth validi.
- Per bootstrap iniziale, serve almeno un utente con `user.role = "admin"` (campo tabella `user`) per accedere alle API admin.
- Le email sono solo loggate finché non implementi `sendEmail` con provider reale.
