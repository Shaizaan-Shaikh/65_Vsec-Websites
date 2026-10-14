const tripId = new URLSearchParams(location.search).get("id");
let trip;
let activities = [];
let expenses = [];
let budgetSummary;
let recordType;
let editingId;
const recordForm = document.querySelector("#record-form");
const categoryFilter = document.querySelector("#category-filter");
categoryFilter.innerHTML += categories
  .map((category) => `<option>${category}</option>`)
  .join("");

async function loadDetails() {
  document.querySelector("#reload").disabled = true;
  try {
    if (!/^[a-f\d]{24}$/i.test(tripId || ""))
      throw new Error("No valid trip was selected. Return to All journeys.");
    const results = await Promise.all([
      api("/trips/" + tripId),
      api(`/trips/${tripId}/activities`),
      api(`/trips/${tripId}/expenses`),
      api(`/trips/${tripId}/summary`),
    ]);
    [trip, activities, expenses, budgetSummary] = results;
    document.title = trip.name + " · Wayfarer";
    document.querySelector("#trip-name").textContent = trip.name;
    document.querySelector("#destination").textContent =
      "↗ " + trip.destination;
    document.querySelector("#trip-meta").textContent =
      `${dateLabel(trip.startDate)} – ${dateLabel(trip.endDate)} · ${trip.travelers} ${trip.travelers === 1 ? "traveler" : "travelers"}`;
    document.querySelector("#trip-description").textContent = trip.description;
    renderBudget();
    renderItinerary();
    renderExpenses();
    document.querySelector("#trip-content").hidden = false;
    return true;
  } catch (error) {
    document.querySelector("#trip-content").hidden = true;
    message(error.message, true);
    return false;
  } finally {
    document.querySelector("#loading").hidden = true;
    document.querySelector("#reload").disabled = false;
  }
}
function renderBudget() {
  const s = budgetSummary;
  document.querySelector("#allocated").textContent = money(s.allocatedBudget);
  document.querySelector("#planned").textContent = money(s.totalPlannedCost);
  document.querySelector("#actual").textContent = money(s.actualSpending);
  document.querySelector("#remaining").textContent = money(
    Math.abs(s.remainingBudget),
  );
  document.querySelector("#remaining-label").textContent =
    s.remainingBudget < 0 ? "Overspent by" : "Remaining budget";
  document
    .querySelector("#remaining")
    .classList.toggle("over", s.remainingBudget < 0);
  const percent =
    s.percentageSpent === null
      ? s.actualSpending
        ? 100
        : 0
      : Math.min(100, s.percentageSpent);
  const fill = document.querySelector("#progress-fill");
  fill.style.width = percent + "%";
  fill.style.background =
    s.remainingBudget < 0 ? "var(--danger)" : "var(--accent)";
  fill.parentElement.setAttribute("aria-valuenow", percent);
  const note =
    s.percentageSpent === null
      ? "No budget allocated · percentage not applicable"
      : `${s.percentageSpent}% of budget spent`;
  fill.parentElement.setAttribute("aria-valuetext", note);
  document.querySelector("#budget-note").textContent = note;
}
function renderItinerary() {
  let html = "";
  const last = new Date(trip.endDate + "T00:00:00Z");
  const current = new Date(trip.startDate + "T00:00:00Z");
  let day = 1;
  while (current <= last) {
    const date = current.toISOString().slice(0, 10);
    const records = activities.filter((activity) => activity.date === date);
    html += `<article class="day-card"><div class="day-heading"><span class="day-number">DAY ${String(day).padStart(2, "0")}</span><h3>${dateLabel(date)}</h3></div>`;
    html += records.length
      ? records
          .map(
            (activity) =>
              `<div class="activity"><div class="activity-main"><time>${escapeHTML(activity.time)}</time><div><p class="record-title">${escapeHTML(activity.title)}</p><div class="record-meta">${escapeHTML(activity.location)}</div><p class="record-description">${escapeHTML(activity.description)}</p></div></div><div class="record-actions"><strong>${money(activity.estimatedCost)} estimated</strong><button class="text-button" data-type="activities" data-action="edit" data-id="${activity._id}">Edit</button><button class="text-button danger" data-type="activities" data-action="delete" data-id="${activity._id}">Delete</button></div></div>`,
          )
          .join("")
      : '<p class="day-empty">An open day. Add an activity to make a plan.</p>';
    html += "</article>";
    current.setUTCDate(current.getUTCDate() + 1);
    day++;
  }
  document.querySelector("#itinerary").innerHTML = html;
}
function renderExpenses() {
  const selected = categoryFilter.value;
  const shown = expenses.filter(
    (expense) => !selected || expense.category === selected,
  );
  document.querySelector("#expenses").innerHTML = shown.length
    ? shown
        .map(
          (expense) =>
            `<article class="expense-row"><div class="expense-title-row"><p class="record-title">${escapeHTML(expense.title)}</p><strong>${money(expense.amount)}</strong></div><div class="record-meta">${escapeHTML(expense.category)} · ${dateLabel(expense.date)}</div><p class="record-description">${escapeHTML(expense.description)}</p><div class="record-actions"><button class="text-button" data-type="expenses" data-action="edit" data-id="${expense._id}">Edit</button><button class="text-button danger" data-type="expenses" data-action="delete" data-id="${expense._id}">Delete</button></div></article>`,
        )
        .join("")
    : emptyState(
        selected ? "No matching expenses" : "Nothing spent yet",
        selected
          ? "Choose another category or add an expense."
          : "Record your first expense to track actual spending.",
      );
  document.querySelector("#category-totals").innerHTML =
    "<h3>Category totals · all expenses</h3>" +
    categories
      .map(
        (category) =>
          `<div class="category-total"><span>${category}</span><strong>${money(budgetSummary.categoryTotals[category])}</strong></div>`,
      )
      .join("");
}
function openRecord(type, record) {
  recordType = type;
  editingId = record?._id;
  const isActivity = type === "activities";
  document.querySelector("#record-title").textContent =
    `${record ? "Edit" : "Add"} ${isActivity ? "activity" : "expense"}`;
  const dateLimits = isActivity
    ? `min="${trip.startDate}" max="${trip.endDate}"`
    : 'min="1900-01-01" max="2100-12-31"';
  document.querySelector("#record-fields").innerHTML = `<div class="form-grid">
    <label class="full">${isActivity ? "Activity name" : "Expense title"}<input name="title" required maxlength="120"></label>
    <label>Date<input name="date" type="date" required ${dateLimits}></label>
    ${isActivity ? '<label>Time<input name="time" type="time" required></label><label class="full">Location<input name="location" required maxlength="160"></label>' : `<label>Category<select name="category">${categories.map((category) => `<option>${category}</option>`).join("")}</select></label>`}
    <label class="full">${isActivity ? "Estimated cost" : "Actual amount"} (₹)<input name="${isActivity ? "estimatedCost" : "amount"}" type="number" min="0" max="1000000000" step="0.01" required></label>
    <p class="field-note full">${isActivity ? "Estimates help you plan. Record money actually paid as an expense." : "Record the total paid for the group. Expenses may be dated before the trip, such as advance payments."}</p>
    <label class="full">Description (optional)<textarea name="description" maxlength="1000"></textarea></label></div>`;
  fillForm(
    recordForm,
    record || { date: trip.startDate, time: "09:00", estimatedCost: 0 },
  );
  document.querySelector("#record-dialog").showModal();
}
document.querySelector("#reload").addEventListener("click", () => {
  message("");
  loadDetails();
});
document
  .querySelector("#edit-trip")
  .addEventListener("click", () => openTripForm(trip));
