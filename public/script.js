// script.js — Booking form logic

let currentStep = 1;
let allMechanics = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadMechanics();
  setMinDate();
  setupFloatingLabels();

  document.getElementById('bookingForm').addEventListener('submit', handleSubmit);
});

// ── Date min (today) ───────────────────────────────────────
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('appointment_date').min = today;
}

// ── Floating label fix for date input ─────────────────────
function setupFloatingLabels() {
  document.querySelectorAll('.field.floating input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value) {
        input.parentElement.querySelector('label')?.classList.add('active-label');
      } else {
        input.parentElement.querySelector('label')?.classList.remove('active-label');
      }
    });
  });
}

// ── Load mechanics from API ────────────────────────────────
async function loadMechanics() {
  try {
    const res = await fetch('/api/mechanics');
    allMechanics = await res.json();
    renderMechanics();
  } catch {
    document.getElementById('mechanicGrid').innerHTML =
      '<div class="mechanic-loading" style="color:var(--red)">Failed to load mechanics. Is the server running?</div>';
  }
}

const MECH_AVATARS = ['🔧','⚡','🎨','⚙️','🛠️'];

function renderMechanics() {
  const grid = document.getElementById('mechanicGrid');
  grid.innerHTML = allMechanics.map((m, i) => `
    <div class="mechanic-card" data-id="${m._id}" onclick="selectMechanic(this, ${m._id})">
      <div class="mech-avatar">${MECH_AVATARS[i % MECH_AVATARS.length]}</div>
      <div class="mech-name">${m.name}</div>
      <div class="mech-role">${m.speciality || 'Mechanic'}</div>
    </div>
  `).join('');
}

function selectMechanic(card, id) {
  document.querySelectorAll('.mechanic-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('mechanic_id').value = id;
  clearError('mechanic_id');
}

// ── Step navigation ────────────────────────────────────────
function nextStep(from) {
  if (!validateStep(from)) return;
  goToStep(from + 1);
}

function prevStep(from) {
  goToStep(from - 1);
}

function goToStep(n) {
  const oldPage = document.querySelector(`.form-page[data-step="${currentStep}"]`);
  const newPage = document.querySelector(`.form-page[data-step="${n}"]`);
  if (!newPage) return;

  oldPage?.classList.remove('active');
  newPage.classList.add('active');

  // Update step dots
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    dot.classList.remove('active', 'done');
    if (i < n) dot.classList.add('done');
    if (i === n) dot.classList.add('active');
  }

  // Update step lines
  document.querySelectorAll('.step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx < n - 1);
  });

  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Validation ─────────────────────────────────────────────
function validateStep(step) {
  let valid = true;

  if (step === 1) {
    valid &= validateRequired('client_name', 'Name is required');
    valid &= validateRequired('address', 'Address is required');
    valid &= validatePattern('phone', /^(\+88)?01[3-9]\d{8}$/, 'Enter a valid BD number (e.g. 01712345678)');
  }

  if (step === 2) {
    valid &= validatePattern('car_license', /^[A-Z]{3}-\d{4}$/, 'Format must be ABC-1234 (uppercase)');
    valid &= validatePattern('engine_number', /^\d+$/, 'Engine number must contain only digits');
  }

  if (step === 3) {
    valid &= validateRequired('appointment_date', 'Please select a date');
    if (!document.getElementById('mechanic_id').value) {
      showError('mechanic_id', 'Please select a mechanic');
      valid = false;
    }
  }

  return !!valid;
}

function validateRequired(field, msg) {
  const el = document.getElementById(field);
  if (!el.value.trim()) { showError(field, msg); markError(el); return false; }
  clearError(field); clearError(el); return true;
}

function validatePattern(field, pattern, msg) {
  const el = document.getElementById(field);
  if (!pattern.test(el.value.trim())) { showError(field, msg); markError(el); return false; }
  clearError(field); clearError(el); return true;
}

function showError(field, msg) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.textContent = msg;
}

function clearError(fieldOrEl) {
  if (typeof fieldOrEl === 'string') {
    const el = document.getElementById(`err-${fieldOrEl}`);
    if (el) el.textContent = '';
    const input = document.getElementById(fieldOrEl);
    if (input) input.classList.remove('error');
  }
}

function markError(el) { el.classList.add('error'); }

// ── Submit ─────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  if (!validateStep(3)) return;

  const btn = document.getElementById('submitBtn');
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-spinner').style.display = 'inline';
  btn.disabled = true;

  const formData = Object.fromEntries(new FormData(e.target));

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Booking failed.', 'error');
    } else {
      const mechName = allMechanics.find(m => m._id == formData.mechanic_id)?.name || 'your mechanic';
      document.getElementById('bookingForm').style.display = 'none';
      const sc = document.getElementById('successCard');
      sc.style.display = 'block';
      document.getElementById('successMsg').textContent =
        `${formData.client_name}, your appointment on ${formData.appointment_date} with ${mechName} is confirmed!`;
    }
  } catch {
    showToast('Server error. Make sure the server is running.', 'error');
  } finally {
    btn.querySelector('.btn-text').style.display = 'inline';
    btn.querySelector('.btn-spinner').style.display = 'none';
    btn.disabled = false;
  }
}

function resetForm() {
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingForm').style.display = 'block';
  document.getElementById('successCard').style.display = 'none';
  document.querySelectorAll('.mechanic-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('mechanic_id').value = '';
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  goToStep(1);
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === 'success' ? '✓' : '✗'} ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
