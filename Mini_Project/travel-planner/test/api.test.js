const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { MongoClient, ObjectId } = require('mongodb');
const { createApp } = require('../app');
const { summary } = require('../validation');

const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = `travel_planner_test_${process.pid}_${Date.now()}`;
let client, db, server, base;
const tripBody = { name: 'Fictional Goa trip', destination: 'Goa', startDate: '2026-11-01', endDate: '2026-11-03', travelers: 5, budget: 20000, description: 'Integration test only' };
const activityBody = { title: 'Beach walk', date: '2026-11-01', time: '09:00', location: 'Baga', estimatedCost: 1000, description: '' };
const expenseBody = { title: 'Hotel deposit', category: 'Accommodation', amount: 5000, date: '2026-10-20', description: '' };

async function connect() {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
  await client.connect();
  db = client.db(databaseName);
  server = createApp(db).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
async function close() {
  if (server) await new Promise(resolve => server.close(resolve));
  if (client) await client.close();
}
async function request(path, method = 'GET', body, status = 200) {
  const response = await fetch(base + '/api' + path, {
    method, headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const result = response.status === 204 ? null : await response.json();
  assert.equal(response.status, status, JSON.stringify(result));
  return result;
}
before(connect);
after(async () => {
  // Only this test run's uniquely named database is disposable.
  if (db && databaseName.startsWith('travel_planner_test_')) await db.dropDatabase();
  await close();
});

test('complete trip, itinerary and expense CRUD with persistence and correct totals', async () => {
  assert.deepEqual(await request('/trips'), []);
  const trip = await request('/trips', 'POST', tripBody, 201);
  const id = trip._id;
  assert.equal((await request('/trips/' + id)).name, tripBody.name);
  await request('/trips/' + id, 'PUT', { ...tripBody, name: 'Updated Goa trip' });
  const late = await request(`/trips/${id}/activities`, 'POST', { ...activityBody, time: '19:00' }, 201);
  const early = await request(`/trips/${id}/activities`, 'POST', activityBody, 201);
  assert.deepEqual((await request(`/trips/${id}/activities`)).map(a => a.time), ['09:00', '19:00']);
  await request('/activities/' + early._id, 'PUT', { ...activityBody, estimatedCost: 1500 });
  const expense = await request(`/trips/${id}/expenses`, 'POST', expenseBody, 201);
  let totals = await request(`/trips/${id}/summary`);
  assert.equal(totals.totalPlannedCost, 2500);
  assert.equal(totals.actualSpending, 5000);
  assert.equal(totals.remainingBudget, 15000);
  assert.equal(totals.percentageSpent, 25);
  assert.equal(totals.categoryTotals.Accommodation, 5000);
  const saved = await db.collection('expenses').findOne({ _id: new ObjectId(expense._id) });
  assert.ok(saved.tripId instanceof ObjectId);
  assert.equal(saved.tripId.toHexString(), id);

  // Shut down the API and DB connection; then recreate them against the same DB.
  await close();
  await connect();
  assert.equal((await request('/trips/' + id)).name, 'Updated Goa trip');
  assert.equal((await request(`/trips/${id}/activities`)).length, 2);
  assert.equal((await request(`/trips/${id}/expenses`))[0].amount, 5000);
  await request('/expenses/' + expense._id, 'PUT', { ...expenseBody, amount: 22000 });
  totals = await request(`/trips/${id}/summary`);
  assert.equal(totals.remainingBudget, -2000);
  assert.equal(totals.overspentAmount, 2000);
  assert.equal(totals.percentageSpent, 110);
  await request('/activities/' + late._id, 'DELETE', null, 204);
  await request('/expenses/' + expense._id, 'DELETE', null, 204);
  assert.equal((await request(`/trips/${id}/summary`)).actualSpending, 0);
  await request(`/trips/${id}/expenses`, 'POST', expenseBody, 201);
  await request('/trips/' + id, 'DELETE', null, 204);
  assert.equal(await db.collection('activities').countDocuments({ tripId: new ObjectId(id) }), 0);
  assert.equal(await db.collection('expenses').countDocuments({ tripId: new ObjectId(id) }), 0);
  await request('/trips/' + id, 'GET', null, 404);
});

test('invalid dates, numbers and malformed JSON are rejected', async () => {
  for (const change of [
    { name: ' ' }, { destination: {} }, { startDate: '2026-02-30' }, { endDate: '2026-10-31' },
    { endDate: '2028-11-01' }, { budget: -1 }, { budget: '20' }, { budget: 1.234 },
    { travelers: 0 }, { travelers: 1.5 }, { description: [] }
  ]) await request('/trips', 'POST', { ...tripBody, ...change }, 400);
  const response = await fetch(base + '/api/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Malformed/);
  await request('/trips/not-an-id', 'GET', null, 400);
  await request('/trips/' + new ObjectId(), 'GET', null, 404);
  await request('/unknown', 'GET', null, 404);
  const missing = await fetch(base + '/api/trips', { method: 'POST' });
  assert.equal(missing.status, 400);
});

test('parent relationships, trip boundaries and record ownership are enforced', async () => {
  const first = await request('/trips', 'POST', tripBody, 201);
  const second = await request('/trips', 'POST', tripBody, 201);
  await request(`/trips/${new ObjectId()}/activities`, 'POST', activityBody, 404);
  await request(`/trips/${new ObjectId()}/expenses`, 'POST', expenseBody, 404);
  await request(`/trips/${first._id}/activities`, 'POST', { ...activityBody, date: '2026-11-04' }, 400);
  await request(`/trips/${first._id}/activities`, 'POST', { ...activityBody, time: '25:60' }, 400);
  await request(`/trips/${first._id}/expenses`, 'POST', { ...expenseBody, amount: -1 }, 400);
  await request(`/trips/${first._id}/expenses`, 'POST', { ...expenseBody, category: 'Unknown' }, 400);
  const activity = await request(`/trips/${first._id}/activities`, 'POST', activityBody, 201);
  const expense = await request(`/trips/${first._id}/expenses`, 'POST', expenseBody, 201);
  await request(`/activities/${activity._id}`, 'PUT', { ...activityBody, tripId: second._id }, 400);
  await request(`/expenses/${expense._id}`, 'PUT', { ...expenseBody, tripId: second._id }, 400);
  assert.deepEqual(await request(`/trips/${second._id}/expenses`), []);
  assert.equal((await request(`/trips/${second._id}/summary`)).actualSpending, 0);
  await request('/trips/' + first._id, 'PUT', { ...tripBody, startDate: '2026-11-02' }, 409);
  await request('/activities/' + new ObjectId(), 'DELETE', null, 404);
  await request('/expenses/invalid', 'DELETE', null, 400);
  await request('/trips/' + first._id, 'DELETE', null, 204);
  assert.equal((await request('/trips/' + second._id))._id, second._id);
});

test('zero budgets and decimal money do not produce Infinity or double deductions', () => {
  const total = summary({ budget: 0 }, [{ estimatedCost: 25 }], [{ category: 'Food', amount: 0.1 }, { category: 'Food', amount: 0.2 }]);
  assert.equal(total.actualSpending, 0.3);
  assert.equal(total.remainingBudget, -0.3);
  assert.equal(total.totalPlannedCost, 25);
  assert.equal(total.percentageSpent, null);
});

test('a partial cascade failure keeps the trip and permits retry', async () => {
  const trip = await request('/trips', 'POST', tripBody, 201);
  await request(`/trips/${trip._id}/activities`, 'POST', activityBody, 201);
  await request(`/trips/${trip._id}/expenses`, 'POST', expenseBody, 201);
  // Fault injection only: records and all successful steps still use real MongoDB.
  const faultyDb = { collection(name) {
    const collection = db.collection(name);
    if (name === 'expenses') collection.deleteMany = async () => { throw new Error('Simulated interruption'); };
    return collection;
  } };
  const faultServer = createApp(faultyDb).listen(0, '127.0.0.1');
  await new Promise(resolve => faultServer.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${faultServer.address().port}/api/trips/${trip._id}`, { method: 'DELETE' });
    assert.equal(response.status, 503);
    assert.ok(await db.collection('trips').findOne({ _id: new ObjectId(trip._id) }));
    await request('/trips/' + trip._id, 'DELETE', null, 204);
    assert.equal(await db.collection('expenses').countDocuments({ tripId: new ObjectId(trip._id) }), 0);
  } finally { await new Promise(resolve => faultServer.close(resolve)); }
});

test('unavailable MongoDB returns a useful 503 while the interface still loads', async () => {
  const offline = new MongoClient('mongodb://127.0.0.1:1', { serverSelectionTimeoutMS: 250 });
  const offlineServer = createApp(offline.db('travel_planner_test_offline')).listen(0, '127.0.0.1');
  await new Promise(resolve => offlineServer.once('listening', resolve));
  const url = `http://127.0.0.1:${offlineServer.address().port}`;
  try {
    const response = await fetch(url + '/api/trips');
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /Database unavailable/);
    assert.equal((await fetch(url + '/')).status, 200);
  } finally {
    await new Promise(resolve => offlineServer.close(resolve));
    await offline.close();
  }
});

test('pages and browser assets are served', async () => {
  for (const path of ['/', '/trip.html', '/css/style.css', '/js/api.js', '/js/app.js', '/js/trip.js']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).length > 100);
  }
});
