// Shared browser helpers. Saved records always come from the Express API.
const categories = [
  "Accommodation",
  "Transportation",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
const dateLabel = (value) =>
  new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

async function api(url, method = "GET", body) {
  let response;
  try {
    response = await fetch("/api" + url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      "The server could not be reached. Check it is running, then refresh before retrying a save.",
    );
  }
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "The request failed. Please try again.");
  return result;
}
function message(text, error = false) {
  const box = document.querySelector("#message");
  box.textContent = text;
  box.classList.toggle("error", error);
  box.hidden = !text;
}
function emptyState(title, text) {
  return `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">↗</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></div>`;
}
function formData(form, numericFields) {
  const data = Object.fromEntries(new FormData(form));
  for (const name of numericFields) data[name] = Number(data[name]);
  return data;
}
function fillForm(form, record) {
  form.reset();
  for (const [name, value] of Object.entries(record)) {
    const control = form.elements.namedItem(name);
    if (control) control.value = value;
  }
  form.querySelector(".form-error").textContent = "";
}
function busy(form, saving) {
  for (const button of form.querySelectorAll("button"))
    button.disabled = saving;
  form.dataset.saving = saving ? "true" : "";
}
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelectorAll("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("cancel", (event) => {
    if (dialog.querySelector("form").dataset.saving === "true")
      event.preventDefault();
  });
});

// The same trip form is used on both pages.
document.querySelector("#trip-fields").innerHTML = `<div class="form-grid">
  <label class="full">Trip name<input name="name" required maxlength="120" placeholder="e.g. A long weekend in Goa"></label>
  <label class="full">Destination<input name="destination" required maxlength="120" placeholder="e.g. Goa, India"></label>
  <label>Start date<input name="startDate" type="date" required min="1900-01-01" max="2100-12-31"></label>
  <label>End date<input name="endDate" type="date" required min="1900-01-01" max="2100-12-31"></label>
  <label>Travelers<input name="travelers" type="number" min="1" max="10000" step="1" value="1" required></label>
  <label>Total budget (₹)<input name="budget" type="number" min="0" max="1000000000" step="0.01" required placeholder="20000"></label>
  <p class="field-note full">The budget covers the whole group, not each person. Trips can span up to 366 days.</p>
  <label class="full">Description (optional)<textarea name="description" maxlength="1000" placeholder="A few notes about this journey…"></textarea></label>
</div>`;
const tripForm = document.querySelector("#trip-form");
tripForm.elements.startDate.addEventListener("change", () => {
  tripForm.elements.endDate.min =
    tripForm.elements.startDate.value || "1900-01-01";
});
function openTripForm(record = { travelers: 1 }) {
  fillForm(tripForm, record);
  tripForm.elements.endDate.min = record.startDate || "1900-01-01";
  document.querySelector("#trip-dialog").showModal();
}
