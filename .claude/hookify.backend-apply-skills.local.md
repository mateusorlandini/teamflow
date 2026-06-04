---
name: backend-apply-skills
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: back-end/src/main/.*\.java$
---

☕ **Back-end work — apply the Java & security skills**

You're editing a back-end Java file. Before/while implementing, make sure you've applied these skills:

- **`/java-best-pratices`** — modern Java 21 (records for DTOs, switch expressions, `java.time`, Optional over null, SLF4J parameterized logging, Composed Method, constructor injection).
- **`/web-security`** — secure-by-default (input validation with Jakarta Bean Validation, parameterized queries / no SQL injection, BCrypt, least-privilege endpoints, no secrets in code, safe error messages).

If you haven't loaded the relevant skill(s) for this change yet, do so now and follow their guidance. (Note: this project is Java 21 — unnamed `_` variables are a Java 22 preview feature and won't compile here.)
