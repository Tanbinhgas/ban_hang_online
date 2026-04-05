function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Lỗi khi parse JSON từ localStorage:", error);
    return fallback;
  }
}

function getModalElement(id) {
  return document.getElementById(id);
}

function createModal(id) {
  const element = getModalElement(id);
  if (!element) return null;
  if (window.bootstrap?.Modal) {
    return new bootstrap.Modal(element);
  }
  return {
    show() {
      element.classList.add("show");
      element.style.display = "block";
      element.removeAttribute("aria-hidden");
    },
    hide() {
      element.classList.remove("show");
      element.style.display = "none";
      element.setAttribute("aria-hidden", "true");
    },
  };
}

function getModalInstance(id) {
  const element = getModalElement(id);
  if (!element || !window.bootstrap?.Modal) return null;
  return bootstrap.Modal.getInstance(element);
}

let currentUser = parseJSON(localStorage.getItem("currentUser"), null);
let users = parseJSON(localStorage.getItem("users"), []);

const defaultUsers = [
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "admin123",
    fullname: "Admin GearHub",
    role: "admin",
    coupons: [],
    createdAt: new Date().toLocaleString("vi-VN"),
  },
  {
    id: "user-1",
    email: "user@example.com",
    password: "user123",
    fullname: "Khách hàng GearHub",
    role: "user",
    coupons: [],
    createdAt: new Date().toLocaleString("vi-VN"),
  },
];

if (!users.length) {
  users = defaultUsers;
  localStorage.setItem("users", JSON.stringify(users));
}

function isLoggedIn() {
  return currentUser !== null;
}

function isAdmin() {
  return currentUser !== null && currentUser.role === "admin";
}

function isUser() {
  return currentUser !== null && currentUser.role === "user";
}

function register(email, password, fullname, role) {
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return { success: false, message: "Email đã được đăng ký!" };
  }

  if (password.length < 6) {
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự!" };
  }

  const newUser = {
    id: Date.now(),
    email: email,
    password: password,
    fullname: fullname || email.split("@")[0],
    role: role,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  currentUser = {
    id: newUser.id,
    email: newUser.email,
    fullname: newUser.fullname,
    role: newUser.role,
  };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  return { success: true, message: "Đăng ký thành công!" };
}

function login(email, password) {
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "Email hoặc mật khẩu không đúng!" };
  }

  currentUser = {
    id: user.id,
    email: user.email,
    fullname: user.fullname,
    role: user.role,
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  return {
    success: true,
    message: `Chào mừng ${currentUser.fullname} (${currentUser.role === "admin" ? "Quản trị viên" : "Khách hàng"})!`,
  };
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateAuthUI();
  return { success: true, message: "Đã đăng xuất!" };
}

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

  if (typeof window.updateWarehouseLink === "function") {
    window.updateWarehouseLink();
  }

  updateAdminButtons();
}

function updateAdminButtons() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser && currentUser.role === "admin";
  document.querySelectorAll(".admin-only").forEach((el) => {
    if (isAdmin) el.classList.remove("d-none");
    else el.classList.add("d-none");
  });
}

function showLoginModal() {
  const loginEl = document.getElementById("loginModal");
  const registerEl = document.getElementById("registerModal");

  if (registerEl) {
    const registerModal = bootstrap.Modal.getOrCreateInstance(registerEl);
    registerModal.hide();
  }

  if (loginEl) {
    const loginModal = bootstrap.Modal.getOrCreateInstance(loginEl);
    loginModal.show();
  }
}

function showRegisterModal() {
  const loginEl = document.getElementById("loginModal");
  const registerEl = document.getElementById("registerModal");

  if (loginEl) {
    const loginModal = bootstrap.Modal.getOrCreateInstance(loginEl);
    loginModal.hide();
  }

  if (registerEl) {
    const registerModal = bootstrap.Modal.getOrCreateInstance(registerEl);
    registerModal.show();
  }
}

