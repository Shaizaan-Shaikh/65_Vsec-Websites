# Wayfarer — Travel Itinerary and Budget Planner

An original VSET mini-project using HTML5, CSS3, vanilla JavaScript, Node.js, Express and the official MongoDB Node.js driver. This is a local educational application, with real MongoDB persistence and no account system.

## Problem statement

Travel plans and spending records often live in separate notes. It becomes difficult to organise activities by day and know whether the group is staying within its budget.

## Aim and objectives

Bring trip details, day-wise itineraries and actual expenses into one place. Demonstrate form handling, responsive design, REST APIs, validation, document relationships and persistent CRUD operations. Keep planned costs separate from money actually spent.

## Main modules

- **Trips:** create, view, edit and delete trips; dashboard cards show dates, travelers, budget and spending.
- **Itinerary:** all trip dates appear with chronologically sorted activities, locations, notes and estimates.
- **Budget:** allocated budget, estimated costs, actual spending, remaining amount, percentage spent and overspending.
- **Expenses:** create, edit and delete actual payments; filter by category and see global category totals.

The interface uses the original name **Wayfarer**, cool white backgrounds, navy typography, blue actions and warm orange accents. The reference campus repository was used only to calibrate general scope, not copied or cloned.

## Requirements and quick start

- Node.js **22.9 or newer** (tested with Node 24).
- MongoDB Community Server installed, with `mongod` on PATH (tested with MongoDB 8.3).
- A current browser. Internet is needed to install npm dependencies; the app itself needs no external APIs or assets.

From PowerShell:

```powershell
cd "C:\Coding\web dev\Mini_Project\travel-planner"
npm ci
Copy-Item .env.example .env
npm run db
```

Keep this terminal open. In a **second terminal**:

```powershell
cd "C:\Coding\web dev\Mini_Project\travel-planner"
npm start
```

Open **http://127.0.0.1:3000**. If MongoDB already runs on port 27017, skip `npm run db`. Do not start two MongoDB instances against the same data directory. Use Ctrl+C to stop each process. `npm run dev` restarts the app when code changes.

`npm run db` stores MongoDB data under `.data/mongodb`. That directory is ignored by Git. Keep it to retain your records across database and application restarts. Do not delete it to troubleshoot a connection problem.

If `mongod` is not found, add your MongoDB `bin` folder to PATH or set its executable path in the database terminal:

```powershell
$env:MONGOD_BIN = 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe'
npm run db
```

Adjust the installed version in that path if necessary.

## Configuration

`.env` is optional; defaults work locally. `.env.example` contains no credentials.

| Setting | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | Express port, bound to localhost |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | Database server connection |
| `TEST_MONGODB_URI` | `mongodb://127.0.0.1:27017` | MongoDB instance used for temporary test databases |
| `MONGOD_BIN` | `mongod` | Optional executable path for `npm run db` |

The application database is always **`travel_planner`**. Tests use separate, uniquely named `travel_planner_test_*` databases. Never commit `.env`, credentials, `node_modules`, or database files.

If MongoDB is unavailable, pages still load and API requests return a clear 503 error. Start MongoDB and use the page's Refresh button. If port 3000 is occupied, set another `PORT` in `.env` and restart Express.

## Project structure

```text
travel-planner/
  package.json / package-lock.json
  server.js                 MongoDB client, server startup and shutdown
  app.js                    Express routes, relationships and errors
  validation.js             Input validation and budget arithmetic
  .env.example / .gitignore
  public/
    index.html              Trips dashboard
    trip.html               Trip details
    css/style.css           Responsive design
    js/api.js               Fetch, formatting and shared form helpers
    js/app.js               Dashboard interactions
    js/trip.js              Itinerary, expense and budget interactions
  scripts/start-db.js        Optional local MongoDB launcher
  test/api.test.js           Real MongoDB integration tests
  test/frontend.test.js      DOM interactions against the real API
  LEARNING_NOTES.md          Viva explanations
  VERIFICATION.md            Tests and verification limitations
```

## Database design

| Collection | Fields |
| --- | --- |
| `trips` | `_id`, `name`, `destination`, `startDate`, `endDate`, `travelers`, `budget`, `description`, `createdAt`, `updatedAt` |
| `activities` | `_id`, `tripId`, `title`, `date`, `time`, `location`, `description`, `estimatedCost`, `createdAt` |
| `expenses` | `_id`, `tripId`, `title`, `category`, `amount`, `date`, `description`, `createdAt` |

Each trip has many activities and expenses. Child `tripId` fields are MongoDB **ObjectIds**, not ordinary strings. API responses serialize IDs to strings for the browser. Dates are validated `YYYY-MM-DD` strings, times are `HH:MM`, and timestamps are MongoDB dates.

