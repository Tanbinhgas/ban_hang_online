document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "light";

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  if (themeToggle) {
    themeToggle.innerHTML = body.classList.contains("dark-mode")
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      const isDark = body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");

      themeToggle.innerHTML = isDark
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
    });
  }

  const homeSearchForm = document.getElementById("homeSearchForm");
  const homeSearchInput = document.getElementById("searchInputHome");

  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = homeSearchInput?.value.trim() || "";
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
  modal.innerHTML = `
    <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Giỏ hàng của bạn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body px-0">
            <div class="container-fluid px-3">
              <div id="cartModalItems"></div>
              <div id="cartModalEmpty" class="text-center py-5 d-none">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">Giỏ hàng đang trống.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between flex-wrap gap-2">
            <button type="button" class="btn btn-outline-danger" id="clearCartBtn">Xóa giỏ hàng</button>
            <div class="d-flex align-items-center gap-3">
              <div class="fw-semibold">Tổng: <span id="cartModalTotal">0đ</span></div>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button type="button" class="btn btn-primary" id="checkoutCartBtn">Thanh toán</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);
  document
    .getElementById("checkoutCartBtn")
    ?.addEventListener("click", checkoutCart);
}

function renderCartModal() {
  const cart = getCart();
  const itemsContainer = document.getElementById("cartModalItems");
  const emptyContainer = document.getElementById("cartModalEmpty");
  const totalEl = document.getElementById("cartModalTotal");

  if (!itemsContainer || !emptyContainer || !totalEl) return;

  if (!cart.length) {
    itemsContainer.innerHTML = "";
    emptyContainer.classList.remove("d-none");
    totalEl.textContent = "0đ";
    return;
  }

  emptyContainer.classList.add("d-none");
  itemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="d-flex align-items-center justify-content-between border-bottom py-3">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image}" alt="${item.title}" class="rounded" style="width:80px; height:80px; object-fit:contain; background:#fff;">
            <div>
              <h6 class="mb-1">${item.title}</h6>
              <p class="mb-1 text-muted small">${item.category}</p>
              <p class="mb-0">${formatPrice(item.price)} x ${item.quantity} = <strong>${formatPrice(
                item.price * item.quantity,
              )}</strong></p>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger" data-cart-remove="${item.id}" aria-label="Xóa sản phẩm">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `,
    )
    .join("");

  totalEl.textContent = formatPrice(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  itemsContainer.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-cart-remove");
      if (id) removeCartItem(id);
    });
  });
}

function showCartModal() {
  renderCartModal();
  const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
  cartModal.show();
}

function removeCartItem(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCartModal();
  updateCartCount();
}

function clearCart() {
  if (!confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) return;
  saveCart([]);
  renderCartModal();
  updateCartCount();
}

function checkoutCart() {
  if (!isLoggedIn()) {
    showLoginModal();
    return;
  }
  const cart = getCart();
  if (!cart.length) {
    alert("Giỏ hàng đang trống!");
    return;
  }
  window.location.href = "order.html?checkout=1";
}

window.showCartModal = showCartModal;
