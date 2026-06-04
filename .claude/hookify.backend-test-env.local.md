---
name: backend-test-env
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: back-end/src/.*\.java$
---

☕ **Before running backend build/tests — set the environment**

This project will not compile or test in a default shell. Two prerequisites:

1. **Pin JDK 21** (the system default is older and breaks compilation):
   ```bash
   export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
   ```
2. **Postgres must be up** — the Spring context test boots against the real DB and Flyway validates/applies migrations even during `mvn test`:
   ```bash
   docker compose up -d postgres   # from repo root
   ```

Then run from `back-end/`: `./mvnw test` (or `-Dtest=ClassName#method` for one). If you have the **postgres MCP** connected you can also inspect the live schema/seed data instead of shelling into `psql`.
