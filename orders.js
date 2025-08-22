// Orders admin utility for local testing
// Reads orders from localStorage and renders a filterable list.

function readOrders() {
  try { return JSON.parse(localStorage.getItem('orders')) || []; } catch (_) { return []; }
}
function writeOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function formatNaira(n) {
  try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n); } catch (_) { return `₦${n}`; }
}

function renderOrders() {
  const listEl = document.getElementById('ordersList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const verified = document.getElementById('verifiedFilter').value;
  const delivery = document.getElementById('deliveryFilter').value;

  let orders = readOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (q) {
    orders = orders.filter(o =>
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.paystack && o.paystack.reference && o.paystack.reference.toLowerCase().includes(q)) ||
      (o.customer && o.customer.email && o.customer.email.toLowerCase().includes(q))
    );
  }
  if (status) orders = orders.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
  if (verified) orders = orders.filter(o => String(o.paystack && o.paystack.verified) === verified);
  if (delivery) orders = orders.filter(o => o.shipping && o.shipping.method === delivery);

  if (orders.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = orders.map(o => {
    const itemsHtml = (o.items || []).map(i => `<div class="items-row"><span>${i.title} × ${i.quantity}</span><span>${formatNaira(i.price * i.quantity)}</span></div>`).join('');
    const statusBadge = `<span class="badge ${o.status === 'paid' ? 'paid' : 'pending'}">${o.status || 'pending'}</span>`;
    const verBadge = `<span class="badge ${o.paystack && o.paystack.verified ? 'verified' : ''}">${o.paystack && o.paystack.verified ? 'verified' : 'unverified'}</span>`;
    const shipLabel = o.shipping && o.shipping.method ? o.shipping.method : 'n/a';
    return `
      <div class="order-card" data-id="${o.id}">
        <div class="order-head">
          <div>
            <div><strong>${o.id}</strong> <span class="order-meta">• ${new Date(o.createdAt).toLocaleString()}</span></div>
            <div class="order-meta">Ref: ${o.paystack && o.paystack.reference ? o.paystack.reference : 'n/a'} • ${o.customer && o.customer.email ? o.customer.email : ''}</div>
          </div>
          <div class="badges">${statusBadge}${verBadge}<span class="badge">${shipLabel}</span></div>
        </div>
        <div class="order-meta" style="margin:0.5rem 0;">Subtotal: ${formatNaira(o.subtotal)} • Shipping: ${formatNaira(o.shipping && o.shipping.amount || 0)} • Discount: -${formatNaira(o.discount && o.discount.amount || 0)} • Total: <strong>${formatNaira(o.total)}</strong></div>
        <details class="items"><summary>Items</summary><div class="items-list">${itemsHtml}</div></details>
        <div class="order-actions" style="margin-top:0.75rem;">
          <button class="btn" data-action="mark-paid" data-ref="${o.paystack && o.paystack.reference ? o.paystack.reference : ''}">Mark Paid</button>
          <button class="btn" data-action="toggle-verified" data-ref="${o.paystack && o.paystack.reference ? o.paystack.reference : ''}">Toggle Verified</button>
          <button class="btn" data-action="delete" data-id="${o.id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function onActionClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const ref = btn.getAttribute('data-ref');
  const id = btn.getAttribute('data-id');
  let orders = readOrders();

  if (action === 'delete' && id) {
    orders = orders.filter(o => o.id !== id);
    writeOrders(orders);
    renderOrders();
    return;
  }
  if ((action === 'mark-paid' || action === 'toggle-verified') && ref) {
    orders = orders.map(o => {
      if (o.paystack && o.paystack.reference === ref) {
        if (action === 'mark-paid') o.status = 'paid';
        if (action === 'toggle-verified') o.paystack.verified = !o.paystack.verified;
      }
      return o;
    });
    writeOrders(orders);
    renderOrders();
  }
}

function exportOrders() {
  const data = readOrders();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importOrders(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      if (!Array.isArray(json)) throw new Error('Invalid orders JSON');
      writeOrders(json);
      renderOrders();
    } catch (err) {
      alert('Failed to import: ' + (err.message || String(err)));
    }
  };
  reader.readAsText(file);
}

window.addEventListener('DOMContentLoaded', () => {
  renderOrders();
  document.getElementById('ordersList').addEventListener('click', onActionClick);
  document.getElementById('refreshBtn').addEventListener('click', renderOrders);
  document.getElementById('exportBtn').addEventListener('click', exportOrders);
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear all local orders?')) { writeOrders([]); renderOrders(); }
  });
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importOrders(file);
  });
  ['searchInput','statusFilter','verifiedFilter','deliveryFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderOrders);
  });
});

