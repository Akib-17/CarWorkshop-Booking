// admin.js — Admin dashboard logic

let allAppointments = [];
let filteredAppointments = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAppointments();
});

// ── Load appointments ──────────────────────────────────────
async function loadAppointments() {
  document.getElementById('tableBody').innerHTML =
    '<tr><td colspan="8" class="loading-cell">Loading…</td></tr>';

  try {
    const res = await fetch('/api/appointments');
    allAppointments = await res.json();
    filteredAppointments = [...allAppointments];
    renderStats();
    renderTable(filteredAppointments);
    document.getElementById('lastRefresh').textContent =
      'Last refresh: ' + new Date().toLocaleTimeString();
  } catch {
    document.getElementById('tableBody').innerHTML =
      '<tr><td colspan="8" class="loading-cell" style="color:var(--red)">Failed to load. Is the server running?</td></tr>';
  }
}

// ── Stats ──────────────────────────────────────────────────
function renderStats() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('stat-total').textContent = allAppointments.length;
  document.getElementById('stat-today').textContent =
    allAppointments.filter(a => a.appointment_date === today).length;
  document.getElementById('stat-pending').textContent =
    allAppointments.filter(a => a.status === 'pending').length;
  document.getElementById('stat-done').textContent =
    allAppointments.filter(a => a.status === 'completed').length;
}

// ── Render table ───────────────────────────────────────────
function renderTable(list) {
  if (list.length === 0) {
    document.getElementById('tableBody').innerHTML =
      '<tr><td colspan="8" class="loading-cell">No appointments found.</td></tr>';
    return;
  }

  document.getElementById('tableBody').innerHTML = list.map(a => `
    <tr data-id="${a._id}">
      <td>${escape(a.client_name)}</td>
      <td>${escape(a.phone)}</td>
      <td><code style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">${escape(a.car_license)}</code></td>
      <td><code style="font-family:var(--font-mono);font-size:12px">${escape(a.engine_number)}</code></td>
      <td>${a.appointment_date}</td>
      <td>${a.mechanic?.name || '—'}</td>
      <td><span class="badge badge-${a.status || 'pending'}">${a.status || 'pending'}</span></td>
      <td>
        <button class="btn-action" onclick="openEdit('${a._id}', '${a.appointment_date}', ${a.mechanic_id}, '${a.status}')">✎ Edit</button>
        <button class="btn-action btn-delete" onclick="deleteAppointment('${a._id}', '${escape(a.client_name)}')">✕ Del</button>
      </td>
    </tr>
  `).join('');
}

function escape(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Filter ─────────────────────────────────────────────────
function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;

  filteredAppointments = allAppointments.filter(a => {
    const matchSearch = !q ||
      a.client_name?.toLowerCase().includes(q) ||
      a.car_license?.toLowerCase().includes(q) ||
      a.phone?.includes(q);
    const matchStatus = !status || a.status === status;
    return matchSearch && matchStatus;
  });

  renderTable(filteredAppointments);
}

// ── Edit Modal ─────────────────────────────────────────────
function openEdit(id, date, mechanicId, status) {
  document.getElementById('edit_id').value = id;
  document.getElementById('edit_date').value = date;
  document.getElementById('edit_mechanic').value = mechanicId;
  document.getElementById('edit_status').value = status || 'pending';
  document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Close modal on overlay click
document.getElementById('editModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function saveEdit() {
  const id = document.getElementById('edit_id').value;
  const payload = {
    appointment_date: document.getElementById('edit_date').value,
    mechanic_id:      document.getElementById('edit_mechanic').value,
    status:           document.getElementById('edit_status').value
  };

  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    closeModal();
    showToast('Appointment updated.', 'success');
    loadAppointments();
  } catch (err) {
    showToast(err.message || 'Update failed.', 'error');
  }
}

// ── Delete ─────────────────────────────────────────────────
async function deleteAppointment(id, name) {
  if (!confirm(`Delete appointment for ${name}?`)) return;

  try {
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast('Appointment deleted.', 'success');
    loadAppointments();
  } catch (err) {
    showToast(err.message || 'Delete failed.', 'error');
  }
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