function showMessage(title, message, isError = false) {
  const modalTitle = document.getElementById("messageModalLabel");
  const modalBody = document.getElementById("messageModalBody");

  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) {
    modalBody.innerHTML = `<div class="alert ${isError ? "alert-danger" : "alert-success"} mb-0">${message}</div>`;
  }

  const messageModal = createModal("messageModal");
  if (messageModal) {
    messageModal.show();
  } else {
    alert(message);
  }
}

function handleRegister(e) {
  e.preventDefault();

  const fullname = document.getElementById("regFullname").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const role =
    document.querySelector('input[name="role"]:checked')?.value || "user";

  const securityCode =
    document.getElementById("securityCode")?.value.trim() || "";

  if (role === "admin" && securityCode !== "2006") {
    showMessage(
      "Lỗi",
      "Mã bảo mật không chính xác! Chỉ Quản trị viên mới biết mã này.",
      true,
    );
    return;
  }

  if (!fullname || !email || !password) {
    showMessage("Lỗi", "Vui lòng nhập đầy đủ thông tin!", true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Lỗi", "Mật khẩu xác nhận không khớp!", true);
    return;
  }

  const result = register(email, password, fullname, role);

  if (result.success) {
    showMessage("Thành công", result.message);
    const registerModal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("registerModal"),
    );
    if (registerModal) {
      registerModal.hide();
    }
    document.getElementById("registerForm").reset();
    updateAuthUI();
  } else {
    showMessage("Lỗi", result.message, true);
  }
}

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
    const loginModal = getModalInstance("loginModal");
    if (loginModal) {
      loginModal.hide();
    }
    document.getElementById("loginForm").reset();
    updateAuthUI();

    if (window.location.pathname.includes("products.html")) {
      location.reload();
    }
  } else {
    showMessage("Lỗi", result.message, true);
  }
}

function handleLogout() {
  const result = logout();
  showMessage("Thành công", result.message);
  updateAuthUI();
  if (window.location.pathname.includes("products.html")) {
    location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  updateAdminButtons();

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", showLoginModal);
  if (registerBtn) registerBtn.addEventListener("click", showRegisterModal);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("hidden.bs.modal", function () {
      const forms = modal.querySelectorAll("form");
      forms.forEach((form) => form.reset());
    });
  });
});

window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.handleLogout = handleLogout;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.isUser = isUser;
window.getCurrentUser = () => currentUser;
window.showProfile = function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showLoginModal();
    return;
  }
  alert(
    `Hồ sơ của bạn:\nEmail: ${currentUser.email}\nHọ tên: ${currentUser.fullname}\nVai trò: ${currentUser.role === "admin" ? "Quản trị viên" : "Khách hàng"}`,
  );
};
window.showMyOrders = function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showLoginModal();
    return;
  }
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const userOrders = orders.filter((o) => o.userId === currentUser.id);
  if (!userOrders.length) {
    alert("Bạn chưa có đơn hàng nào.");
    return;
  }
  let msg = "Đơn hàng của tôi:\n\n";
  userOrders.forEach((order) => {
    msg += `Mã: ${order.id}\nSản phẩm: ${order.productName}\nSố lượng: ${order.quantity}\nThành tiền: ${order.totalPrice.toLocaleString()}đ\nTrạng thái: ${order.status}\n\n`;
  });
  alert(msg);
};

function updateAdminLinks() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const adminOrdersLink = document.getElementById("adminOrdersLink");
  if (adminOrdersLink) {
    if (currentUser && currentUser.role === "admin") {
      adminOrdersLink.style.display = "block";
    } else {
      adminOrdersLink.style.display = "none";
    }
  }

  const adminOrdersNav = document.getElementById("adminOrdersNav");
  if (adminOrdersNav) {
    if (currentUser && currentUser.role === "admin") {
      adminOrdersNav.classList.remove("d-none");
    } else {
      adminOrdersNav.classList.add("d-none");
    }
  }
}
