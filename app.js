/*
  © 2025 ArtsnCrabs / Toya Cramsey
  HOS Load Calculator (PWA Version)
  All rights reserved.

  This software and all included logic are protected by copyright.
  Unauthorized reproduction, modification, or distribution is prohibited.
*/
// app.js — HOS Load Calculator v6.1a baseline

// ---------- Grab elements ----------
const etaEl = document.getElementById('eta');
const ptaEl = document.getElementById('pta');
const driveHrsEl = document.getElementById('driveHrs');
const splitEl = document.getElementById('split');

const calcBtn = document.getElementById('calcBtn');
const resetBtn = document.getElementById('resetBtn');
const helpBtn = document.getElementById('helpBtn');

const ontimePill = document.getElementById('ontimePill');
const projectedArrivalEl = document.getElementById('projectedArrival');
const notesEl = document.getElementById('notes');

const netStatus = document.getElementById('netStatus');
const installLink = document.getElementById('installLink');

// Footer year (backup if inline script didn’t run first)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Helpers ----------
function parseTimeToDate(timeStr) {
  // timeStr: "HH:MM"
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(h, m, 0, 0);
  return d;
}

function addHours(date, hoursFloat) {
  const d = new Date(date);
  const ms = hoursFloat * 60 * 60 * 1000;
  d.setTime(d.getTime() + ms);
  return d;
}

function formatTime(date) {
  if (!date) return '—';
  // 12h clock like 02:35 PM
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function setPill(state, text) {
  ontimePill.textContent = text;
  ontimePill.classList.remove('good', 'bad', 'warn');
  if (state === 'good') ontimePill.classList.add('good');
  if (state === 'bad') ontimePill.classList.add('bad');
  if (state === 'warn') ontimePill.classList.add('warn');
}

// ---------- Core calculation (baseline logic) ----------
function calculate() {
  const eta = parseTimeToDate(etaEl.value);
  const pta = parseTimeToDate(ptaEl.value);
  const driveHrs = parseFloat(driveHrsEl.value || '0');
  const split = splitEl.value; // "none" | "8-2"

  // Basic validation
  if (!eta || !pta || isNaN(driveHrs)) {
    setPill('warn', 'Need inputs');
    projectedArrivalEl.textContent = '—';
    notesEl.textContent = 'Enter ETA, PTA, and drive hours.';
    return;
  }

  // Baseline model:
  // Projected Arrival = PTA + Drive Hours (very simple planning assumption)
  // If 8/2 split is selected, we’ll “credit” 0.5 hr (placeholder baseline).
  const splitCredit = split === '8-2' ? 0.5 : 0;
  const projArrival = addHours(pta, Math.max(0, driveHrs - splitCredit));

  // If PTA happens after ETA (e.g., late start), and projArrival < PTA (shouldn’t happen), guard.
  if (projArrival < pta) {
    setPill('warn', 'Check inputs');
    projectedArrivalEl.textContent = '—';
    notesEl.textContent = 'Projected arrival earlier than PTA — verify values.';
    return;
  }

  projectedArrivalEl.textContent = formatTime(projArrival);

  // Compare to planned ETA
  if (projArrival <= eta) {
    setPill('good', 'On time');
    notesEl.textContent = split === '8-2'
      ? 'On time with 8/2 split credit applied (baseline).'
      : 'On time based on simple planning model.';
  } else {
    setPill('bad', 'Late');
    const diffMin = Math.round((projArrival - eta) / 60000);
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    notesEl.textContent =
      `Arrives about ${hrs}h ${mins}m after planned ETA (baseline model).`;
  }
}

// ---------- Events ----------
calcBtn.addEventListener('click', calculate);

resetBtn.addEventListener('click', () => {
  etaEl.value = '';
  ptaEl.value = '';
  driveHrsEl.value = '';
  splitEl.value = 'none';
  setPill('good', 'On time');
  projectedArrivalEl.textContent = '—';
  notesEl.textContent = '—';
});

helpBtn.addEventListener('click', () => {
  alert(
    [
      'Quick tips:',
      '• ETA = appointment/local target time.',
      '• PTA = when you can start driving.',
      '• Drive hours = safe/legal driving you have left.',
      '• 8/2 split (baseline) gives a small planning credit.',
      '',
      'This is a simple planner. Always follow your ELD, FMCSA rules, and dispatch.'
    ].join('\n')
  );
});

// ---------- Online/offline pill ----------
function updateNetStatus() {
  const online = navigator.onLine;
  netStatus.textContent = online ? 'PWA: online' : 'PWA: offline';
  netStatus.classList.remove('good', 'bad', 'warn');
  netStatus.classList.add(online ? 'good' : 'warn');
}
window.addEventListener('online', updateNetStatus);
window.addEventListener('offline', updateNetStatus);
updateNetStatus();

// ---------- PWA: service worker + install prompt ----------
if ('serviceWorker' in navigator) {
  // You’ll add service-worker.js next
  navigator.serviceWorker
    .register('service-worker.js')
    .catch((err) => console.warn('SW register failed:', err));
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installLink) installLink.hidden = false;
});

if (installLink) {
  installLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installLink.hidden = true;
  });
}

// Optional: Allow Enter to trigger Calculate from any input
[etaEl, ptaEl, driveHrsEl].forEach((el) =>
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
  })
);
