'use strict';

/* =========================================================
   KASIRNUSA - Kasir Digital UMKM
   Materi Matematika Diskrit yang diterapkan:
   1. Himpunan: kategori produk dibentuk dengan objek Set.
   2. Fungsi: perhitungan subtotal, total, kembalian, dan laba.
   ========================================================= */

const STORAGE_KEYS = {
  products: 'kasirnusa_products_v1',
  transactions: 'kasirnusa_transactions_v1'
};

const seedProducts = [
  { id: 1, name: 'Beras Premium 5 kg', category: 'Sembako', price: 75000, cost: 65000, stock: 30, emoji: '🍚' },
  { id: 2, name: 'Minyak Goreng 1 L', category: 'Sembako', price: 18000, cost: 15000, stock: 40, emoji: '🧴' },
  { id: 3, name: 'Gula Pasir 1 kg', category: 'Sembako', price: 17000, cost: 14000, stock: 45, emoji: '🛍️' },
  { id: 4, name: 'Mi Instan', category: 'Makanan', price: 3500, cost: 2500, stock: 80, emoji: '🍜' },
  { id: 5, name: 'Roti Tawar', category: 'Makanan', price: 16000, cost: 12000, stock: 20, emoji: '🍞' },
  { id: 6, name: 'Air Mineral', category: 'Minuman', price: 6000, cost: 4000, stock: 50, emoji: '💧' },
  { id: 7, name: 'Kopi Sachet', category: 'Minuman', price: 2500, cost: 1800, stock: 100, emoji: '☕' },
  { id: 8, name: 'Teh Botol', category: 'Minuman', price: 5000, cost: 3500, stock: 35, emoji: '🧋' },
  { id: 9, name: 'Sabun Mandi', category: 'Perawatan', price: 5000, cost: 3800, stock: 25, emoji: '🧼' },
  { id: 10, name: 'Deterjen 800 g', category: 'Perawatan', price: 12000, cost: 9000, stock: 18, emoji: '🫧' }
];

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key}:`, error);
    return fallback;
  }
}

const state = {
  products: readStorage(STORAGE_KEYS.products, seedProducts),
  transactions: readStorage(STORAGE_KEYS.transactions, []),
  cart: [],
  activePage: 'dashboard'
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(state.products));
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
  } catch (error) {
    showToast('Data gagal disimpan. Periksa penyimpanan browser.');
    console.error(error);
  }
}

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------------------------
   NAVIGASI HALAMAN
---------------------------- */
const pageTitles = {
  dashboard: 'Dashboard', cashier: 'Kasir', products: 'Produk',
  categories: 'Kategori', transactions: 'Riwayat Transaksi', reports: 'Laporan'
};

function navigateTo(page) {
  if (!pageTitles[page]) return;
  state.activePage = page;
  $$('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  $('#page-title').textContent = pageTitles[page];
  $('#sidebar').classList.remove('open');
  renderAll();
}

$$('.nav-item').forEach(button => button.addEventListener('click', () => navigateTo(button.dataset.page)));
$$('[data-go]').forEach(button => button.addEventListener('click', () => navigateTo(button.dataset.go)));
$('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

/* ---------------------------
   MATERI 1: HIMPUNAN
   Kategori unik dikumpulkan dalam Set.
   Himpunan produk kategori tertentu diperoleh dengan filter.
---------------------------- */
function getCategorySet() {
  return new Set(state.products.map(product => product.category.trim()).filter(Boolean));
}

function getProductsByCategory(category) {
  if (!category || category === 'all') return [...state.products];
  return state.products.filter(product => product.category === category);
}

function renderCategoryOptions() {
  const select = $('#cashier-category');
  const selected = select.value || 'all';
  const categories = [...getCategorySet()].sort((a, b) => a.localeCompare(b, 'id'));
  select.innerHTML = '<option value="all">Semua kategori</option>' +
    categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join('');
  select.value = categories.includes(selected) ? selected : 'all';
}

function renderCategories() {
  const categoryIcons = ['🛒', '🍽️', '🥤', '🧴', '📦', '🧺', '🧁', '🧰'];
  const categories = [...getCategorySet()].sort((a, b) => a.localeCompare(b, 'id'));
  const grid = $('#category-grid');
  if (!categories.length) {
    grid.innerHTML = '<div class="panel"><div class="empty-state"><span>▧</span><strong>Belum ada kategori</strong><small>Kategori muncul saat produk ditambahkan.</small></div></div>';
    return;
  }
  grid.innerHTML = categories.map((category, index) => {
    const members = getProductsByCategory(category); // anggota himpunan kategori
    const totalStock = members.reduce((sum, product) => sum + Number(product.stock), 0);
    return `<article class="category-card">
      <div class="category-card-icon">${categoryIcons[index % categoryIcons.length]}</div>
      <h3>${escapeHTML(category)}</h3>
      <p>${members.length} jenis produk · ${totalStock} unit stok</p>
      <button type="button" data-category-view="${escapeHTML(category)}">Lihat produk →</button>
    </article>`;
  }).join('');
}

$('#category-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-category-view]');
  if (!button) return;
  navigateTo('products');
  $('#product-search').value = button.dataset.categoryView;
  renderProductsTable();
});

/* ---------------------------
   MATERI 2: FUNGSI
   Fungsi-fungsi berikut memetakan input transaksi
   menjadi subtotal, total, kembalian, dan keuntungan.
---------------------------- */
function hitungSubtotal(harga, jumlah) {
  return Number(harga) * Number(jumlah);
}

function hitungTotal(items) {
  return items.reduce((total, item) => total + hitungSubtotal(item.price, item.qty), 0);
}

function hitungKembalian(uangDiterima, total) {
  return Math.max(0, Number(uangDiterima) - Number(total));
}

function hitungKeuntungan(items) {
  return items.reduce((profit, item) => profit + ((Number(item.price) - Number(item.cost)) * Number(item.qty)), 0);
}

/* ---------------------------
   DASHBOARD
---------------------------- */
function renderDashboard() {
  const revenue = state.transactions.reduce((sum, trx) => sum + Number(trx.total), 0);
  const profit = state.transactions.reduce((sum, trx) => sum + Number(trx.profit), 0);
  $('#stat-sales').textContent = rupiah(revenue);
  $('#stat-profit').textContent = rupiah(profit);
  $('#stat-products').textContent = state.products.length;
  $('#stat-transactions').textContent = state.transactions.length;

  const recent = [...state.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  $('#recent-transactions').innerHTML = recent.map(trx => `
    <tr><td><strong>${escapeHTML(trx.id)}</strong></td><td>${formatDate(trx.createdAt)}</td>
    <td><strong>${rupiah(trx.total)}</strong></td><td><span class="status-pill">Selesai</span></td></tr>`).join('');
  $('#recent-empty').classList.toggle('hidden', recent.length > 0);

  const lowStock = state.products.filter(product => Number(product.stock) <= 5).sort((a, b) => a.stock - b.stock);
  $('#low-stock-list').innerHTML = lowStock.map(product => `
    <div class="low-stock-item"><div class="low-stock-product"><span class="product-emoji">${escapeHTML(product.emoji || '📦')}</span>
    <div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.category)}</small></div></div>
    <span class="stock-number">${product.stock} tersisa</span></div>`).join('');
  $('#stock-empty').classList.toggle('hidden', lowStock.length > 0);
}

/* ---------------------------
   PRODUK
---------------------------- */
function renderProductsTable() {
  const keyword = $('#product-search').value.trim().toLowerCase();
  const products = state.products.filter(product =>
    product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword)
  );
  $('#product-count').textContent = `${products.length} produk`;
  $('#products-table').innerHTML = products.map(product => `
    <tr>
      <td><div class="product-cell"><span class="product-emoji">${escapeHTML(product.emoji || '📦')}</span><strong>${escapeHTML(product.name)}</strong></div></td>
      <td>${escapeHTML(product.category)}</td><td><strong>${rupiah(product.price)}</strong></td>
      <td>${rupiah(product.cost)}</td><td class="${product.stock <= 5 ? 'stock-low' : 'stock-good'}">${product.stock} unit</td>
      <td><div class="action-group"><button class="action-btn" data-edit-product="${product.id}">Edit</button><button class="action-btn delete" data-delete-product="${product.id}">Hapus</button></div></td>
    </tr>`).join('');
  $('#products-empty').classList.toggle('hidden', products.length > 0);
}

$('#product-search').addEventListener('input', renderProductsTable);
$('#add-product-button').addEventListener('click', () => openProductForm());
$('#products-table').addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit-product]');
  const deleteButton = event.target.closest('[data-delete-product]');
  if (editButton) openProductForm(Number(editButton.dataset.editProduct));
  if (deleteButton) deleteProduct(Number(deleteButton.dataset.deleteProduct));
});

function openProductForm(productId = null) {
  const product = productId ? state.products.find(item => item.id === productId) : null;
  const title = product ? 'Edit Produk' : 'Tambah Produk Baru';
  const knownCategories = [...getCategorySet()];
  const categoryOptions = [...new Set([...knownCategories, 'Sembako', 'Makanan', 'Minuman', 'Perawatan'])];
  showModal(title, `
    <form id="product-form">
      <div class="form-grid">
        <div class="form-field full"><label for="product-name">Nama produk</label><input id="product-name" name="name" required maxlength="60" placeholder="Contoh: Kopi Susu Botol" value="${escapeHTML(product?.name || '')}"></div>
        <div class="form-field"><label for="product-category-input">Kategori</label><input id="product-category-input" name="category" list="category-options" required maxlength="30" placeholder="Pilih atau ketik kategori" value="${escapeHTML(product?.category || '')}"><datalist id="category-options">${categoryOptions.map(item => `<option value="${escapeHTML(item)}"></option>`).join('')}</datalist></div>
        <div class="form-field"><label for="product-emoji">Ikon produk (emoji)</label><input id="product-emoji" name="emoji" maxlength="4" value="${escapeHTML(product?.emoji || '📦')}"></div>
        <div class="form-field"><label for="product-price">Harga jual (Rp)</label><input id="product-price" name="price" type="number" min="1" step="1" required value="${product?.price ?? ''}"></div>
        <div class="form-field"><label for="product-cost">Harga modal (Rp)</label><input id="product-cost" name="cost" type="number" min="0" step="1" required value="${product?.cost ?? ''}"></div>
        <div class="form-field full"><label for="product-stock">Stok awal</label><input id="product-stock" name="stock" type="number" min="0" step="1" required value="${product?.stock ?? 0}"></div>
      </div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" data-close-modal>Batal</button><button type="submit" class="btn btn-primary">${product ? 'Simpan Perubahan' : 'Simpan Produk'}</button></div>
    </form>`);

  $('#product-form').addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name')).trim();
    const category = String(formData.get('category')).trim();
    const price = Number(formData.get('price'));
    const cost = Number(formData.get('cost'));
    const stock = Number(formData.get('stock'));
    if (!name || !category || !Number.isFinite(price) || price <= 0 || !Number.isFinite(cost) || cost < 0 || !Number.isInteger(stock) || stock < 0) {
      showToast('Periksa kembali data produk.');
      return;
    }
    const productData = { name, category, price, cost, stock, emoji: String(formData.get('emoji')).trim() || '📦' };
    if (product) Object.assign(product, productData);
    else state.products.push({ id: Date.now(), ...productData });
    saveData();
    closeModal();
    renderAll();
    showToast(product ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
  });
}

function deleteProduct(productId) {
  const product = state.products.find(item => item.id === productId);
  if (!product) return;
  if (!confirm(`Hapus produk "${product.name}"?`)) return;
  state.products = state.products.filter(item => item.id !== productId);
  state.cart = state.cart.filter(item => item.productId !== productId);
  saveData();
  renderAll();
  showToast('Produk berhasil dihapus.');
}

/* ---------------------------
   KASIR DAN KERANJANG
---------------------------- */
function renderCashierProducts() {
  renderCategoryOptions();
  const keyword = $('#cashier-search').value.trim().toLowerCase();
  const category = $('#cashier-category').value;
  const products = getProductsByCategory(category).filter(product => product.name.toLowerCase().includes(keyword));
  $('#cashier-products').innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-card-emoji">${escapeHTML(product.emoji || '📦')}</div>
      <h4 title="${escapeHTML(product.name)}">${escapeHTML(product.name)}</h4>
      <p>${escapeHTML(product.category)}</p>
      <div class="product-card-bottom"><strong>${rupiah(product.price)}</strong><button class="add-to-cart" data-add-cart="${product.id}" aria-label="Tambah ${escapeHTML(product.name)}" ${product.stock <= 0 ? 'disabled' : ''}>＋</button></div>
      <div class="stock-hint">Stok: ${product.stock} unit</div>
    </article>`).join('');
  $('#cashier-empty').classList.toggle('hidden', products.length > 0);
}

