const express = require("express");
const path = require("node:path");
const {
  fail,
  objectId,
  validateTrip,
  validateActivity,
  validateExpense,
  summary,
} = require("./validation");

function createApp(db) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (
      ["POST", "PUT"].includes(req.method) &&
      (!req.is("application/json") ||
        !req.body ||
        Array.isArray(req.body) ||
        typeof req.body !== "object")
    ) {
      return res
        .status(400)
        .json({
          error: "Send a JSON object with Content-Type: application/json.",
        });
    }
    next();
  });

  // Serialize writes in this one local server. This prevents an activity being
  // inserted halfway through deleting its parent trip or changing its dates.
  let lastWrite = Promise.resolve();
  app.use("/api", async (req, res, next) => {
    if (!["POST", "PUT", "DELETE"].includes(req.method)) return next();
    const previous = lastWrite;
    let release;
    lastWrite = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    if (res.destroyed) {
      release();
      return;
    }
    res.once("finish", release);
    res.once("close", release);
    next();
  });
  const trips = db.collection("trips");
  const activities = db.collection("activities");
  const expenses = db.collection("expenses");
  async function findTrip(id) {
    const trip = await trips.findOne({ _id: objectId(id) });
    if (!trip) fail("Trip not found.", 404);
    return trip;
  }
  async function getSummary(trip) {
    const planned = await activities.find({ tripId: trip._id }).toArray();
    const spent = await expenses.find({ tripId: trip._id }).toArray();
    return summary(trip, planned, spent);
  }
  app.get("/api/trips", async (req, res) => {
    const records = await trips
      .find()
      .sort({ startDate: 1, createdAt: -1 })
      .toArray();
    for (const trip of records) {
      trip.summary = await getSummary(trip);
    }
    res.json(records);
  });
  app.get("/api/trips/:id", async (req, res) =>
    res.json(await findTrip(req.params.id)),
  );
  app.post("/api/trips", async (req, res) => {
    const trip = {
      ...validateTrip(req.body),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await trips.insertOne(trip);
    res.status(201).json({ ...trip, _id: result.insertedId });
  });
  app.put("/api/trips/:id", async (req, res) => {
    const trip = await findTrip(req.params.id);
    const changes = validateTrip(req.body);
    const outside = await activities.findOne({
      tripId: trip._id,
      $or: [
        { date: { $lt: changes.startDate } },
        { date: { $gt: changes.endDate } },
      ],
    });
    if (outside)
      fail(
        "Existing activities fall outside these dates. Move or delete those activities first.",
        409,
      );
    changes.updatedAt = new Date();
    await trips.updateOne({ _id: trip._id }, { $set: changes });
    res.json({ ...trip, ...changes });
  });
  app.delete("/api/trips/:id", async (req, res) => {
    const trip = await findTrip(req.params.id);
    // Standalone MongoDB does not support transactions. Delete children first;
    // if a step fails, keep the parent so the same DELETE can safely be retried.
    try {
      await activities.deleteMany({ tripId: trip._id });
      await expenses.deleteMany({ tripId: trip._id });
      await trips.deleteOne({ _id: trip._id });
    } catch {
      fail(
        "Deletion did not finish. Some related records may already be removed. Retry deleting this trip.",
        503,
      );
    }
    res.status(204).end();
  });
  app.get("/api/trips/:id/summary", async (req, res) =>
    res.json(await getSummary(await findTrip(req.params.id))),
  );

  // ACTIVITIES ROUTES
  app.get("/api/trips/:tripId/activities", async (req, res) => {
    const trip = await findTrip(req.params.tripId);
    const records = await activities
      .find({ tripId: trip._id })
      .sort({ date: 1, time: 1, createdAt: 1 })
      .toArray();
    res.json(records);
  });

  app.post("/api/trips/:tripId/activities", async (req, res) => {
    const trip = await findTrip(req.params.tripId);
    if ("tripId" in req.body)
      fail("Trip reference comes from the URL; do not supply tripId.");
    const activity = {
      ...validateActivity(req.body, trip),
      tripId: trip._id,
      createdAt: new Date(),
    };
    const result = await activities.insertOne(activity);
    res.status(201).json({ ...activity, _id: result.insertedId });
  });

  app.put("/api/activities/:id", async (req, res) => {
    const activity = await activities.findOne({ _id: objectId(req.params.id) });
    if (!activity) fail("Activity not found.", 404);
    const trip = await findTrip(activity.tripId.toHexString());
    if ("tripId" in req.body)
      fail("Moving records to another trip is not allowed.");
    const changes = validateActivity(req.body, trip);
    await activities.updateOne({ _id: activity._id }, { $set: changes });
    res.json({ ...activity, ...changes });
  });

  app.delete("/api/activities/:id", async (req, res) => {
    const result = await activities.deleteOne({ _id: objectId(req.params.id) });
    if (!result.deletedCount) fail("Activity not found.", 404);
    res.status(204).end();
  });

  // EXPENSES ROUTES
  app.get("/api/trips/:tripId/expenses", async (req, res) => {
    const trip = await findTrip(req.params.tripId);
    const records = await expenses
      .find({ tripId: trip._id })
      .sort({ date: 1, time: 1, createdAt: 1 })
      .toArray();
    res.json(records);
  });

  app.post("/api/trips/:tripId/expenses", async (req, res) => {
    const trip = await findTrip(req.params.tripId);
    if ("tripId" in req.body)
      fail("Trip reference comes from the URL; do not supply tripId.");
    const expense = {
      ...validateExpense(req.body),
      tripId: trip._id,
      createdAt: new Date(),
    };
    const result = await expenses.insertOne(expense);
    res.status(201).json({ ...expense, _id: result.insertedId });
  });

  app.put("/api/expenses/:id", async (req, res) => {
    const expense = await expenses.findOne({ _id: objectId(req.params.id) });
    if (!expense) fail("Expense not found.", 404);
    await findTrip(expense.tripId.toHexString());
    if ("tripId" in req.body)
      fail("Moving records to another trip is not allowed.");
    const changes = validateExpense(req.body);
    await expenses.updateOne({ _id: expense._id }, { $set: changes });
    res.json({ ...expense, ...changes });
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const result = await expenses.deleteOne({ _id: objectId(req.params.id) });
    if (!result.deletedCount) fail("Expense not found.", 404);
    res.status(204).end();
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "API route not found." }),
  );
  app.use(express.static(path.join(__dirname, "public")));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ error: "Malformed JSON request." });
    if (error.type === "entity.too.large")
      return res.status(413).json({ error: "Request is too large." });
    if (error.status)
      return res.status(error.status).json({ error: error.message });
    console.error("Database request failed:", error.name);
    res
      .status(503)
      .json({
        error: "Database unavailable. Check that MongoDB is running and retry.",
      });
  });
  return app;
}
module.exports = { createApp };
