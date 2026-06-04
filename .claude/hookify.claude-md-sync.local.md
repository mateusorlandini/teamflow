---
name: claude-md-sync
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (back-end/src/main/.*(Controller|SecurityConfig)\.java|back-end/src/main/java/.*/domain/.*\.java|back-end/src/main/resources/db/migration/V.*\.sql)$
---

📝 **Keep CLAUDE.md in sync — same change, not later**

You're editing a structural backend file (a controller, `SecurityConfig`, a domain entity, or a Flyway migration). The working agreement requires `CLAUDE.md` to reflect the **current** state of the code, updated *in the same change*. Before finishing, check whether this edit changes anything documented there:

- **Routes / auth:** new or changed endpoints, or `permitAll` / `hasRole` rules → update the *Security / auth state* and the relevant domain bullet (route paths, public vs authenticated).
- **Domain model:** a new/renamed entity, table, column, enum, or constraint → update *Backend architecture* and the *Booking / slot model* notes (and add the migration to the schema description).
- **Build / run:** changed Maven/JDK/DB setup → update the commands section.

If something documented in `CLAUDE.md` (or a caveat in `SPEC.md`) is now stale because of this edit, fix it now. If this change is purely internal and documents nothing in `CLAUDE.md`, you can ignore this reminder.
