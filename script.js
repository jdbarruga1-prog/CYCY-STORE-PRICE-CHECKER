#   
/* CYCY STORE PRICE CHECKER  
   Uses localStorage for offline persistence.  
   Save as script.js  
*/  
  
(() => {  
  // ---------- Utilities ----------  
  const $ = (sel, root = document) => root.querySelector(sel);  
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));  
  const currency = (v) => {  
    if (isNaN(v) || v === null) v = 0;  
    return (Number(v)).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });  
  };  
  
  // ---------- Storage Keys ----------  
  const KEY_PRODUCTS = 'cycy_products_v1';  
  const KEY_CART = 'cycy_cart_v1';  
  
  // ---------- Sample Products ----------  
  const SAMPLE_PRODUCTS = [  
    { id: genId(), name: 'Coca-Cola 1.5L', category: 'Beverages', unit: '1.5L', price: 85.00, sku: 'CC1500' },  
    { id: genId(), name: 'Coca-Cola 500mL', category: 'Beverages', unit: '500mL', price: 35.00, sku: 'CC500' },  
    { id: genId(), name: 'Pepsi 1.5L', category: 'Beverages', unit: '1.5L', price: 80.00, sku: 'PEP1500' },  
    { id: genId(), name: 'Lucky Me Pancit Canton', category: 'Instant Noodles', unit: '70g', price: 18.00, sku: 'LMPC' },  
    { id: genId(), name: 'Bread (Loaf)', category: 'Bakery', unit: '1pc', price: 50.00, sku: 'BREAD1' },  
    { id: genId(), name: 'Coffee (Instant)', category: 'Beverages', unit: '20g', price: 50.00, sku: 'COF20' }  
  ];  
  
  // ---------- App State ----------  
  let products = loadProducts();  
  let cart = loadCart();  
  
  // ---------- DOM Elements ----------  
  const navBtns = $$('.nav-btn');  
  const views = $$('.view');  
  const searchInput = $('#searchInput');  
  const resultsEl = $('#results');  
  
  const productForm = $('#productForm');  
  const prodName = $('#prodName');  
  const prodCategory = $('#prodCategory');  
  const prodUnit = $('#prodUnit');  
  const prodPrice = $('#prodPrice');  
  const prodSKU = $('#prodSKU');  
  const editId = $('#editId');  
  const addProductBtn = $('#addProductBtn');  
  const updateProductBtn = $('#updateProductBtn');  
  const cancelEditBtn = $('#cancelEditBtn');  
  const productBody = $('#productBody');  
  const manageSearch = $('#manageSearch');  
  
  const cartBody = $('#cartBody');  
  const subtotalText = $('#subtotalText');  
  const totalText = $('#totalText');  
  const discountInput = $('#discountInput');  
  const cashInput = $('#cashInput');  
  const changeText = $('#changeText');  
  const completeSaleBtn = $('#completeSaleBtn');  
  const clearCartBtn = $('#clearCartBtn');  
  
  const exportBtn = $('#exportBtn');  
  const importFile = $('#importFile');  
  const clearDbBtn = $('#clearDbBtn');  
  
  // ---------- Initialization ----------  
  init();  
  
  function init() {  
    // If no products exist, seed sample products  
    if (!localStorage.getItem(KEY_PRODUCTS)) {  
      products = SAMPLE_PRODUCTS.slice();  
      saveProducts();  
    }  
  
    // Render initial UI  
    renderResults();  
    renderProductsTable();  
    renderCart();  
    attachEvents();  
  }  
  
  // ---------- ID generator ----------  
  function genId() {  
    return 'p_' + Math.random().toString(36).slice(2, 9);  
  }  
  
  // ---------- Storage functions ----------  
  function loadProducts() {  
    try {  
      const raw = localStorage.getItem(KEY_PRODUCTS);  
      return raw ? JSON.parse(raw) : [];  
    } catch (e) {  
      console.error('Failed to load products', e);  
      return [];  
    }  
  }  
  function saveProducts() {  
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));  
  }  
  
  function loadCart() {  
    try {  
      const raw = localStorage.getItem(KEY_CART);  
      return raw ? JSON.parse(raw) : [];  
    } catch (e) {  
      console.error('Failed to load cart', e);  
      return [];  
    }  
  }  
  function saveCart() {  
    localStorage.setItem(KEY_CART, JSON.stringify(cart));  
  }  
  
  // ---------- Navigation ----------  
  navBtns.forEach(btn => {  
    btn.addEventListener('click', () => {  
      navBtns.forEach(b => b.classList.remove('active'));  
      btn.classList.add('active');  
      const view = btn.dataset.view;  
      views.forEach(v => v.classList.add('hidden'));  
      $(`#${view}`).classList.remove('hidden');  
      // focus search when switching to price-checker  
      if (view === 'price-checker') setTimeout(()=>searchInput.focus(), 120);  
    });  
  });  
  
  // ---------- Events ----------  
  function attachEvents() {  
    // Search as you type  
    searchInput.addEventListener('input', () => renderResults(searchInput.value));  
    manageSearch.addEventListener('input', () => renderProductsTable(manageSearch.value));  
  
    // Add product  
    addProductBtn.addEventListener('click', onAddProduct);  
    updateProductBtn.addEventListener('click', onUpdateProduct);  
    cancelEditBtn.addEventListener('click', cancelEdit);  
  
    // Cart actions  
    discountInput.addEventListener('input', updateTotals);  
    cashInput.addEventListener('input', updateTotals);  
    completeSaleBtn.addEventListener('click', completeSale);  
    clearCartBtn.addEventListener('click', clearCart);  
  
    // Backup / Restore  
    exportBtn.addEventListener('click', exportProducts);  
    importFile.addEventListener('change', importProducts);  
    clearDbBtn.addEventListener('click', clearDatabase);  
  
    // Keyboard: Enter on search adds first result to cart  
    searchInput.addEventListener('keydown', (e) => {  
      if (e.key === 'Enter') {  
        const q = searchInput.value.trim();  
        const matches = findProducts(q);  
        if (matches.length) addToCart(matches[0].id);  
      }  
    });  
  }  
  
  // ---------- Product Search ----------  
  function findProducts(query) {  
    if (!query) return products.slice(0, 50);  
    const q = query.trim().toLowerCase();  
    return products.filter(p => {  
      return (p.name || '').toLowerCase().includes(q) ||  
             (p.category || '').toLowerCase().includes(q) ||  
             (p.unit || '').toLowerCase().includes(q) ||  
             (p.sku || '').toLowerCase().includes(q);  
    });  
  }  
  
  function renderResults(query = '') {  
    const list = findProducts(query);  
    resultsEl.innerHTML = '';  
    if (!list.length) {  
      resultsEl.innerHTML = `<div class="card"><div class="prod-meta">No products found.</div></div>`;  
      return;  
    }  
    list.forEach(p => {  
      const item = document.createElement('div');  
      item.className = 'result-item';  
      item.innerHTML = `  
        <div class="result-left">  
          <div>  
            <div class="prod-name">${escapeHtml(p.name)}</div>  
            <div class="prod-meta">${escapeHtml(p.category || '')} ${p.unit ? 'â¢ ' + escapeHtml(p.unit) : ''}</div>  
          </div>  
        </div>  
        <div style="display:flex;gap:10px;align-items:center">  
          <div class="price">${currency(p.price)}</div>  
          <button class="btn primary btn-add" data-id="${p.id}">Add to Cart</button>  
        </div>  
      `;  
      resultsEl.appendChild(item);  
    });  
  
    // attach add buttons  
    $$('.btn-add', resultsEl).forEach(b => {  
      b.addEventListener('click', () => addToCart(b.dataset.id));  
    });  
  }  
  
  // ---------- Manage Products UI ----------  
  function renderProductsTable(filter = '') {  
    const list = filter ? findProducts(filter) : products.slice().sort((a,b)=>a.name.localeCompare(b.name));  
    productBody.innerHTML = '';  
    if (!list.length) {  
      productBody.innerHTML = `<tr><td colspan="6" style="color:var(--muted)">No products</td></tr>`;  
      return;  
    }  
    list.forEach(p => {  
      const tr = document.createElement('tr');  
      tr.innerHTML = `  
        <td>${escapeHtml(p.name)}</td>  
        <td>${escapeHtml(p.category || '')}</td>  
        <td>${escapeHtml(p.unit || '')}</td>  
        <td>${currency(p.price)}</td>  
        <td>${escapeHtml(p.sku || '')}</td>  
        <td>  
          <button class="btn small edit" data-id="${p.id}">Edit</button>  
          <button class="btn small" data-id="${p.id}" data-action="delete">Delete</button>  
        </td>  
      `;  
      productBody.appendChild(tr);  
    });  
  
    // attach edit/delete  
    $$('.edit', productBody).forEach(b => b.addEventListener('click', () => startEdit(b.dataset.id)));  
    $$('button[data-action="delete"]', productBody).forEach(b => b.addEventListener('click', () => {  
      const id = b.dataset.id;  
      if (confirm('Delete this product?')) {  
        products = products.filter(x => x.id !== id);  
        saveProducts();  
        renderProductsTable();  
        renderResults(searchInput.value);  
      }  
    }));  
  }  
  
  function onAddProduct() {  
    const name = prodName.value.trim();  
    const price = parseFloat(prodPrice.value);  
    if (!name || isNaN(price)) {  
      alert('Please enter product name and valid price.');  
      return;  
    }  
    const newProd = {  
      id: genId(),  
      name,  
      category: prodCategory.value.trim(),  
      unit: prodUnit.value.trim(),  
      price: Number(price),  
      sku: prodSKU.value.trim()  
    };  
    products.push(newProd);  
    saveProducts();  
    clearProductForm();  
    renderProductsTable();  
    renderResults(searchInput.value);  
    alert('Product added.');  
  }  
  
  function startEdit(id) {  
    const p = products.find(x => x.id === id);  
    if (!p) return;  
    editId.value = p.id;  
    prodName.value = p.name;  
    prodCategory.value = p.category || '';  
    prodUnit.value = p.unit || '';  
    prodPrice.value = p.price;  
    prodSKU.value = p.sku || '';  
    addProductBtn.classList.add('hidden');  
    updateProductBtn.classList.remove('hidden');  
    cancelEditBtn.classList.remove('hidden');  
    // switch to manage view if not already  
    document.querySelector('.nav-btn[data-view="manage"]').click();  
  }  
  
  function onUpdateProduct() {  
    const id = editId.value;  
    const p = products.find(x => x.id === id);  
    if (!p) return;  
    const name = prodName.value.trim();  
    const price = parseFloat(prodPrice.value);  
    if (!name || isNaN(price)) {  
      alert('Please enter product name and valid price.');  
      return;  
    }  
    p.name = name;  
    p.category = prodCategory.value.trim();  
    p.unit = prodUnit.value.trim();  
    p.price = Number(price);  
    p.sku = prodSKU.value.trim();  
    saveProducts();  
    clearProductForm();  
    renderProductsTable();  
    renderResults(searchInput.value);  
    alert('Product updated.');  
  }  
  
  function cancelEdit() {  
    clearProductForm();  
  }  
  
  function clearProductForm() {  
    editId.value = '';  
    prodName.value = '';  
    prodCategory.value = '';  
    prodUnit.value = '';  
    prodPrice.value = '';  
    prodSKU.value = '';  
    addProductBtn.classList.remove('hidden');  
    updateProductBtn.classList.add('hidden');  
    cancelEditBtn.classList.add('hidden');  
  }  
  
  // ---------- Cart functions ----------  
  function addToCart(productId, qty = 1) {  
    const p = products.find(x => x.id === productId);  
    if (!p) {  
      alert('Product not found.');  
      return;  
    }  
    const existing = cart.find(i => i.id === productId);  
    if (existing) {  
      existing.qty = Number(existing.qty) + Number(qty);  
    } else {  
      cart.push({ id: p.id, name: p.name, price: Number(p.price), qty: Number(qty) });  
    }  
    saveCart();  
    renderCart();  
    // switch to cart view  
    document.querySelector('.nav-btn[data-view="cart"]').click();  
  }  
  
  function renderCart() {  
    cartBody.innerHTML = '';  
    if (!cart.length) {  
      cartBody.innerHTML = `<tr><td colspan="5" style="color:var(--muted)">Cart is empty</td></tr>`;  
      updateTotals();  
      return;  
    }  
    cart.forEach(item => {  
      const tr = document.createElement('tr');  
      tr.innerHTML = `  
        <td>${escapeHtml(item.name)}</td>  
        <td>${currency(item.price)}</td>  
        <td>  
          <div style="display:flex;gap:6px;align-items:center">  
            <button class="btn small dec" data-id="${item.id}">-</button>  
            <input class="qty-input" data-id="${item.id}" type="number" min="1" value="${item.qty}" style="width:60px;padding:6px;border-radius:6px;border:1px solid var(--border)" />  
            <button class="btn small inc" data-id="${item.id}">+</button>  
          </div>  
        </td>  
        <td>${currency(item.price * item.qty)}</td>  
        <td><button class="btn small remove" data-id="${item.id}">Remove</button></td>  
      `;  
      cartBody.appendChild(tr);  
    });  
  
    // attach cart controls  
    $$('.inc', cartBody).forEach(b => b.addEventListener('click', () => {  
      const id = b.dataset.id;  
      const it = cart.find(x => x.id === id);  
      if (it) { it.qty = Number(it.qty) + 1; saveCart(); renderCart(); }  
    }));  
    $$('.dec', cartBody).forEach(b => b.addEventListener('click', () => {  
      const id = b.dataset.id;  
      const it = cart.find(x => x.id === id);  
      if (it) {  
        it.qty = Number(it.qty) - 1;  
        if (it.qty < 1) cart = cart.filter(x => x.id !== id);  
        saveCart(); renderCart();  
      }  
    }));  
    $$('.remove', cartBody).forEach(b => b.addEventListener('click', () => {  
      const id = b.dataset.id;  
      cart = cart.filter(x => x.id !== id);  
      saveCart(); renderCart();  
    }));  
    $$('.qty-input', cartBody).forEach(inp => {  
      inp.addEventListener('change', () => {  
        const id = inp.dataset.id;  
        let val = parseInt(inp.value) || 1;  
        if (val < 1) val = 1;  
        const it = cart.find(x => x.id === id);  
        if (it) { it.qty = val; saveCart(); renderCart(); }  
      });  
    });  
  
    updateTotals();  
  }  
  
  function updateTotals() {  
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);  
    subtotalText.textContent = currency(subtotal);  
    const discount = Math.max(0, parseFloat(discountInput.value) || 0);  
    const total = Math.max(0, subtotal - discount);  
    totalText.textContent = currency(total);  
    const cash = Math.max(0, parseFloat(cashInput.value) || 0);  
    const change = Math.max(0, cash - total);  
    changeText.textContent = currency(change);  
  }  
  
  function clearCart() {  
    if (!cart.length) return;  
    if (!confirm('Clear the cart?')) return;  
    cart = [];  
    saveCart();  
    renderCart();  
  }  
  
  function completeSale() {  
    if (!cart.length) { alert('Cart is empty.'); return; }  
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);  
    const discount = Math.max(0, parseFloat(discountInput.value) || 0);  
    const total = Math.max(0, subtotal - discount);  
    const cash = Math.max(0, parseFloat(cashInput.value) || 0);  
    if (cash < total) {  
      if (!confirm('Cash received is less than total. Proceed anyway?')) return;  
    }  
  
    const change = Math.max(0, cash - total);  
    // Generate receipt and print  
    printReceipt({ cart: cart.slice(), subtotal, discount, total, cash, change });  
    // After sale: clear cart and reset inputs  
    cart = [];  
    saveCart();  
    discountInput.value = 0;  
    cashInput.value = 0;  
    renderCart();  
    alert('Sale completed.');  
  }  
  
  // ---------- Receipt ----------  
  function printReceipt({ cart, subtotal, discount, total, cash, change }) {  
    const now = new Date();  
    const lines = cart.map(i => {  
      return { name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty };  
    });  
  
    // Build printable HTML  
    const html = `  
      <html>  
      <head>  
        <meta charset="utf-8" />  
        <title>Receipt - CYCY STORE</title>  
        <style>  
          body{font-family:Arial, Helvetica, sans-serif;padding:12px;color:#111}  
          h2{text-align:center;margin:0 0 6px}  
          .muted{color:#666;font-size:13px;text-align:center;margin-bottom:8px}  
          table{width:100%;border-collapse:collapse;margin-top:8px}  
          td,th{padding:6px 0;text-align:left;font-size:13px}  
          .right{text-align:right}  
          .totals{margin-top:8px;border-top:1px dashed #ccc;padding-top:8px}  
        </style>  
      </head>  
      <body>  
        <h2>CYCY STORE</h2>  
        <div class="muted">${now.toLocaleString()}</div>  
        <table>  
          <thead>  
            <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Subtotal</th></tr>  
          </thead>  
          <tbody>  
            ${lines.map(l => `<tr><td>${escapeHtml(l.name)}</td><td class="right">${l.qty}</td><td class="right">${currency(l.price)}</td><td class="right">${currency(l.subtotal)}</td></tr>`).join('')}  
          </tbody>  
        </table>  
        <div class="totals">  
          <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${currency(subtotal)}</div></div>  
          <div style="display:flex;justify-content:space-between"><div>Discount</div><div>${currency(discount)}</div></div>  
          <div style="display:flex;justify-content:space-between;font-weight:700"><div>Total</div><div>${currency(total)}</div></div>  
          <div style="display:flex;justify-content:space-between"><div>Cash</div><div>${currency(cash)}</div></div>  
          <div style="display:flex;justify-content:space-between"><div>Change</div><div>${currency(change)}</div></div>  
        </div>  
        <div style="text-align:center;margin-top:12px;font-size:13px;color:#666">Thank you for your purchase.</div>  
      </body>  
      </html>  
    `;  
    const w = window.open('', '_blank', 'width=400,height=600');  
    if (!w) {  
      alert('Popup blocked. Please allow popups to print receipt.');  
      return;  
    }  
    w.document.open();  
    w.document.write(html);  
    w.document.close();  
    setTimeout(() => { w.print(); }, 400);  
  }  
  
  // ---------- Backup / Restore ----------  
  function exportProducts() {  
    const data = JSON.stringify(products, null, 2);  
    const blob = new Blob([data], { type: 'application/json' });  
    const url = URL.createObjectURL(blob);  
    const a = document.createElement('a');  
    a.href = url;  
    a.download = `cycy_products_${new Date().toISOString().slice(0,10)}.json`;  
    document.body.appendChild(a);  
    a.click();  
    a.remove();  
    URL.revokeObjectURL(url);  
  }  
  
  function importProducts(e) {  
    const file = e.target.files[0];  
    if (!file) return;  
    const reader = new FileReader();  
    reader.onload = function(ev) {  
      try {  
        const data = JSON.parse(ev.target.result);  
        if (!Array.isArray(data)) throw new Error('Invalid file format');  
        if (!confirm('Importing will replace your current product database. Continue?')) return;  
        // Ensure each product has an id  
        const imported = data.map(p => ({  
          id: p.id || genId(),  
          name: p.name || '',  
          category: p.category || '',  
          unit: p.unit || '',  
          price: Number(p.price) || 0,  
          sku: p.sku || ''  
        }));  
        products = imported;  
        saveProducts();  
        renderProductsTable();  
        renderResults(searchInput.value);  
        alert('Products imported.');  
      } catch (err) {  
        alert('Failed to import: ' + err.message);  
      } finally {  
        importFile.value = '';  
      }  
    };  
    reader.readAsText(file);  
  }  
  
  function clearDatabase() {  
    if (!confirm('This will permanently delete all products. Are you sure?')) return;  
    products = [];  
    saveProducts();  
    renderProductsTable();  
    renderResults();  
    alert('Product database cleared.');  
  }  
  
  // ---------- Helpers ----------  
  function escapeHtml(s) {  
    if (!s && s !== 0) return '';  
    return String(s).replace(/[&<>"']/g, function(m) {  
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];  
    });  
  }  
  
  // Expose addToCart for keyboard enter  
  window.addToCart = addToCart;  
  
})();  
