---
name: new-migration
description: Scaffold the next sequential Flyway migration for the BarberBook backend. Scans back-end/src/main/resources/db/migration/ for the highest V{n} and creates V{n+1}__<description>.sql with the project's header/conventions. Use when adding or changing database schema (a new table, column, enum, constraint, or index) or seed data — never by editing an already-applied migration.
disable-model-invocation: true
---

# New Flyway migration

Create the next migration file for the BarberBook backend. **Never edit an existing `V{n}__` file** — Flyway checksums applied migrations, so changes must go in a new sequential file.

## Steps

1. **Find the next version number.** List the migration directory and take the highest `V{n}` + 1:
   ```bash
   ls back-end/src/main/resources/db/migration/
   ```
   Files are `V1__init.sql`, `V2__seed_settings.sql`, `V3__create_bookings.sql`, `V4__professionals.sql`, … so the next is `V{n+1}`.

2. **Pick a `snake_case` description** from the user's intent (e.g. `add_services`, `block_dates`, `add_no_show_status`). Final name: `V{n+1}__<description>.sql`.

3. **Create the file** at `back-end/src/main/resources/db/migration/V{n+1}__<description>.sql` using this skeleton:
   ```sql
   -- <one-line purpose of this migration>
   -- <why / any context a future reader needs>

   -- DDL / DML here
   ```

4. **Apply the project conventions:**
   - Schema is Flyway-owned (`ddl-auto=none`) — Hibernate will not create anything; everything must be in SQL.
   - New Postgres `ENUM` types are declared here (`CREATE TYPE ... AS ENUM (...)`) and mapped on the entity with `@Column(columnDefinition = "...")`. Keep the value set identical to the Java enum.
   - UUID PKs use `DEFAULT gen_random_uuid()`; timestamps use `TIMESTAMPTZ ... DEFAULT NOW()`; booleans like `active BOOLEAN NOT NULL DEFAULT TRUE` (see `V1__init.sql` / `V4__professionals.sql` for the house style).
   - Adding a `NOT NULL` column to a populated table needs a `DEFAULT` or a backfill `UPDATE`.
   - Seed `INSERT`s that should tolerate re-runs use `ON CONFLICT DO NOTHING`.
   - Index the columns your queries filter/join on; name constraints/indexes explicitly (`uq_…`, `idx_…`).

5. **After writing**, consider launching the `flyway-migration-reviewer` agent to audit it, then validate:
   ```bash
   export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
   docker compose up -d postgres
   cd back-end && ./mvnw test
   ```

6. **Update `CLAUDE.md`** if the migration adds/renames a table or changes the documented schema model (the working agreement requires keeping it in sync).
