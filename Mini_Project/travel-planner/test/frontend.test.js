const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const { MongoClient } = require('mongodb');
const { createApp } = require('../app');

// DOM tests run real page scripts and call a real API backed by a temporary DB.
// jsdom cannot verify CSS layout, screenshots or native dialog focus behavior.
async function waitFor(check) {
  for (let attempt = 0; attempt < 300; attempt++) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('UI did not reach the expected state.');
}
function page(filename, base, query = '') {
  const directory = path.join(__dirname, '..', 'public');
  const dom = new JSDOM(fs.readFileSync(path.join(directory, filename), 'utf8'), {
    url: base + '/' + filename + query, runScripts: 'outside-only'
  });
  const win = dom.window;
  win.fetch = (url, options) => fetch(base + url, options);
  win.AbortSignal = AbortSignal;
  win.confirm = () => true;
  win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  win.HTMLDialogElement.prototype.close = function () { this.open = false; };
  for (const file of ['api.js', filename === 'index.html' ? 'app.js' : 'trip.js']) {
    vm.runInContext(fs.readFileSync(path.join(directory, 'js', file), 'utf8'), dom.getInternalVMContext(), { filename: file });
  }
  return dom;
}
function submit(win, selector, fields) {
  const form = win.document.querySelector(selector);
  for (const [name, value] of Object.entries(fields)) form.elements.namedItem(name).value = value;
  form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
}
test('frontend forms save, edit, render, filter, refresh and delete real records', async () => {
  const client = new MongoClient(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 1500 });
  const databaseName = `travel_planner_test_ui_${process.pid}_${Date.now()}`;
  await client.connect();
  const db = client.db(databaseName);
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const pages = [];
  try {
    const dashboard = page('index.html', base); pages.push(dashboard);
    const win = dashboard.window, doc = win.document;
    await waitFor(() => doc.querySelector('#trip-count').textContent === '0');
    doc.querySelector('#create-trip').click();
    submit(win, '#trip-form', { name: '<img src=x onerror=alert(1)> Goa', destination: 'Goa', startDate: '2026-11-01', endDate: '2026-11-03', travelers: 5, budget: 20000 });
    await waitFor(() => doc.querySelector('#trip-count').textContent === '1');
    assert.equal(doc.querySelector('.trip-card img'), null, 'User input is rendered as text, not HTML');
    const trip = await db.collection('trips').findOne();
    const details = page('trip.html', base, '?id=' + trip._id); pages.push(details);
    const dw = details.window, dd = dw.document;
    await waitFor(() => !dd.querySelector('#trip-content').hidden);
    assert.equal(dd.querySelectorAll('.day-card').length, 3);
    dd.querySelector('#add-activity').click();
    submit(dw, '#record-form', { title: 'Beach', date: '2026-11-01', time: '10:00', location: 'Baga', estimatedCost: 1000 });
    await waitFor(() => dd.querySelectorAll('.activity').length === 1);
    dd.querySelector('#add-expense').click();
    submit(dw, '#record-form', { title: 'Hotel', category: 'Accommodation', amount: 22000, date: '2026-10-20' });
    await waitFor(() => dd.querySelectorAll('.expense-row').length === 1);
    assert.equal(dd.querySelector('#remaining-label').textContent, 'Overspent by');
    assert.match(dd.querySelector('#remaining').textContent, /2,000/);
    assert.match(dd.querySelector('#planned').textContent, /1,000/);
    assert.equal(dd.querySelector('#progress-fill').style.width, '100%');
    dd.querySelector('#category-filter').value = 'Food';
    dd.querySelector('#category-filter').dispatchEvent(new dw.Event('change'));
    assert.equal(dd.querySelectorAll('.expense-row').length, 0);
    assert.match(dd.querySelector('#category-totals').textContent, /22,000/);
    dd.querySelector('#category-filter').value = '';
    dd.querySelector('#category-filter').dispatchEvent(new dw.Event('change'));
    dd.querySelector('[data-type="expenses"][data-action="edit"]').click();
    submit(dw, '#record-form', { amount: 5000 });
    await waitFor(() => dd.querySelector('#remaining-label').textContent === 'Remaining budget');
    assert.match(dd.querySelector('#remaining').textContent, /15,000/);
    dd.querySelector('[data-type="activities"][data-action="edit"]').click();
    submit(dw, '#record-form', { title: 'Sunset walk', time: '18:00' });
    await waitFor(() => dd.querySelector('.activity .record-title').textContent === 'Sunset walk');
    const refreshed = page('trip.html', base, '?id=' + trip._id); pages.push(refreshed);
    await waitFor(() => !refreshed.window.document.querySelector('#trip-content').hidden);
    assert.equal(refreshed.window.document.querySelectorAll('.expense-row').length, 1);
    dd.querySelector('[data-type="activities"][data-action="delete"]').click();
    await waitFor(() => dd.querySelectorAll('.activity').length === 0);
    dd.querySelector('[data-type="expenses"][data-action="delete"]').click();
    await waitFor(() => dd.querySelectorAll('.expense-row').length === 0);
    doc.querySelector('[data-action="edit"]').click();
    submit(win, '#trip-form', { name: 'Edited trip' });
    await waitFor(() => doc.querySelector('.trip-card h3').textContent === 'Edited trip');
    doc.querySelector('[data-action="delete"]').click();
    await waitFor(() => doc.querySelector('#trip-count').textContent === '0');
  } finally {
    for (const dom of pages) dom.window.close();
    await db.dropDatabase();
    await new Promise(resolve => server.close(resolve));
    await client.close();
  }
});
