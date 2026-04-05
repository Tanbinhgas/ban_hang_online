// ── HELPERS ────────────────────────────────────────────────────
function parseJSON(v, fb) {
  try { return v ? JSON.parse(v) : fb; }
  catch { return fb; }
}

// ── STATE ──────────────────────────────────────────────────────
let currentUser = parseJSON(localStorage.getItem("currentUser"), null);
let users       = parseJSON(localStorage.getItem("users"), []);

if (!users.length) {
  users = [
    { id: "admin-1", email: "admin@example.com", password: "admin123",
      fullname: "Admin GearHub", role: "admin", createdAt: new Date().toLocaleString("vi-VN") },
    { id: "user-1",  email: "user@example.com",  password: "user123",
      fullname: "Khách hàng GearHub", role: "user",  createdAt: new Date().toLocaleString("vi-VN") },
  ];
  localStorage.setItem("users", JSON.stringify(users));
}

// ── ROLE CHECKS ────────────────────────────────────────────────
function isLoggedIn() { return currentUser !== null; }
function isAdmin()    { return currentUser?.role === "admin"; }
function isUser()     { return currentUser?.role === "user"; }

// ── AUTH ACTIONS ───────────────────────────────────────────────
function register(email, password, fullname, role) {
  if (users.find((u) => u.email === email))
    return { success: false, message: "Email đã được đăng ký!" };
  if (password.length < 6)
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự!" };

  const u = { id: Date.now(), email, password, fullname: fullname || email.split("@")[0], role };
  users.push(u);
  localStorage.setItem("users", JSON.stringify(users));
  currentUser = { id: u.id, email: u.email, fullname: u.fullname, role: u.role };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  return { success: true, message: "Đăng ký thành công!" };
}

function login(email, password) {
  const u = users.find((u) => u.email === email && u.password === password);
  if (!u) return { success: false, message: "Email hoặc mật khẩu không đúng!" };
  currentUser = { id: u.id, email: u.email, fullname: u.fullname, role: u.role };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  return { success: true, message: `Chào mừng ${currentUser.fullname}!` };
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateAuthUI();
  return { success: true, message: "Đã đăng xuất!" };
}

// ── UI UPDATE ──────────────────────────────────────────────────
function updateAuthUI() {
  const authButtons = document.getElementById("authButtons");
  const userInfo    = document.getElementById("userInfo");
  if (!authButtons) return;

  if (isLoggedIn()) {
    authButtons.classList.add("d-none");
    if (userInfo) {
      userInfo.classList.remove("d-none");
      const span = document.getElementById("userName");
      if (span) span.textContent = currentUser.fullname;
    }
  } else {
    authButtons.classList.remove("d-none");
    userInfo?.classList.add("d-none");
  }
  updateWarehouseLink?.();
  updateAdminButtons();
}

function updateAdminButtons() {
  const admin = parseJSON(localStorage.getItem("currentUser"), null)?.role === "admin";
  document.querySelectorAll(".admin-only").forEach((el) =>
    el.classList.toggle("d-none", !admin)
  );
}

// ── MODALS ─────────────────────────────────────────────────────
function showLoginModal() {
  const regEl = document.getElementById("registerModal");
  if (regEl) bootstrap.Modal.getOrCreateInstance(regEl).hide();
  const loginEl = document.getElementById("loginModal");
  if (loginEl) bootstrap.Modal.getOrCreateInstance(loginEl).show();
}

function showRegisterModal() {
  const loginEl = document.getElementById("loginModal");
  if (loginEl) bootstrap.Modal.getOrCreateInstance(loginEl).hide();
  const regEl = document.getElementById("registerModal");
  if (regEl) bootstrap.Modal.getOrCreateInstance(regEl).show();
}

function showMessage(title, message, isError = false) {
  const titleEl = document.getElementById("messageModalLabel");
  const bodyEl  = document.getElementById("messageModalBody");
  if (titleEl) titleEl.textContent = title;
  if (bodyEl)  bodyEl.innerHTML = `<div class="alert ${isError ? "alert-danger" : "alert-success"} mb-0">${message}</div>`;
  const el = document.getElementById("messageModal");
  if (el) bootstrap.Modal.getOrCreateInstance(el).show();
  else alert(message);
}

// ── FORM HANDLERS ──────────────────────────────────────────────
function handleRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById("regFullname").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirmPassword").value;
  const role     = document.querySelector('input[name="role"]:checked')?.value || "user";
  const code     = document.getElementById("securityCode")?.value.trim() || "";

  if (!fullname || !email || !password)
    return showMessage("Lỗi", "Vui lòng nhập đầy đủ thông tin!", true);
  if (password !== confirm)
    return showMessage("Lỗi", "Mật khẩu xác nhận không khớp!", true);
  if (role === "admin" && code !== "2006")
    return showMessage("Lỗi", "Mã bảo mật không chính xác!", true);

  const result = register(email, password, fullname, role);
  if (result.success) {
    showMessage("Thành công", result.message);
    bootstrap.Modal.getOrCreateInstance(document.getElementById("registerModal")).hide();
    document.getElementById("registerForm").reset();
    updateAuthUI();
  } else showMessage("Lỗi", result.message, true);
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password)
    return showMessage("Lỗi", "Vui lòng nhập email và mật khẩu!", true);

  const result = login(email, password);
  if (result.success) {
    showMessage("Thành công", result.message);
    bootstrap.Modal.getInstance(document.getElementById("loginModal"))?.hide();
    document.getElementById("loginForm").reset();
    updateAuthUI();
    if (window.location.pathname.includes("products.html")) location.reload();
  } else showMessage("Lỗi", result.message, true);
}

function handleLogout() {
  logout();
  showMessage("Thành công", "Đã đăng xuất!");
  if (window.location.pathname.includes("products.html")) location.reload();
}

// ── PROFILE & ORDERS ───────────────────────────────────────────
window.showProfile = function () {
  if (!isLoggedIn()) return showLoginModal();
  const u = parseJSON(localStorage.getItem("currentUser"), {});
  showMessage("Hồ sơ", `Email: ${u.email}<br>Họ tên: ${u.fullname}<br>Vai trò: ${u.role === "admin" ? "Quản trị viên" : "Khách hàng"}`);
};

window.showMyOrders = function () {
  if (!isLoggedIn()) return showLoginModal();
  window.location.href = "order.html?myorders=1";
};

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();

  document.getElementById("loginBtn")?.addEventListener("click", showLoginModal);
  document.getElementById("registerBtn")?.addEventListener("click", showRegisterModal);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("registerForm")?.addEventListener("submit", handleRegister);

  // Reset form khi đóng modal
  document.querySelectorAll(".modal").forEach((m) =>
    m.addEventListener("hidden.bs.modal", () =>
      m.querySelectorAll("form").forEach((f) => f.reset())
    )
  );

  // Hiện/ẩn ô mã bảo mật theo role
  document.querySelectorAll('input[name="role"]').forEach((r) =>
    r.addEventListener("change", function () {
      const div = document.getElementById("securityCodeDiv");
      if (!div) return;
      div.classList.toggle("d-none", this.value !== "admin");
      if (this.value !== "admin") {
        const inp = document.getElementById("securityCode");
        if (inp) inp.value = "";
      }
    })
  );
});

// ── EXPOSE GLOBALS ─────────────────────────────────────────────
window.showLoginModal    = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.handleLogout      = handleLogout;
window.isLoggedIn        = isLoggedIn;
window.isAdmin           = isAdmin;
window.isUser            = isUser;
window.getCurrentUser    = () => currentUser;
