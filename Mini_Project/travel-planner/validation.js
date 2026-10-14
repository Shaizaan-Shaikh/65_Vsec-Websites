const { ObjectId } = require("mongodb");
const categories = [
  "Accommodation",
  "Transportation",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
function objectId(value) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value))
    fail("Invalid record ID.");
  return new ObjectId(value);
}
function text(body, key, max = 120, required = true) {
  const value = body[key];
  if (!required && (value === undefined || value === "")) return "";
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  ) {
    fail(
      `${key} must be ${required ? "non-empty text" : "text"} of at most ${max} characters.`,
    );
  }
  return value.trim();
}
function number(body, key, integer = false) {
  const value = body[key];
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1000000000
  ) {
    fail(`${key} must be a non-negative number, at most 1,000,000,000.`);
  }
  if (integer && (!Number.isInteger(value) || value < 1 || value > 10000)) {
    fail("travelers must be a positive integer, at most 10,000.");
  }
  if (!integer && Math.abs(value * 100 - Math.round(value * 100)) > 0.0001) {
    fail(`${key} must have at most two decimal places.`);
  }
  return value;
}
function date(body, key) {
  const value = text(body, key, 10);
  const parsed = new Date(value + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value ||
    value < "1900-01-01" ||
    value > "2100-12-31"
  ) {
    fail(`${key} must be a real date between 1900 and 2100 (YYYY-MM-DD).`);
  }
  return value;
}
function validateTrip(body) {
  const trip = {
    name: text(body, "name"),
    destination: text(body, "destination"),
    startDate: date(body, "startDate"),
    endDate: date(body, "endDate"),
    travelers: number(body, "travelers", true),
    budget: number(body, "budget"),
    description: text(body, "description", 1000, false),
  };
  if (trip.endDate < trip.startDate)
    fail("End date cannot be before start date.");
  if ((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000 > 365) {
    fail("A trip can span at most 366 days.");
  }
  return trip;
}
function validateActivity(body, trip) {
  const activity = {
    title: text(body, "title"),
    date: date(body, "date"),
    time: text(body, "time", 5),
    location: text(body, "location", 160),
    description: text(body, "description", 1000, false),
    estimatedCost: number(body, "estimatedCost"),
  };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(activity.time))
    fail("Time must use HH:MM (24-hour).");
  if (activity.date < trip.startDate || activity.date > trip.endDate)
    fail("Activity date must fall within the trip dates.");
  return activity;
}
function validateExpense(body) {
  const expense = {
    title: text(body, "title"),
    category: text(body, "category"),
    amount: number(body, "amount"),
    date: date(body, "date"),
    description: text(body, "description", 1000, false),
  };
  if (!categories.includes(expense.category))
    fail("Choose a valid expense category.");
  return expense;
}
function centsTotal(records, field) {
  // Add whole paise so decimal values such as 0.1 and 0.2 add correctly.
  let totalPaise = 0;
  for (const record of records) {
    totalPaise += Math.round(record[field] * 100);
  }
  return totalPaise / 100;
}
function summary(trip, activities, expenses) {
  const plannedCost = centsTotal(activities, "estimatedCost");
  const actualSpending = centsTotal(expenses, "amount");
  const remainingBudget =
    (Math.round(trip.budget * 100) - Math.round(actualSpending * 100)) / 100;

  // A percentage cannot be calculated when the budget is zero.
  let percentageSpent = null;
  if (trip.budget > 0) {
    percentageSpent = Math.round((actualSpending / trip.budget) * 10000) / 100;
  }

  const categoryTotals = {};
  for (const category of categories) {
    const matchingExpenses = expenses.filter(
      (expense) => expense.category === category,
    );
    categoryTotals[category] = centsTotal(matchingExpenses, "amount");
  }

  return {
    allocatedBudget: trip.budget,
    totalPlannedCost: plannedCost,
    actualSpending,
    remainingBudget,
    overspentAmount: Math.max(0, -remainingBudget),
    percentageSpent,
    categoryTotals,
  };
}
module.exports = {
  fail,
  objectId,
  validateTrip,
  validateActivity,
  validateExpense,
  summary,
};
