const { MongoClient } = require("mongodb");
const { createApp } = require("./app");

const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  },
);
const db = client.db("travel_planner");
const app = createApp(db);
const port = Number(process.env.PORT || 3000);

// Keep the interface available even if MongoDB is temporarily offline.
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Travel planner: http://127.0.0.1:${port}`);
});
client
  .connect()
  .then(() => console.log("Connected to MongoDB: travel_planner"))
  .catch(() =>
    console.error(
      "MongoDB unavailable. Start MongoDB, then retry in the browser.",
    ),
  );

async function shutdown() {
  server.close();
  await client.close();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
server.on("error", (error) => {
  console.error(`Server could not start: ${error.code}`);
  client.close();
  process.exitCode = 1;
});
