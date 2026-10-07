---
name: kysely-migration-generator
description: Translate a Mermaid ERD or database data model into a Kysely TypeScript migration when asked to generate, implement, or update database schema migrations.
---

# Kysely Migration Generator

Read `docs/architecture/schema.mmd` as the source of truth unless the user names another ERD. Before writing a migration, inspect the existing migrations and project conventions, especially `src/db/migrations/001_initial_schema.ts`, and identify tables that already exist so they are not created twice.

## Translation Rules

- Convert Mermaid entity names to `snake_case` table names (for example, `USERS` becomes `users`) and attribute names to `snake_case` column names.
- Map Mermaid attribute types to appropriate PostgreSQL/Kysely column types. Use `serial` for integer auto-generating primary keys; use `uuid` with a database-side UUID default only when the model calls for UUIDs and the project supports the required generator. Do not silently change an explicitly modeled identifier type.
- Mark `PK` attributes as primary keys. Preserve nullability and uniqueness expressed by the model; do not make optional attributes required without a domain reason.
- Map each `FK` attribute to the referenced table's primary key with `.references('table.id').onDelete('cascade')`. If a relationship implies an FK but the ERD omits its attribute, add the correctly typed FK column on the referencing (many/optional) side.
- Interpret `||--o{` as one-to-many: put the FK on the `o{` side. Interpret `||--o|` as one-to-zero-or-one: put the FK on the optional side and add a unique constraint to enforce one-to-one. Preserve any explicit mandatory/optional markers from other relationships.
- Do not recreate an entity already created by an earlier migration. Extend an existing table only when the requested model change requires it; do not drop or rename pre-existing tables without explicit instruction.

## Migration Output

- Create `src/db/migrations/<timestamp>_<migration_name>.ts` with a unique timestamped filename that sorts after existing migrations.
- Follow the project's Kysely migration convention and export `async function up(db: Kysely<any>): Promise<void>` and `async function down(db: Kysely<any>): Promise<void>`.
- In `up`, create referenced/principal tables before dependent tables, using Kysely schema-builder calls and executing each statement.
- In `down`, drop only tables introduced by this migration, in reverse dependency order, so no referenced table is dropped while still in use.
- After writing the file, run `npm run build` and correct any errors before continuing. Then run `npm run migrate:up` to verify database execution. If the database is unavailable, report that execution was not verified and include the blocking error; never claim it succeeded.