function addToCart(productId) {
  const product = state.products.find(item => item.id === productId);
  if (!product || product.stock <= 0) return showToast('Stok produk habis.');
  const cartItem = state.cart.find(item => item.productId === productId);
  if (cartItem) {
    if (cartItem.qty >= product.stock) return showToast('Jumlah melebihi stok tersedia.');
    cartItem.qty += 1;
  } else {
    state.cart.push({ productId, qty: 1 });
  }
  renderCart();
}

function changeCartQty(productId, change) {
  const cartItem = state.cart.find(item => item.productId === productId);
  const product = state.products.find(item => item.id === productId);
  if (!cartItem || !product) return;
  const nextQty = cartItem.qty + change;
  if (nextQty <= 0) state.cart = state.cart.filter(item => item.productId !== productId);
  else if (nextQty > product.stock) showToast('Jumlah melebihi stok tersedia.');
  else cartItem.qty = nextQty;
  renderCart();
}

function getCartSnapshot() {
  return state.cart.map(cartItem => {
    const product = state.products.find(item => item.id === cartItem.productId);
    if (!product) return null;
    return { productId: product.id, name: product.name, category: product.category, price: Number(product.price), cost: Number(product.cost), qty: cartItem.qty, emoji: product.emoji };
  }).filter(Boolean);
}