document
  .querySelector("#add-activity")
  .addEventListener("click", () => openRecord("activities"));
document
  .querySelector("#add-expense")
  .addEventListener("click", () => openRecord("expenses"));
categoryFilter.addEventListener("change", renderExpenses);
document
  .querySelector("#delete-trip")
  .addEventListener("click", async (event) => {
    if (
      !confirm(
        `Delete “${trip.name}” and all its activities and expenses? This cannot be undone.`,
      )
    )
      return;
    event.target.disabled = true;
    try {
      await api("/trips/" + tripId, "DELETE");
      location.href = "index.html";
    } catch (error) {
      message(error.message, true);
      event.target.disabled = false;
    }
  });
tripForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  busy(tripForm, true);
  try {
    await api(
      "/trips/" + tripId,
      "PUT",
      formData(tripForm, ["travelers", "budget"]),
    );
    document.querySelector("#trip-dialog").close();
    if (await loadDetails()) message("Trip updated.");
  } catch (error) {
    tripForm.querySelector(".form-error").textContent = error.message;
  } finally {
    busy(tripForm, false);
  }
});
recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  busy(recordForm, true);
  const endpoint = editingId
    ? `/${recordType}/${editingId}`
    : `/trips/${tripId}/${recordType}`;
  try {
    await api(
      endpoint,
      editingId ? "PUT" : "POST",
      formData(recordForm, [
        recordType === "activities" ? "estimatedCost" : "amount",
      ]),
    );
    document.querySelector("#record-dialog").close();
    if (await loadDetails())
      message(
        recordType === "activities"
          ? "Itinerary saved."
          : "Expense saved. Your budget is up to date.",
      );
  } catch (error) {
    recordForm.querySelector(".form-error").textContent = error.message;
  } finally {
    busy(recordForm, false);
  }
});
document
  .querySelector(".detail-columns")
  .addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { type, action, id } = button.dataset;
    const record = (type === "activities" ? activities : expenses).find(
      (item) => item._id === id,
    );
    if (action === "edit") return openRecord(type, record);
    if (!confirm(`Delete “${record.title}”? This cannot be undone.`)) return;
    button.disabled = true;
    try {
      await api(`/${type}/${id}`, "DELETE");
      if (await loadDetails()) message("Record deleted.");
    } catch (error) {
      message(error.message, true);
    } finally {
      button.disabled = false;
    }
  });
loadDetails();
