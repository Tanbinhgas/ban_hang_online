document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "dark";

  if (savedTheme === "light") {
    body.classList.add("light-mode");
  } else {
    body.classList.remove("light-mode");
  }

  function updateToggleIcon() {
    if (!themeToggle) return;
    const isLight = body.classList.contains("light-mode");
    themeToggle.innerHTML = isLight
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
    themeToggle.title = isLight ? "Chế độ tối" : "Chế độ sáng";
  }

  updateToggleIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      const isLight = body.classList.contains("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateToggleIcon();
    });
  }

  const homeSearchForm = document.getElementById("homeSearchForm");
  const homeSearchInput = document.getElementById("searchInputHome");

  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = homeSearchInput?.value.trim() || "";
      if (window.location.pathname.endsWith("products.html")) {
        const mainSearch = document.getElementById("searchInputMain");
        if (mainSearch) {
          mainSearch.value = query;
          mainSearch.dispatchEvent(new Event("input"));
        }
        return;
      }
      const targetUrl = query
        ? `products.html?q=${encodeURIComponent(query)}`
        : "products.html";
      window.location.href = targetUrl;
    });
  }

  createCartModal();
  updateCartCount();
  updateWarehouseLink();

  document.getElementById("cartBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showCartModal();
  });
});

function updateWarehouseLink() {
  const warehouseLink = document.getElementById("warehouseLink");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!warehouseLink) return;
  const navItem = warehouseLink.closest(".nav-item");
  if (!navItem) return;
  if (currentUser && currentUser.role === "admin") {
    navItem.classList.remove("d-none");
  } else {
    navItem.classList.add("d-none");
  }
}

function formatPrice(value) {
  return Number(value).toLocaleString("vi-VN") + "đ";
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function createCartModal() {
  if (document.getElementById("cartModal")) return;

  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "cartModal";
  modal.tabIndex = -1;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-shopping-cart me-2" style="color:var(--red)"></i>Giỏ Hàng</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="cartModalBody">
          <p class="text-muted text-center py-4">Giỏ hàng trống</p>
        </div>
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
  document.body.appendChild(modal);
}

function showCartModal() {
  const cart = getCart();
  const body = document.getElementById("cartModalBody");
  const totalDisplay = document.getElementById("cartTotalDisplay");
  if (!body) return;

  if (!cart.length) {
    body.innerHTML =
      '<p class="text-muted text-center py-5"><i class="fas fa-shopping-cart fa-2x mb-3 d-block" style="color:var(--text-muted)"></i>Giỏ hàng đang trống</p>';
    if (totalDisplay) totalDisplay.textContent = "";
  } else {
    let total = 0;
    body.innerHTML = cart
      .map((item) => {
        total += item.price * item.quantity;
        return `
        <div class="d-flex align-items-center gap-3 py-2 border-bottom" style="border-color:var(--border)!important">
          <img src="${item.image}" style="width:60px;height:60px;object-fit:contain;background:#0d0d14;border-radius:4px;border:1px solid var(--border)">
          <div class="flex-grow-1">
            <div style="font-family:var(--font-ui);font-weight:600;color:var(--text)">${item.title}</div>
            <div style="font-family:var(--font-display);color:var(--red);font-size:.85rem">${Number(item.price).toLocaleString("vi-VN")}đ</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-secondary px-2 py-0" onclick="changeCartQty('${item.id}',-1)">-</button>
            <span style="font-family:var(--font-display);min-width:20px;text-align:center">${item.quantity}</span>
            <button class="btn btn-sm btn-secondary px-2 py-0" onclick="changeCartQty('${item.id}',1)">+</button>
          </div>
          <button class="btn btn-sm" style="color:var(--red);background:none;border:none" onclick="removeFromCart('${item.id}')"><i class="fas fa-times"></i></button>
        </div>`;
      })
      .join("");
    if (totalDisplay)
      totalDisplay.textContent =
        "Tổng: " + Number(total).toLocaleString("vi-VN") + "đ";
  }

  const modalEl = document.getElementById("cartModal");
  if (modalEl && window.bootstrap) {
    const m = bootstrap.Modal.getOrCreateInstance(modalEl);
    m.show();
  }
}

function changeCartQty(id, delta) {
  let cart = getCart();
  const gears = JSON.parse(localStorage.getItem("gears")) || [];
  const idx = cart.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const gear = gears.find((g) => g.id === id);
  const maxQty = gear ? gear.quantity : 99;
  cart[idx].quantity = Math.max(
    1,
    Math.min(cart[idx].quantity + delta, maxQty),
  );
  saveCart(cart);
  updateCartCount();
  showCartModal();
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  updateCartCount();
  showCartModal();
}

function goToCheckout() {
  const modalEl = document.getElementById("cartModal");
  if (modalEl && window.bootstrap) {
    bootstrap.Modal.getInstance(modalEl)?.hide();
  }
  window.location.href = "order.html?checkout=1";
}
