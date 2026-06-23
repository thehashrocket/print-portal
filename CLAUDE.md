# Thomson Print Portal (Cancun V2)

## Node.js

This project uses **nvm** to manage Node.js versions. The required version is **24.2.0**.

```bash
nvm use 24.2.0
```

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:

- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Shipping Checklist

Before shipping (creating a PR or pushing to a shared branch), always run lint and format checks:

```bash
pnpm lint
pnpm exec prettier --check .
```

Fix any errors before proceeding. Do not skip or suppress lint/format failures.

## GitHub Issues

Every TODO in `TODOS.md` must have an associated GitHub issue. Before starting work on any TODO item, check if a GitHub issue exists for it (`gh issue list`). If one does not exist, create it with `gh issue create` using the TODO's title, severity, and description.

Every PR must link to a GitHub issue. Before creating a PR:

1. Identify the issue it addresses.
2. If no issue exists yet, create one first.
3. Include `Closes #<issue-number>` or `Refs #<issue-number>` in the PR body.
