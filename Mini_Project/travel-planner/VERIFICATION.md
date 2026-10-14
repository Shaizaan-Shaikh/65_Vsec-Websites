# Verification

**Result on 14 October 2026:** `npm test` passed all 8 tests (0 failures), using Node.js 24.14.1 and local MongoDB 8.3. The expected database-unavailable test logs `MongoServerSelectionError` and passes by checking the 503 response.

The full suite was rerun successfully after replacing generated route registration with explicit routes, simplifying the budget calculations into loops, and formatting all application source files. The existing eight assignments were not changed.

## Automated checks

Run `npm test` with local MongoDB available. Tests use uniquely named temporary databases, never the app's `travel_planner` database.

- Trip, activity and expense create/read/update/delete through actual HTTP requests.
- Chronological activities and date-range conflicts.
- Real MongoDB ObjectId references and isolation between trips.
- Budget totals, category totals, overspending, decimal arithmetic and zero budget.
- API shutdown, MongoDB client disconnection, startup/reconnection and reading existing data.
- Malformed JSON, invalid dates, numbers, categories, IDs and missing parents.
- Cascade deletion and injected partial-failure recovery.
- A genuinely unavailable MongoDB endpoint returns 503; static pages still load.
- HTML, CSS and JavaScript assets return successful responses.
- Frontend form submissions, updates, deletes, expense filtering, day rendering and fresh page loading using jsdom connected to the real API.
- User-supplied HTML is displayed as text.

## Visual verification limit

No browser connection was available during implementation. jsdom has no layout engine. Desktop/mobile screenshots, overflow, native modal focus trapping and real browser refresh were therefore not visually verified. CSS includes breakpoints at 1000px and 650px, a viewport meta tag, and a single-column mobile layout.

Manual checks still recommended: open at desktop width, then 390px and 320px; check all forms and both pages for horizontal overflow; use Tab/Escape in dialogs; confirm browser refresh preserves records. Actual database persistence and fresh DOM page loading are covered by automated tests.
