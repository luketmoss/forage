# Forage — Menu Planning & Recipe Tracker

## Project Overview
Menu planning app: Preact SPA → Google Sheets REST API.
- **frontend/**: Preact SPA (built with Vite) — deployed to GitHub Pages

Part of the bee-themed personal app suite:
- **Hive** — planning/kanban (gold)
- **Thrive** — workout tracker (orange)
- **Forage** — menu planning (green, this app)

Tagline: *From recipe to table.*

## Key Commands
- `cd frontend && npm run dev` — start Vite dev server (localhost:5175)
- `cd frontend && npm run build` — production build to frontend/dist/
- `cd frontend && npm test` — run frontend tests (vitest)
- `cd frontend && npx tsc --noEmit` — TypeScript type checking

## Environment
- **Windows machine** — `jq` is NOT available. For JSON parsing in shell commands, use `gh` built-in `--jq` flags. Never pipe to a standalone `jq` command.
- Node 20+, npm

## Architecture Notes
- Frontend uses direct `fetch()` to Google Sheets REST API (not gapi.client)
- Auth: Google Identity Services (GIS) token model
- State: @preact/signals (module-level signals, NOT useState for shared state)
- Styling: CSS custom properties in `global.css` (no CSS framework, no Tailwind)
- Router: Signal-based hash router using signals (no library dependency)
- Mobile-first design (375px primary breakpoint)
- No backend server — SPA reads/writes Sheets API directly via OAuth

## Preview & Demo Mode
- The app requires Google OAuth to function. For preview testing (QA, UX agents), use **demo mode** by navigating to `http://localhost:5175/forage/?demo=true` after starting the dev server.
- Demo mode provides a fake user and skips Google auth. Changes are not persisted.

## Data Model
Google Sheet "Forage" with 7 tabs:
- **Recipes** (A:K): id, Name, Description, Source, Source URL, Servings, Rating, Prep Time (min), Created, Updated, Notes
- **Ingredients** (A:D): id, Name, Description, Created
- **Recipe_Ingredients** (A:F): recipe_id, ingredient_id, Ingredient Name, Quantity, Unit, Order
- **Recipe_Prep** (A:D): recipe_id, Step #, Description, Order
- **Recipe_Steps** (A:D): recipe_id, Step #, Description, Order
- **Sessions** (A:I): id, recipe_id, Recipe Name, Date, Status (completed/scheduled), Prep Time (min), Cook Time (min), Rating, Notes
- **Config** (A:B): Key, Value

### Recipe Sources
- `manual` — user entered recipe by hand
- `web` — imported from a URL (AI-assisted scraping)
- `photo` — imported from a photo (AI-assisted OCR)

### Session Status
- `completed` — cooking session is done
- `scheduled` — planned for a future date
- `active` — currently in progress

### Rating Scale
1–5 stars

## UX Design Decisions
These decisions were made with the user and must be respected by all agents:

- **Landing screen**: Schedule (chronological session list with floating "New Cook" button)
- **Navigation**: Bottom tab bar (Schedule | Recipes | Ingredients) — 3 tabs, not 4
- **Settings**: Gear icon in Schedule header (not a bottom tab)
- **Terminology**: "Cook" (not "cooking session") — short, action-oriented, like "Workout" in Thrive
- **Cook flow**: Full-screen takeover (hides bottom nav), 56px+ touch targets for messy hands
- **Cook phases**: Prep phase (checklist + timer) → Cooking phase (step checklist + timer) → Summary (no rating — user hasn't eaten yet)
- **Step display**: All cooking steps visible as scrollable checklist with checkboxes (not one-at-a-time cards)
- **Finish anytime**: User can finish the cook at any step — no need to reach the last step
- **Timers**: 3 circular Android-style clocks across the top (40%/30%/30%). Main elapsed timer + 2 countdown timers. Tap countdown to start/pause, long-press to set time.
- **Recipe detail**: Horizontal scrollable tab bar (Info | Ingredients | Prep | Steps | History)
- **Servings scaling**: Inline +/- stepper on recipe Info tab, recalculates ingredient quantities
- **Prep-first philosophy**: All prep (cutting, measuring) happens before cooking starts
- **Shopping trip planner**: Bottom sheet from Schedule header (shopping cart icon), not a separate tab
- **New Cook flow**: Ask timing first (Cook Now / Schedule for Later) → then Pick Recipe / Create Manually
- **Pending cook detail**: Bottom sheet showing scheduled date, Start Now, Change Date, Edit Recipe, Cancel Cook
- **Shopping flow**: Pick shopping date + "shop through" date → compiled ingredient list from scheduled sessions → review/include/exclude → export to Hive as task with sub-items
- **Recipe creation**: Enter manually OR import from URL (prompts for URL, AI-powered coming soon) / photo
- **Recipe ingredients**: "Add to grocery list" action for manual ad-hoc additions
- **Ingredient library**: Central list (name + description), referenced by recipes. No quantities here.
- **Cook cards**: Recipe name, date, cook time, rating stars. Pending cooks show "Scheduled" badge.
- **Calendar dots**: Green (completed), yellow (scheduled), empty (no session)
- **Servings**: Read-only on recipe Info tab; editable only in edit mode
- **Device**: Mobile-first (375px primary breakpoint)

## Agent Routing

**Issue tracker: GitHub only.** All issue references mean GitHub issues. Use `gh` CLI exclusively.

When the user's request matches a custom skill, invoke it automatically:
- Bug report, feature idea, or new request → `/idea`
- UX review (usability, flow efficiency, mobile design) → `/ux`
- CI/CD or deployment issue → `/devops`

**When the user references an issue number**, always start the Full Pipeline.

## Pipeline Orchestration

**You (the main Claude instance) are the orchestrator.** You invoke skills in order, pass results between them, and ensure no step is skipped.

### Board Movement (for orchestrator use)

GitHub Project #5 (Forage). Never call `gh project list` or `gh project field-list` — IDs are hardcoded.

```bash
# Get item ID for an issue
gh project item-list 5 --owner luketmoss --limit 100 --format json --jq '.items[] | select(.content.number == <ISSUE_NUMBER>) | .id'
# Move to a column
gh api graphql -f query='mutation { updateProjectV2ItemFieldValue(input: { projectId: "PVT_kwHOAJR9ys4BT5st" itemId: "ITEM_ID" fieldId: "PVTSSF_lAHOAJR9ys4BT5stzhBFaEI" value: { singleSelectOptionId: "OPTION_ID" } }) { projectV2Item { id } } }'
```

| Column | Option ID |
|--------|-----------|
| To Do | `2ed3c08e` |
| PM Refining | `60b38b8d` |
| UX | `0c810f0f` |
| Refined | `9e0d0478` |
| In Development | `cedf160f` |
| Testing | `1bd1ca27` |
| Code Review | `2e7d4fd2` |
| Done | `2aaa3a20` |

### Refinement Pipeline
1. Move issue to **PM Refining**. Invoke `/pm` with the issue number.
2. Move issue to **UX**. Invoke `/ux` with the issue number and ACs.
3. Invoke `/pm` again with UX findings (accept/defer/reject).
4. Move issue to **Refined**.
5. Present final ACs to user (design gate).

### Dev Pipeline
1. **Dev**: Invoke `/dev` with the issue number.
2. **QA**: Invoke `/qa` with the issue number.
3. **Code Review**: Invoke `/review` with the issue number.
4. **Auto-merge**: Approve + squash-merge + delete branch + move to Done.

### Conflict Resolution
2 attempts per failing stage max. After 2 failures, stop and tell the user.