The server rejects unknown trip references. Child records cannot be moved between trips. Activity dates must be within the trip. Narrowing trip dates is rejected when it would exclude an activity. Expense dates may be outside trip dates to support advance payments.

Trip deletion removes activities, then expenses, then the trip. On a standalone MongoDB instance these steps are not a transaction. If a step fails, the parent remains and the API explains that some children may already be removed; retrying finishes deletion. Writes are serialized within this one local app process to prevent overlapping mutations. This is not designed for multiple server instances.

## Budget calculations

- Planned cost = sum of activity `estimatedCost` values.
- Actual spending = sum of expense `amount` values.
- Remaining budget = allocated budget − actual spending.
- Percentage spent = actual spending ÷ allocated budget × 100.
- Overspent amount = absolute value of a negative remaining budget.

Money is validated to two decimals; sums use integer paise before converting back to rupees. All amounts cover the **whole group**, not each traveler. With a zero budget, percentage is `null` (not applicable); any spending still appears as overspending. The progress bar stops at 100%, while the text can show a higher percentage. Category filtering changes only the visible expense list, not budget/category totals.

## REST API

All POST/PUT requests use `Content-Type: application/json`. PUT supplies all editable fields. Optional description defaults to empty text.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/trips` | List trips with their budget summaries |
| POST | `/api/trips` | Create a trip |
| GET / PUT / DELETE | `/api/trips/:id` | Read, update or cascade-delete a trip |
| GET / POST | `/api/trips/:tripId/activities` | List or add activities |
| PUT / DELETE | `/api/activities/:id` | Update or delete an activity |
| GET / POST | `/api/trips/:tripId/expenses` | List or add expenses |
| PUT / DELETE | `/api/expenses/:id` | Update or delete an expense |
| GET | `/api/trips/:id/summary` | Budget totals, percentage, overspending and category totals |

Responses: 200 successful read/update, 201 created, 204 deleted, 400 invalid request, 404 missing record, 409 trip dates conflict with activities, 413 oversized JSON, 503 database unavailable or incomplete deletion. Errors return `{ "error": "Explanation" }`.

## Thunder Client walkthrough

1. Start MongoDB and the app. In VS Code open Thunder Client → New Request.
2. POST `http://127.0.0.1:3000/api/trips`, select Body → JSON, and send:

```json
{
  "name": "Goa with friends",
  "destination": "Goa, India",
  "startDate": "2026-11-01",
  "endDate": "2026-11-03",
  "travelers": 5,
  "budget": 20000,
  "description": "Three days by the coast"
}
```

3. Copy the returned `_id`. POST `/api/trips/YOUR_TRIP_ID/activities`:

```json
{
  "title": "Baga Beach",
  "date": "2026-11-01",
  "time": "12:00",
  "location": "Baga, Goa",
  "estimatedCost": 1500,
  "description": "Lunch and beach time"
}
```

4. POST `/api/trips/YOUR_TRIP_ID/expenses`:

```json
{
  "title": "Hotel deposit",
  "category": "Accommodation",
  "amount": 5000,
  "date": "2026-10-20",
  "description": "Paid before departure"
}
```

5. GET `/api/trips/YOUR_TRIP_ID/summary`: planned 1500, actual 5000, remaining 15000 and 25% spent.
6. PUT the expense using its returned `_id` and the full expense body, changing `amount` to 22000. Summary now shows remaining −2000, overspent 2000 and 110% spent.
7. Test PUT for a trip/activity and DELETE for individual activities/expenses. Refresh the browser and restart Express: records remain.
8. Try a negative amount, fractional travelers, invalid ID, nonexistent trip or activity date outside the trip. Expect an error and no invalid record.
9. DELETE `/api/trips/YOUR_TRIP_ID`. Associated activities and expenses are also removed.

## Tests

With MongoDB running:

```powershell
npm test
```

Tests create and clean up their own temporary databases. They exercise actual HTTP requests and MongoDB, including reconnecting after an API shutdown. The frontend tests execute real scripts in jsdom and use the same real API. They do not substitute for visual browser testing. See `VERIFICATION.md` for exact scope.

## Limitations

- Local educational demonstration; no authentication, permissions, booking, payments or external travel services.
- Anyone using the local app can edit its records; do not expose it as a public service.
- INR only; no currency conversion, shared-expense settlement or per-person accounting.
- A trip may span at most 366 days, with 1–10,000 travelers. Monetary entries range from 0 to 1,000,000,000 with up to two decimals. Text lengths are bounded.
- A small dataset is expected; no pagination or sophisticated reporting.
- Standalone cascade deletion is retryable but not atomic.
- Desktop/mobile CSS is included; actual visual browser QA could not be performed in the implementation session because no browser connection was available.

## Technical references

- [MongoDB official Node.js driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Express error handling](https://expressjs.com/en/guide/error-handling/)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
