# Agent Guidance

## Definition of Done
- Tests and code committed together
- Quality gate passes with `npm run qa`
- Coverage at least 90 percent
- Docs updated in `docs/`

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Quality gate: `npm run qa`

## Conventions
- Follow `persona-platform/persona-platform-ui-design.md` for UI
- Follow API and database specs in `persona-platform/`
- Do not change contracts without updating schemas and examples
- Do not add features without tests
