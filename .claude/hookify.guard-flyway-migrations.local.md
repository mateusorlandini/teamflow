---
name: guard-flyway-migrations
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (back-end/src/main/resources/db/migration/V.*\.sql|application\.properties)$
---

🛑 **Flyway / config guard — check before you change this file**

You're touching a schema migration or `application.properties`.

**If this is an *existing* migration (`V1__`–`V4__`, anything already committed/applied):** do **not** edit it. Flyway records a checksum on first apply, so changing applied SQL makes `flyway validate` fail on the next boot/`mvn test`. To change the schema, add a **new** `V{n+1}__description.sql` instead (the `/new-migration` skill scaffolds it).

**If you're creating a brand-new `V{n+1}__` file:** fine — just make sure it's the next sequential number and follow conventions (Postgres `ENUM` types defined in SQL and mapped via `@Column(columnDefinition=...)`; schema is Flyway-owned, `ddl-auto=none`).

**If this is `application.properties`:** keep the DB password out of any commit you didn't intend, and prefer env overrides (`JWT_SECRET`, etc.) over hardcoding new secrets.
