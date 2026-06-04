---
name: frontend-apply-skills
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: front-end/src/.*\.(ts|html|scss|css)$
---

🎨 **Front-end work — apply the design & code-quality skills**

You're editing a front-end file. Before/while implementing, make sure you've applied these skills:

- **`/frontend-design`** — visual/UX design guidance.
- **`/angular-best-pratices`** — Angular conventions (standalone components, signals, OnPush, `inject()`, reactive forms).
- **`/clean-typescript`** — clean, type-safe TypeScript.

If you haven't loaded the relevant skill(s) for this change yet, do so now and follow their guidance. (Spec/cleanup-only edits — e.g. `.spec.ts` or pure config — can skip what doesn't apply.)
