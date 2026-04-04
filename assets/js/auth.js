// auth.js
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let users = JSON.parse(localStorage.getItem("users")) || [];

// Hàm kiểm tra đăng nhập
function isLoggedIn() {
  return currentUser !== null;
}

<<<<<<< HEAD:assets/js/auth.js
// Hàm kiểm tra Admin
function isAdmin() {
  return currentUser !== null && currentUser.role === "admin";
}

// Hàm kiểm tra User (khách hàng)
function isUser() {
  return currentUser !== null && currentUser.role === "user";
}

// Hàm đăng ký
function register(email, password, fullname, role) {
=======
// Hàm đăng ký
function register(email, password, fullname) {
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
  // Kiểm tra email đã tồn tại chưa
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return { success: false, message: "Email đã được đăng ký!" };
  }

  // Kiểm tra password
  if (password.length < 6) {
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự!" };
  }

  // Tạo user mới
  const newUser = {
    id: Date.now(),
    email: email,
    password: password,
    fullname: fullname || email.split("@")[0],
<<<<<<< HEAD:assets/js/auth.js
    role: role, // "admin" hoặc "user"
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
    createdAt: new Date().toLocaleString("vi-VN"),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  return { success: true, message: "Đăng ký thành công!" };
}

// Hàm đăng nhập
function login(email, password) {
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "Email hoặc mật khẩu không đúng!" };
  }

  currentUser = {
    id: user.id,
    email: user.email,
    fullname: user.fullname,
<<<<<<< HEAD:assets/js/auth.js
    role: user.role,
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));

<<<<<<< HEAD:assets/js/auth.js
  return {
    success: true,
    message: `Chào mừng ${currentUser.fullname} (${currentUser.role === "admin" ? "Quản trị viên" : "Khách hàng"})!`,
  };
=======
  return { success: true, message: `Chào mừng ${currentUser.fullname}!` };
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
}

// Hàm đăng xuất
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateAuthUI();
  return { success: true, message: "Đã đăng xuất!" };
}

// Hàm cập nhật giao diện theo trạng thái đăng nhập
function updateAuthUI() {
  const authButtons = document.getElementById("authButtons");
  const userInfo = document.getElementById("userInfo");

  if (!authButtons) return;

  if (isLoggedIn()) {
    authButtons.classList.add("d-none");
    if (userInfo) {
      userInfo.classList.remove("d-none");
      const userNameSpan = document.getElementById("userName");
      if (userNameSpan) {
        userNameSpan.textContent = currentUser.fullname;
      }
    }
  } else {
    authButtons.classList.remove("d-none");
    if (userInfo) {
      userInfo.classList.add("d-none");
    }
  }
}

// Hàm mở modal đăng nhập
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
  loginModal.show();
}

// Hàm mở modal đăng ký
function showRegisterModal() {
  const registerModal = new bootstrap.Modal(
    document.getElementById("registerModal"),
  );
  registerModal.show();
}

// Hàm mở modal thông báo
function showMessage(title, message, isError = false) {
  const modalTitle = document.getElementById("messageModalLabel");
  const modalBody = document.getElementById("messageModalBody");

  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) {
    modalBody.innerHTML = `<div class="alert ${isError ? "alert-danger" : "alert-success"} mb-0">${message}</div>`;
  }

  const messageModal = new bootstrap.Modal(
    document.getElementById("messageModal"),
  );
  messageModal.show();
}

// Xử lý đăng ký
function handleRegister(e) {
  e.preventDefault();

  const fullname = document.getElementById("regFullname").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
<<<<<<< HEAD:assets/js/auth.js
  const role =
    document.querySelector('input[name="role"]:checked')?.value || "user";
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js

  if (!fullname || !email || !password) {
    showMessage("Lỗi", "Vui lòng nhập đầy đủ thông tin!", true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Lỗi", "Mật khẩu xác nhận không khớp!", true);
    return;
  }

<<<<<<< HEAD:assets/js/auth.js
  const result = register(email, password, fullname, role);
=======
  const result = register(email, password, fullname);
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js

  if (result.success) {
    showMessage("Thành công", result.message);
    const registerModal = bootstrap.Modal.getInstance(
      document.getElementById("registerModal"),
    );
    registerModal.hide();
    document.getElementById("registerForm").reset();
  } else {
    showMessage("Lỗi", result.message, true);
  }
}

// Xử lý đăng nhập
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showMessage("Lỗi", "Vui lòng nhập email và mật khẩu!", true);
    return;
  }

  const result = login(email, password);

  if (result.success) {
    showMessage("Thành công", result.message);
    const loginModal = bootstrap.Modal.getInstance(
      document.getElementById("loginModal"),
    );
    loginModal.hide();
    document.getElementById("loginForm").reset();
    updateAuthUI();
<<<<<<< HEAD:assets/js/auth.js
    // Reload lại trang products nếu đang ở đó để cập nhật nút CRUD
    if (window.location.pathname.includes("products.html")) {
      location.reload();
    }
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
  } else {
    showMessage("Lỗi", result.message, true);
  }
}

// Xử lý đăng xuất
function handleLogout() {
  const result = logout();
  showMessage("Thành công", result.message);
  updateAuthUI();
<<<<<<< HEAD:assets/js/auth.js
  if (window.location.pathname.includes("products.html")) {
    location.reload();
  }
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
}

// Khởi tạo event listeners
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();

  // Gán sự kiện cho các nút
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", showLoginModal);
  if (registerBtn) registerBtn.addEventListener("click", showRegisterModal);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Form đăng nhập
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  // Form đăng ký
  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  // Đóng modal khi click outside
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("hidden.bs.modal", function () {
      const forms = modal.querySelectorAll("form");
      forms.forEach((form) => form.reset());
    });
  });
});

// Export functions để dùng trong HTML
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.handleLogout = handleLogout;
window.isLoggedIn = isLoggedIn;
<<<<<<< HEAD:assets/js/auth.js
window.isAdmin = isAdmin;
window.isUser = isUser;
=======
>>>>>>> dd4619ba652d82732ed9ddb919fb55d4db7aed3a:src/assets/js/auth.js
window.getCurrentUser = () => currentUser;
