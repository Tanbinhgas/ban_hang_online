let gears = JSON.parse(localStorage.getItem("gears")) || [];
let editId = null;
let selectedImage = "";
let currentCategory = "all";

const gearList = document.getElementById("gearList");
const gearForm = document.getElementById("gearForm");
const gearModalElement = document.getElementById("gearModal");
const gearModal = new bootstrap.Modal(gearModalElement);
const noResults = document.getElementById("noResults");

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const descriptionInput = document.getElementById("description");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const saveGearBtn = document.getElementById("saveGearBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const addGearBtn = document.getElementById("addGearBtn");

const searchInputMain = document.getElementById("searchInputMain");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

function saveGears() {
  localStorage.setItem("gears", JSON.stringify(gears));
}

function getStockStatus(quantity) {
  return Number(quantity) > 0 ? "Còn hàng" : "Hết hàng";
}

function getStatusBadge(quantity) {
  const status = getStockStatus(quantity);
  if (status === "Còn hàng") {
    return `<span class="badge bg-success">${status}</span>`;
  }
  return `<span class="badge bg-danger">${status}</span>`;
}

function resetForm() {
  gearForm.reset();
  editId = null;
  selectedImage = "";
  imagePreview.src = "";
  imagePreview.classList.add("d-none");
  priceInput.value = "";
  priceInput._rawValue = 0;

  titleInput.classList.remove("is-invalid");
  categoryInput.classList.remove("is-invalid");
  priceInput.classList.remove("is-invalid");
  quantityInput.classList.remove("is-invalid");
  descriptionInput.classList.remove("is-invalid");

  const modalTitle = document.getElementById("gearModalLabel");
  if (modalTitle) {
    modalTitle.textContent = "Thêm sản phẩm mới";
  }
}

// ========== XỬ LÝ GIÁ - GIẢI PHÁP ĐƠN GIẢN ==========
// Chỉ lấy số, không format khi đang nhập
priceInput.addEventListener("input", function (e) {
  let value = this.value;
  // Xóa tất cả ký tự không phải số (kể cả dấu . và ,)
  let numericValue = value.replace(/[^0-9]/g, "");

  if (numericValue === "") {
    this.value = "";
    this._rawValue = 0;
    return;
  }

  let number = parseInt(numericValue, 10);
  this._rawValue = number;
  // Hiển thị dạng số thô (không dấu chấm)
  this.value = numericValue;
});

// Khi mất focus, format thành dạng có dấu chấm
priceInput.addEventListener("blur", function () {
  if (this._rawValue && this._rawValue > 0) {
    this.value = this._rawValue.toLocaleString("vi-VN");
  } else {
    this.value = "";
  }
});

// Khi focus vào, chuyển về số thô để dễ sửa
priceInput.addEventListener("focus", function () {
  if (this._rawValue && this._rawValue > 0) {
    this.value = this._rawValue.toString();
  } else {
    this.value = "";
  }
});

// Hàm lấy giá trị số
function getPriceValue() {
  return priceInput._rawValue || 0;
}

function renderGears(data = gears) {
  gearList.innerHTML = "";

  if (!data.length) {
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  data.forEach((gear) => {
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    card.innerHTML = `
      <div class="card h-100 shadow-sm border-0">
        <img src="${gear.image}" class="card-img-top" alt="${gear.title}" 
        style="height: 220px; object-fit: contain; background:#fff;">
        
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary">${gear.category}</span>
            ${getStatusBadge(gear.quantity)}
          </div>

          <h6 class="card-title">${gear.title}</h6>
          <p class="text-danger fw-bold mb-1">
            ${Number(gear.price).toLocaleString("vi-VN")}₫
          </p>

          <p class="mb-1">Số lượng: <strong>${gear.quantity}</strong></p>
          <p class="small text-muted flex-grow-1">${gear.description.substring(0, 80)}${gear.description.length > 80 ? "..." : ""}</p>

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary flex-fill" onclick="addToCart('${gear.id}')">
              <i class="fas fa-cart-plus"></i> Thêm giỏ
            </button>
            <button class="btn btn-sm btn-warning flex-fill" onclick="editGear('${gear.id}')">Sửa</button>
            <button class="btn btn-sm btn-danger flex-fill" onclick="deleteGear('${gear.id}')">Xóa</button>
          </div>
        </div>
      </div>
    `;

    gearList.appendChild(card);
  });
}

function addToCart(id) {
  const gear = gears.find((g) => g.id === id);
  if (!gear) return;

  if (gear.quantity <= 0) {
    alert("Sản phẩm đã hết hàng!");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    if (existingItem.quantity + 1 > gear.quantity) {
      alert(`Chỉ còn ${gear.quantity} sản phẩm trong kho!`);
      return;
    }
    existingItem.quantity++;
  } else {
    cart.push({
      id: gear.id,
      title: gear.title,
      price: gear.price,
      image: gear.image,
      quantity: 1,
      maxQuantity: gear.quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCountDisplay();
  alert(`Đã thêm ${gear.title} vào giỏ hàng!`);
}

function updateCartCountDisplay() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function validateForm() {
  let isValid = true;

  titleInput.classList.remove("is-invalid");
  categoryInput.classList.remove("is-invalid");
  priceInput.classList.remove("is-invalid");
  quantityInput.classList.remove("is-invalid");
  descriptionInput.classList.remove("is-invalid");

  if (!titleInput.value.trim()) {
    titleInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!categoryInput.value) {
    categoryInput.classList.add("is-invalid");
    isValid = false;
  }

  let priceValue = getPriceValue();
  if (priceValue <= 0) {
    priceInput.classList.add("is-invalid");
    isValid = false;
  }

  if (quantityInput.value === "" || Number(quantityInput.value) < 0) {
    quantityInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!descriptionInput.value.trim()) {
    descriptionInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!selectedImage && !editId) {
    alert("Vui lòng chọn ảnh sản phẩm.");
    isValid = false;
  }

  return isValid;
}

saveGearBtn.addEventListener("click", () => {
  if (!validateForm()) return;

  const gear = {
    id: editId || Date.now().toString(),
    title: titleInput.value.trim(),
    category: categoryInput.value,
    price: getPriceValue(),
    quantity: Number(quantityInput.value),
    description: descriptionInput.value.trim(),
    image: selectedImage,
  };

  if (editId) {
    const oldGear = gears.find((g) => g.id === editId);
    if (!gear.image && oldGear) {
      gear.image = oldGear.image;
    }

    const index = gears.findIndex((g) => g.id === editId);
    if (index !== -1) {
      gears[index] = gear;
    }
  } else {
    gears.push(gear);
  }

  saveGears();
  filterAndRender();
  gearModal.hide();
  resetForm();
});

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh hợp lệ.");
    imageInput.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    selectedImage = event.target.result;
    imagePreview.src = selectedImage;
    imagePreview.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
});

function editGear(id) {
  const gear = gears.find((g) => g.id === id);
  if (!gear) return;

  editId = id;
  selectedImage = gear.image;

  titleInput.value = gear.title;
  categoryInput.value = gear.category;
  // Set giá trị số thô
  priceInput.value = gear.price.toString();
  priceInput._rawValue = gear.price;
  quantityInput.value = gear.quantity;
  descriptionInput.value = gear.description;

  imagePreview.src = gear.image;
  imagePreview.classList.remove("d-none");

  const modalTitle = document.getElementById("gearModalLabel");
  if (modalTitle) {
    modalTitle.textContent = "Sửa sản phẩm";
  }

  gearModal.show();
}

function deleteGear(id) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  gears = gears.filter((g) => g.id !== id);
  saveGears();
  filterAndRender();
}

function filterAndRender() {
  let filtered = [...gears];

  if (currentCategory !== "all") {
    filtered = filtered.filter((g) => g.category === currentCategory);
  }

  const searchTerm = searchInputMain?.value.toLowerCase() || "";
  if (searchTerm) {
    filtered = filtered.filter((g) =>
      g.title.toLowerCase().includes(searchTerm),
    );
  }

  const sortValue = sortSelect?.value || "newest";
  if (sortValue === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  }

  renderGears(filtered);
}

if (searchInputMain) {
  searchInputMain.addEventListener("input", filterAndRender);
}
if (categoryFilter) {
  categoryFilter.addEventListener("change", (e) => {
    currentCategory = e.target.value;
    filterAndRender();
  });
}
if (sortSelect) {
  sortSelect.addEventListener("change", filterAndRender);
}
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Xóa tất cả sản phẩm? Hành động này không thể hoàn tác.")) {
      gears = [];
      saveGears();
      filterAndRender();
    }
  });
}

const categoryLinks = document.querySelectorAll(".category-link");
categoryLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const cat = link.getAttribute("data-category");
    if (categoryFilter) {
      categoryFilter.value = cat;
      currentCategory = cat;
      filterAndRender();
    }
  });
});

window.editGear = editGear;
window.deleteGear = deleteGear;
window.addToCart = addToCart;

filterAndRender();
updateCartCountDisplay();
