# Learning notes for the viva

## Suggested reading order

Start with `public/index.html` and `public/css/style.css`, like your HTML/CSS assignments. Then read `public/js/app.js` for form events and displaying records. Read `server.js` next, followed by the explicit GET, POST, PUT and DELETE routes in `app.js`, like Assignment 8. Finally read `validation.js` for input checks and budget calculations. The test folder checks the application; it is not part of the code needed to run the website.

The project uses ordinary functions, arrays, objects, loops and async/await. A few shared helpers avoid repeating form and validation code. There are no controllers, services, repositories or frontend frameworks to learn.

## 1. What HTML does

HTML gives the page its structure: headings, trip cards, forms, buttons and lists. `index.html` is the dashboard and `trip.html` is the selected trip. Labels connect form controls to readable names. Native dialogs provide modal forms.

## 2. What CSS does

CSS controls colours, spacing, fonts and layout. `style.css` uses grid and flexbox to arrange cards. Media queries change multiple columns into one column on narrow screens. The budget bar is an ordinary div whose width JavaScript updates.

## 3. What frontend JavaScript does

JavaScript listens for clicks and form submissions, reads inputs, calls the API with `fetch()`, and redraws the interface. `api.js` shares helpers, `app.js` manages dashboard actions, and `trip.js` handles trip details. Form values arrive as strings; numeric fields are converted before sending JSON. User text is escaped or assigned through `textContent` so it does not become executable HTML.

## 4. What Node.js does

Node.js runs JavaScript outside the browser. It runs `server.js`, maintains a MongoDB connection and listens for HTTP requests. Node's built-in environment-file support reads local configuration without requiring another package.

## 5. Why Express.js is used

Express is a small web framework on top of Node's HTTP features. Node can serve HTTP without it, but Express makes routing, JSON parsing, static files and error responses simpler. For example, `app.post('/api/trips', ...)` defines what happens when a browser submits a new trip. Express 5 passes rejected async route promises to our error handler.

## 6. Why MongoDB is used

MongoDB stores records persistently on disk as documents in collections. Closing the browser or restarting Express does not erase them. The official driver provides `MongoClient` and database operations. We use three collections: trips, activities and expenses. There is no localStorage fallback.

## 7. How a browser request reaches the backend

Example: saving an expense.

1. The user submits the expense form in `trip.html`.
2. `trip.js` converts the amount into a number and calls the shared `api()` helper.
3. `fetch()` sends POST `/api/trips/:tripId/expenses` with JSON.
4. Express parses JSON and finds the matching route in `app.js`.
5. The route checks the parent trip and validates the expense on the server.
6. MongoDB `insertOne()` saves the document and creates its `_id`.
7. The API responds with HTTP 201 and the saved document.
8. The frontend reloads records and the summary, then updates the screen.

The same Express server serves the HTML and the API, so the browser uses relative API URLs without extra CORS configuration.

## 8. How an expense belongs to a trip

A trip has a unique MongoDB `_id`. Each expense stores that ID as `tripId`, also an ObjectId. The query `expenses.find({ tripId: trip._id })` retrieves only that trip's expenses. This is a one-to-many relationship. MongoDB does not automatically enforce it like a relational foreign key, so our backend verifies the parent before inserting or updating a child.

The browser sends a trip ID in the URL. The backend validates its format and converts it with `new ObjectId(...)`. It does not trust a body-supplied `tripId`, preventing accidental movement between trips.

## 9. How CRUD works

| Operation | HTTP method | MongoDB operation | Example |
| --- | --- | --- | --- |
| Create | POST | `insertOne()` | Add a trip |
| Read | GET | `find()` / `findOne()` | List trips or open a trip |
| Update | PUT | `updateOne()` with `$set` | Edit an expense |
| Delete | DELETE | `deleteOne()` / `deleteMany()` | Remove a trip and its children |

`find()` returns a cursor; `.toArray()` reads its documents. `.sort({ date: 1, time: 1 })` puts activities in chronological order. `$set` changes selected fields without replacing the ID or relationship. Only explicitly validated editable fields reach MongoDB.

Deleting a trip is three database operations. A standalone MongoDB server does not support a transaction across them. We delete children first and retain the parent on failure, report the problem, and let the user retry. A simple promise queue keeps writes sequential inside this local app to prevent overlapping updates during deletion. A production app with multiple servers would need a stronger design.

## 10. How budget calculations work

For a ₹20,000 group budget, ₹3,000 of activity estimates and ₹5,000 of actual expenses:

- Planned cost: ₹3,000.
- Actual spending: ₹5,000.
- Remaining: ₹20,000 − ₹5,000 = **₹15,000**.
- Spent percentage: ₹5,000 ÷ ₹20,000 × 100 = **25%**.

We never subtract the planned cost from remaining budget. An estimate describes an intention; an expense describes money paid. If actual expenses become ₹22,000, remaining is −₹2,000 and the interface says “Overspent by ₹2,000”.

Money totals are added in integer paise to avoid results such as `0.1 + 0.2` becoming `0.30000000000000004`. With no allocated budget, division by zero is avoided: the API returns `percentageSpent: null`. Category totals always cover every expense, even while a filter hides some rows.

## Validation and error handling

Browser validation gives quick feedback, but a user can call the API directly through Thunder Client. Therefore the server independently checks dates, numbers, required fields, categories and IDs. A bad input returns 400; a missing record returns 404; conflicting trip dates return 409; an unavailable database returns 503. Errors appear in the form without discarding entered values.

## A short demonstration sequence

Create a three-day trip → add activities → record an expense → show budget calculations → edit the expense to exceed the budget → filter expenses → refresh → restart Express → show that records remain → delete the trip with confirmation.