function renderCart() {
  const items = getCartSnapshot();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const total = hitungTotal(items);
  $('#cart-count').textContent = `${totalQty} unit dipilih`;
  $('#cart-items').innerHTML = items.length ? items.map(item => `
    <div class="cart-item"><span class="product-emoji">${escapeHTML(item.emoji || '📦')}</span>
      <div class="cart-item-info"><strong>${escapeHTML(item.name)}</strong><small>${rupiah(item.price)} / unit</small></div>
      <div class="qty-control"><button data-qty-change="-1" data-product-id="${item.productId}" aria-label="Kurangi">−</button><span>${item.qty}</span><button data-qty-change="1" data-product-id="${item.productId}" aria-label="Tambah">+</button></div>
    </div>`).join('') : '<div class="cart-empty"><span>🛒</span><strong>Keranjang masih kosong</strong><small>Pilih produk untuk memulai transaksi.</small></div>';
  $('#cart-subtotal').textContent = rupiah(total);
  $('#cart-total').textContent = rupiah(total);
  updatePaymentChange();
  $('#checkout-button').disabled = items.length === 0;
}

function updatePaymentChange() {
  const total = hitungTotal(getCartSnapshot());
  const payment = Number($('#payment-amount').value) || 0;
  $('#payment-change').textContent = rupiah(hitungKembalian(payment, total));
  $('#checkout-button').disabled = state.cart.length === 0 || payment < total;
}

