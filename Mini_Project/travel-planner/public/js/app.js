let trips = [];
let editingId = null;
const list = document.querySelector("#trips");

async function loadTrips() {
  const refresh = document.querySelector("#reload");
  refresh.disabled = true;
  try {
    trips = await api("/trips");
    document.querySelector("#trip-count").textContent = trips.length;
    document.querySelector("#total-budget").textContent = money(
      trips.reduce((total, trip) => total + trip.budget, 0),
    );
    document.querySelector("#total-spent").textContent = money(
      trips.reduce((total, trip) => total + trip.summary.actualSpending, 0),
    );
    list.innerHTML = trips.length
      ? trips
          .map(
            (trip) => `<article class="trip-card">
      <div class="card-top"><p class="eyebrow">↗ ${escapeHTML(trip.destination)}</p><h3>${escapeHTML(trip.name)}</h3></div>
      <div class="card-body"><p class="card-meta">${dateLabel(trip.startDate)} – ${dateLabel(trip.endDate)}<br>${trip.travelers} ${trip.travelers === 1 ? "traveler" : "travelers"}</p>
      <div class="card-money"><div><span>ALLOCATED</span><strong>${money(trip.budget)}</strong></div><div><span>ACTUAL SPENDING</span><strong>${money(trip.summary.actualSpending)}</strong></div></div>
      <div class="card-actions"><a class="primary" href="trip.html?id=${trip._id}">View details ↗</a><button class="text-button" data-action="edit" data-id="${trip._id}">Edit</button><button class="text-button danger" data-action="delete" data-id="${trip._id}">Delete</button></div></div></article>`,
          )
          .join("")
      : emptyState(
          "Your next journey starts here",
          "Choose “Plan a trip” to add a destination, dates and budget.",
        );
    return true;
  } catch (error) {
    message(error.message, true);
    list.innerHTML = emptyState(
      "Trips could not be loaded",
      "Check your server and database, then choose “Refresh trips”.",
    );
    for (const id of ["trip-count", "total-budget", "total-spent"])
      document.getElementById(id).textContent = "—";
    return false;
  } finally {
    refresh.disabled = false;
  }
}
document.querySelector("#reload").addEventListener("click", () => {
  message("");
  loadTrips();
});
document.querySelector("#create-trip").addEventListener("click", () => {
  editingId = null;
  document.querySelector("#trip-dialog-title").textContent = "Plan a trip";
  openTripForm();
});
list.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const trip = trips.find((item) => item._id === button.dataset.id);
  if (button.dataset.action === "edit") {
    editingId = trip._id;
    document.querySelector("#trip-dialog-title").textContent = "Edit trip";
    openTripForm(trip);
    return;
  }
  if (
    !confirm(
      `Delete “${trip.name}” and all its activities and expenses? This cannot be undone.`,
    )
  )
    return;
  button.disabled = true;
  try {
    await api("/trips/" + trip._id, "DELETE");
    if (await loadTrips()) message("Trip and its related records deleted.");
  } catch (error) {
    message(error.message, true);
  } finally {
    button.disabled = false;
  }
});
tripForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  busy(tripForm, true);
  try {
    await api(
      "/trips" + (editingId ? "/" + editingId : ""),
      editingId ? "PUT" : "POST",
      formData(tripForm, ["travelers", "budget"]),
    );
    document.querySelector("#trip-dialog").close();
    if (await loadTrips())
      message(
        editingId
          ? "Trip updated."
          : "Trip created. Open its details to start planning your days.",
      );
  } catch (error) {
    tripForm.querySelector(".form-error").textContent = error.message;
  } finally {
    busy(tripForm, false);
  }
});
loadTrips();
