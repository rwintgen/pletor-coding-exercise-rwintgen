# Copilot Instructions

## Workflow
- Update `journal.txt` after each task (what was done, why, commits).
- Do NOT commit unless asked.
- Commits use conventional prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`.
- Read `/docs` before proposing changes. Update docs when logic changes.
- Create tests in `/backend/tests` whenever developing a new feature.
- Ask for clarification whenever in doubt.

## Code
- No inline comments. Use JSDoc for exported functions/interfaces.
- Self-documenting names over descriptions.
- Use tokens from `frontend/src/theme.ts` for colors/spacing.
- Reuse components from `components/` — don't reimplement.