$('#cashier-search').addEventListener('input', renderCashierProducts);
$('#cashier-category').addEventListener('change', renderCashierProducts);
$('#cashier-products').addEventListener('click', event => {
  const button = event.target.closest('[data-add-cart]');
  if (button) addToCart(Number(button.dataset.addCart));
});
$('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-qty-change]');
  if (button) changeCartQty(Number(button.dataset.productId), Number(button.dataset.qtyChange));
});
$('#payment-amount').addEventListener('input', updatePaymentChange);
$('#clear-cart').addEventListener('click', () => {
  state.cart = [];
  $('#payment-amount').value = '';
  renderCart();
});
$('#checkout-button').addEventListener('click', completeTransaction);

function completeTransaction() {
  const items = getCartSnapshot();
  const total = hitungTotal(items);
  const paid = Number($('#payment-amount').value);
  if (!items.length) return showToast('Keranjang masih kosong.');
  if (!Number.isFinite(paid) || paid < total) return showToast('Uang pembayaran belum mencukupi.');
  for (const item of items) {
    const product = state.products.find(product => product.id === item.productId);
    if (!product || product.stock < item.qty) return showToast(`Stok ${item.name} tidak mencukupi.`);
  }

  const transaction = {
    id: `TRX-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    items,
    total,
    paid,
    change: hitungKembalian(paid, total),
    profit: hitungKeuntungan(items)
  };
  items.forEach(item => {
    const product = state.products.find(product => product.id === item.productId);
    product.stock -= item.qty;
  });
  state.transactions.unshift(transaction);
  state.cart = [];
  $('#payment-amount').value = '';
  saveData();
  renderAll();
  showReceipt(transaction, true);
}

/* ---------------------------
   RIWAYAT TRANSAKSI DAN STRUK
---------------------------- */
function renderTransactions() {
  const keyword = $('#transaction-search').value.trim().toLowerCase();
  const transactions = [...state.transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(trx => trx.id.toLowerCase().includes(keyword));
  $('#transaction-count').textContent = `${transactions.length} transaksi`;
  $('#transactions-table').innerHTML = transactions.map(trx => {
    const totalItems = trx.items.reduce((sum, item) => sum + Number(item.qty), 0);
    return `<tr><td><strong>${escapeHTML(trx.id)}</strong></td><td>${formatDate(trx.createdAt)}</td><td>${totalItems} unit</td><td><strong>${rupiah(trx.total)}</strong></td><td class="stock-good">${rupiah(trx.profit)}</td><td><button class="action-btn" data-view-receipt="${escapeHTML(trx.id)}">Detail</button></td></tr>`;
  }).join('');
  $('#transactions-empty').classList.toggle('hidden', transactions.length > 0);
}

$('#transaction-search').addEventListener('input', renderTransactions);
$('#transactions-table').addEventListener('click', event => {
  const button = event.target.closest('[data-view-receipt]');
  if (!button) return;
  const transaction = state.transactions.find(trx => trx.id === button.dataset.viewReceipt);
  if (transaction) showReceipt(transaction, false);
});

function showReceipt(transaction, justCompleted) {
  const itemsHTML = transaction.items.map(item => `
    <div class="receipt-row"><span>${escapeHTML(item.name)} × ${item.qty}</span><strong>${rupiah(item.price * item.qty)}</strong></div>`).join('');
  showModal(justCompleted ? 'Transaksi Berhasil' : 'Detail Transaksi', `
    <div class="receipt" id="print-receipt">
      <div class="receipt-head"><h3>KasirNusa</h3><p>Terima kasih telah berbelanja</p><p class="receipt-meta">${escapeHTML(transaction.id)}<br>${formatDate(transaction.createdAt)}</p></div>
      ${itemsHTML}
      <div class="receipt-row receipt-total"><span>Total</span><strong>${rupiah(transaction.total)}</strong></div>
      <div class="receipt-row"><span>Bayar</span><strong>${rupiah(transaction.paid)}</strong></div>
      <div class="receipt-row"><span>Kembalian</span><strong>${rupiah(transaction.change)}</strong></div>
    </div>
    <div class="modal-actions"><button class="btn btn-outline" data-close-modal>Tutup</button><button class="btn btn-primary" id="print-receipt-button">Cetak Struk</button></div>`);
  $('#print-receipt-button').addEventListener('click', () => window.print());
}

/* ---------------------------
   LAPORAN DAN EKSPOR CSV
---------------------------- */
function renderReports() {
  const revenue = state.transactions.reduce((sum, trx) => sum + Number(trx.total), 0);
  const profit = state.transactions.reduce((sum, trx) => sum + Number(trx.profit), 0);
  const totalItems = state.transactions.reduce((sum, trx) => sum + trx.items.reduce((itemSum, item) => itemSum + Number(item.qty), 0), 0);
  const average = state.transactions.length ? revenue / state.transactions.length : 0;
  $('#report-revenue').textContent = rupiah(revenue);
  $('#report-profit').textContent = rupiah(profit);
  $('#report-items').textContent = totalItems;
  $('#report-average').textContent = rupiah(average);

  const sold = new Map();
  state.transactions.forEach(trx => trx.items.forEach(item => {
    const current = sold.get(item.productId) || { name: item.name, emoji: item.emoji || '📦', qty: 0, revenue: 0 };
    current.qty += Number(item.qty);
    current.revenue += Number(item.qty) * Number(item.price);
    sold.set(item.productId, current);
  }));
  const bestSellers = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  $('#best-sellers').innerHTML = bestSellers.map(item => `
    <div class="best-seller-row"><span class="product-emoji">${escapeHTML(item.emoji)}</span>
      <div class="best-seller-name"><strong>${escapeHTML(item.name)}</strong><small>${rupiah(item.revenue)} omzet</small></div>
      <span class="best-seller-value">${item.qty} terjual</span></div>`).join('');
  $('#bestseller-empty').classList.toggle('hidden', bestSellers.length > 0);
}

function downloadCSV(filename, rows) {
  if (!rows.length) return showToast('Belum ada data untuk diekspor.');
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

$('#export-transactions').addEventListener('click', () => {
  const rows = [['ID Transaksi', 'Tanggal', 'Jumlah Unit', 'Total', 'Keuntungan', 'Dibayar', 'Kembalian']];
  state.transactions.forEach(trx => rows.push([
    trx.id, formatDate(trx.createdAt), trx.items.reduce((sum, item) => sum + item.qty, 0), trx.total, trx.profit, trx.paid, trx.change
  ]));
  downloadCSV('riwayat-transaksi-kasirnusa.csv', rows);
});

$('#export-report').addEventListener('click', () => {
  const rows = [['ID Transaksi', 'Tanggal', 'Produk', 'Jumlah', 'Harga', 'Subtotal']];
  state.transactions.forEach(trx => trx.items.forEach(item => rows.push([
    trx.id, formatDate(trx.createdAt), item.name, item.qty, item.price, item.qty * item.price
  ])));
  downloadCSV('laporan-kasirnusa.csv', rows);
});

/* ---------------------------
   MODAL UMUM
---------------------------- */
function showModal(title, content) {
  $('#modal-title').textContent = title;
  $('#modal-content').innerHTML = content;
  $('#modal-backdrop').classList.remove('hidden');
}
function closeModal() {
  $('#modal-backdrop').classList.add('hidden');
  $('#modal-content').innerHTML = '';
}
$('#close-modal').addEventListener('click', closeModal);
$('#modal-backdrop').addEventListener('click', event => {
  if (event.target === $('#modal-backdrop')) closeModal();
  if (event.target.closest('[data-close-modal]')) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

/* ---------------------------
   RENDER SEMUA HALAMAN
---------------------------- */
function renderAll() {
  renderDashboard();
  renderProductsTable();
  renderCategories();
  renderCashierProducts();
  renderCart();
  renderTransactions();
  renderReports();
}

function initialise() {
  $('#today-label').textContent = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date());
  renderAll();
}

initialise();
