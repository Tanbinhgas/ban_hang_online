// ── THEME ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  if ((localStorage.getItem("theme") || "dark") === "light")
    body.classList.add("light-mode");

  function updateToggleIcon() {
    if (!themeToggle) return;
    const light = body.classList.contains("light-mode");
    themeToggle.innerHTML = light ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    themeToggle.title = light ? "Chế độ tối" : "Chế độ sáng";
  }
  updateToggleIcon();

  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    updateToggleIcon();
  });

  // ── SEARCH ─────────────────────────────────────────────────
  const homeSearchForm  = document.getElementById("homeSearchForm");
  const homeSearchInput = document.getElementById("searchInputHome");

  homeSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = homeSearchInput?.value.trim() || "";
    if (window.location.pathname.endsWith("products.html")) {
      const main = document.getElementById("searchInputMain");
      if (main) { main.value = q; main.dispatchEvent(new Event("input")); }
      return;
    }
    window.location.href = q ? `products.html?q=${encodeURIComponent(q)}` : "products.html";
  });

  createCartModal();
  updateCartCount();
  updateWarehouseLink();
  document.getElementById("cartBtn")?.addEventListener("click", (e) => {
    e.preventDefault(); showCartModal();
  });
});

// ── WAREHOUSE LINK ─────────────────────────────────────────────
function updateWarehouseLink() {
  const link = document.getElementById("warehouseLink");
  if (!link) return;
  const nav = link.closest(".nav-item");
  if (!nav) return;
  const u = JSON.parse(localStorage.getItem("currentUser"));
  nav.classList.toggle("d-none", !(u && u.role === "admin"));
}

// ── PRICE FORMAT ───────────────────────────────────────────────
function formatPrice(v) {
  return Number(v).toLocaleString("vi-VN") + "đ";
}

// ── CART HELPERS ───────────────────────────────────────────────
function getCart()       { return JSON.parse(localStorage.getItem("cart")) || []; }
function saveCart(cart)  { localStorage.setItem("cart", JSON.stringify(cart)); }

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = getCart().reduce((s, i) => s + i.quantity, 0);
}

function createCartModal() {
  if (document.getElementById("cartModal")) return;
  const m = document.createElement("div");
  m.className = "modal fade"; m.id = "cartModal"; m.tabIndex = -1;
  m.setAttribute("aria-hidden", "true");
  m.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-shopping-cart me-2" style="color:var(--red)"></i>Giỏ Hàng</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="cartModalBody"></div>
        <div class="modal-footer d-flex justify-content-between align-items-center">
          <span id="cartTotalDisplay" class="fw-bold" style="font-family:var(--font-display);color:var(--red)"></span>
          <div>
            <button class="btn btn-secondary me-2" data-bs-dismiss="modal">Tiếp tục mua</button>
            <button class="btn btn-danger" onclick="goToCheckout()">
              <i class="fas fa-bolt me-1"></i>Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function showCartModal() {
  const cart = getCart();
  const body = document.getElementById("cartModalBody");
  const totalEl = document.getElementById("cartTotalDisplay");
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = '<p class="text-muted text-center py-5"><i class="fas fa-shopping-cart fa-2x mb-3 d-block" style="color:var(--text-muted)"></i>Giỏ hàng đang trống</p>';
    if (totalEl) totalEl.textContent = "";
  } else {
    let total = 0;
    body.innerHTML = cart.map((item) => {
      total += item.price * item.quantity;
      return `<div class="d-flex align-items-center gap-3 py-2 border-bottom" style="border-color:var(--border)!important">
        <img src="${item.image}" style="width:60px;height:60px;object-fit:contain;background:#0d0d14;border-radius:4px;border:1px solid var(--border)">
        <div class="flex-grow-1">
          <div style="font-family:var(--font-ui);font-weight:600;color:var(--text)">${item.title}</div>
          <div style="font-family:var(--font-display);color:var(--red);font-size:.85rem">${formatPrice(item.price)}</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-secondary px-2 py-0" onclick="changeCartQty('${item.id}',-1)">-</button>
          <span style="font-family:var(--font-display);min-width:20px;text-align:center">${item.quantity}</span>
          <button class="btn btn-sm btn-secondary px-2 py-0" onclick="changeCartQty('${item.id}',1)">+</button>
        </div>
        <button class="btn btn-sm" style="color:var(--red);background:none;border:none" onclick="removeFromCart('${item.id}')"><i class="fas fa-times"></i></button>
      </div>`;
    }).join("");
    if (totalEl) totalEl.textContent = "Tổng: " + formatPrice(total);
  }

  const el = document.getElementById("cartModal");
  if (el && window.bootstrap) bootstrap.Modal.getOrCreateInstance(el).show();
}

function changeCartQty(id, delta) {
  const cart  = getCart();
  const gears = JSON.parse(localStorage.getItem("gears")) || [];
  const idx   = cart.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const max = gears.find((g) => g.id === id)?.quantity ?? 99;
  cart[idx].quantity = Math.max(1, Math.min(cart[idx].quantity + delta, max));
  saveCart(cart); updateCartCount(); showCartModal();
}

function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
  updateCartCount(); showCartModal();
}

function goToCheckout() {
  const el = document.getElementById("cartModal");
  if (el && window.bootstrap) bootstrap.Modal.getInstance(el)?.hide();
  window.location.href = "order.html?checkout=1";
}
