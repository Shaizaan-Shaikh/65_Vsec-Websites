const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const dataPath = path.join(__dirname, "..", ".data", "mongodb");
fs.mkdirSync(dataPath, { recursive: true });
console.log(
  "Starting local MongoDB on 127.0.0.1:27017. Keep this terminal open.",
);
console.log(
  "If MongoDB is already running, skip this command and use npm start.",
);
console.log("Database logs: .data/mongodb.log");
const database = spawn(
  process.env.MONGOD_BIN || "mongod",
  [
    "--dbpath",
    dataPath,
    "--bind_ip",
    "127.0.0.1",
    "--port",
    "27017",
    "--logpath",
    path.join(__dirname, "..", ".data", "mongodb.log"),
    "--logappend",
  ],
  { stdio: "inherit", windowsHide: true },
);
database.on("error", () => {
  console.error(
    "Cannot start mongod. Install MongoDB Community Server and add its bin directory to PATH.",
  );
  console.error("Alternatively set MONGOD_BIN to the full path of mongod.exe.");
  process.exitCode = 1;
});
database.on("exit", (code) => {
  process.exitCode = code || 0;
});
process.on("SIGINT", () => database.kill("SIGINT"));
process.on("SIGTERM", () => database.kill("SIGTERM"));
