let gears = JSON.parse(localStorage.getItem("gears")) || [];
let editId = null;
let selectedImage = "";
let currentCategory = "all";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

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
const searchInputMain = document.getElementById("searchInputMain");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const initialSearchQuery = getQueryParam("q").trim();
if (searchInputMain && initialSearchQuery) {
  searchInputMain.value = initialSearchQuery;
}

// Sync navbar search input với searchInputMain (2 chiều)
const navbarSearch = document.getElementById("searchInputHome");
if (navbarSearch && searchInputMain) {
  navbarSearch.addEventListener("input", () => {
    searchInputMain.value = navbarSearch.value;
    filterAndRender();
  });
}

const savedCategory = localStorage.getItem("preSelectedCategory") || "";
if (savedCategory) {
  currentCategory = savedCategory === "all" ? "all" : savedCategory;
  if (categoryFilter) categoryFilter.value = savedCategory;
  localStorage.removeItem("preSelectedCategory");
}

function saveGears() {
  localStorage.setItem("gears", JSON.stringify(gears));
}

function getStatusBadge(qty) {
  return qty > 0
    ? '<span class="badge bg-success">Còn hàng</span>'
    : '<span class="badge bg-danger">Hết hàng</span>';
}

function resetForm() {
  gearForm.reset();
  editId = null;
  selectedImage = "";
  imagePreview.src = "";
  imagePreview.classList.add("d-none");
  priceInput.value = "";
  priceInput._rawValue = 0;
  document.getElementById("gearModalLabel").textContent = "Thêm sản phẩm mới";
}

priceInput.addEventListener("input", function (e) {
  let val = this.value.replace(/[^0-9]/g, "");
  if (val === "") {
    this.value = "";
    this._rawValue = 0;
    return;
  }
  this._rawValue = parseInt(val, 10);
  this.value = val;
});
priceInput.addEventListener("blur", function () {
  if (this._rawValue > 0) this.value = this._rawValue.toLocaleString("vi-VN");
  else this.value = "";
});
priceInput.addEventListener("focus", function () {
  if (this._rawValue > 0) this.value = this._rawValue.toString();
});
function getPriceValue() {
  return priceInput._rawValue || 0;
}

function updateAdminButtons() {
  const adminBtns = document.querySelectorAll(".admin-only");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser && currentUser.role === "admin";

  adminBtns.forEach((btn) => {
    if (isAdmin) btn.classList.remove("d-none");
    else btn.classList.add("d-none");
  });
}

function renderGears(data = gears) {
  gearList.innerHTML = "";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser && currentUser.role === "admin";

  if (!data.length) {
    noResults.classList.remove("d-none");
    return;
  }
  noResults.classList.add("d-none");

  data.forEach((gear) => {
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-md-4 col-lg-3";
    let actionBtns = `
      <button class="btn btn-sm btn-info flex-fill" onclick="viewDetail('${gear.id}')">
        <i class="fas fa-eye"></i> Xem chi tiết
      </button>
    `;
    if (gear.quantity > 0) {
      actionBtns += `
        <button class="btn btn-sm btn-outline-primary flex-fill" onclick="addToCart('${gear.id}')">
          <i class="fas fa-cart-plus"></i> Thêm giỏ
        </button>
        <button class="btn btn-sm btn-success flex-fill" onclick="buyNow('${gear.id}')">
          <i class="fas fa-bolt"></i> Mua ngay
        </button>
      `;
    } else {
      actionBtns += `
        <button class="btn btn-sm btn-secondary flex-fill" disabled>
          <i class="fas fa-ban"></i> Hết hàng
        </button>
      `;
    }
    if (isAdmin)
      actionBtns += `<button class="btn btn-sm btn-warning flex-fill" onclick="editGear('${gear.id}')">Sửa</button>`;

    card.innerHTML = `
      <div class="card h-100 shadow-sm border-0 position-relative">
        ${isAdmin ? `<button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="deleteGear('${gear.id}')" aria-label="Xóa"><i class="fas fa-times"></i></button>` : ""}
        <img src="${gear.image}" class="card-img-top" style="height:220px; object-fit:contain; background:#fff;">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between"><span class="badge bg-primary">${gear.category}</span>${getStatusBadge(gear.quantity)}</div>
          <h6 class="card-title mt-2">${gear.title}</h6>
          <p class="text-danger fw-bold">${Number(gear.price).toLocaleString("vi-VN")}₫</p>
          <p>Số lượng: <strong>${gear.quantity}</strong></p>
          <p class="small text-muted flex-grow-1">${gear.description.substring(0, 80)}${gear.description.length > 80 ? "..." : ""}</p>
          <div class="mt-3 d-flex gap-2 flex-wrap">${actionBtns}</div>
        </div>
      </div>`;
    gearList.appendChild(card);
  });
}

function addToCart(id) {
  if (!isLoggedIn()) {
    showLoginModal();
    return;
  }
  const gear = gears.find((g) => g.id === id);
  if (!gear) return;
  if (gear.quantity <= 0) return alert("Sản phẩm đã hết hàng!");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exist = cart.find((i) => i.id === id);
  if (exist) {
    if (exist.quantity + 1 > gear.quantity)
      return alert(`Chỉ còn ${gear.quantity} sản phẩm!`);
    exist.quantity++;
  } else
    cart.push({
      id,
      title: gear.title,
      price: gear.price,
      image: gear.image,
      quantity: 1,
    });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCountDisplay();
}

function buyNow(id) {
  addToCart(id);
  window.location.href = "order.html?checkout=1";
}

function viewDetail(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

function updateCartCountDisplay() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");
  if (cartCount)
    cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function validateForm() {
  if (!titleInput.value.trim())
    return alert("Tên sản phẩm không được để trống!");
  if (!categoryInput.value) return alert("Vui lòng chọn loại sản phẩm!");
  if (getPriceValue() <= 0) return alert("Giá phải lớn hơn 0!");
  if (quantityInput.value === "" || Number(quantityInput.value) < 0)
    return alert("Số lượng không hợp lệ!");
  if (!descriptionInput.value.trim())
    return alert("Mô tả không được để trống!");
  if (!selectedImage && !editId) return alert("Vui lòng chọn ảnh sản phẩm!");
  return true;
}

saveGearBtn?.addEventListener("click", () => {
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
    const idx = gears.findIndex((g) => g.id === editId);
    if (idx !== -1) gears[idx] = gear;
  } else gears.push(gear);
  saveGears();
  filterAndRender();
  gearModal.hide();
  resetForm();
});

imageInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) return alert("Chọn file ảnh hợp lệ!");
  if (file.size > 2 * 1024 * 1024) return alert("Ảnh dưới 2MB!");
  const reader = new FileReader();
  reader.onload = (ev) => {
    selectedImage = ev.target.result;
    imagePreview.src = selectedImage;
    imagePreview.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
});

window.editGear = function (id) {
  const gear = gears.find((g) => g.id === id);
  if (!gear) return;
  editId = id;
  selectedImage = gear.image;
  titleInput.value = gear.title;
  categoryInput.value = gear.category;
  priceInput.value = gear.price.toString();
  priceInput._rawValue = gear.price;
  quantityInput.value = gear.quantity;
  descriptionInput.value = gear.description;
  imagePreview.src = gear.image;
  imagePreview.classList.remove("d-none");
  document.getElementById("gearModalLabel").textContent = "Sửa sản phẩm";
  gearModal.show();
};

window.deleteGear = function (id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  gears = gears.filter((g) => g.id !== id);
  saveGears();
  filterAndRender();
};

function filterAndRender() {
  let filtered = [...gears];
  if (currentCategory !== "all")
    filtered = filtered.filter((g) => g.category === currentCategory);

  const navSearch =
    document.getElementById("searchInputHome")?.value.toLowerCase() || "";
  const search = (searchInputMain?.value || navSearch).toLowerCase().trim();
  if (search)
    filtered = filtered.filter(
      (g) =>
        g.title.toLowerCase().includes(search) ||
        g.category.toLowerCase().includes(search) ||
        (g.description && g.description.toLowerCase().includes(search)),
    );
  const sort = sortSelect?.value || "newest";
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "newest") filtered.sort((a, b) => b.id - a.id);
  renderGears(filtered);
}

searchInputMain?.addEventListener("input", filterAndRender);
categoryFilter?.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  filterAndRender();
});
sortSelect?.addEventListener("change", filterAndRender);
clearAllBtn?.addEventListener("click", () => {
  if (confirm("Xóa tất cả?")) {
    gears = [];
    saveGears();
    filterAndRender();
  }
});

document.getElementById("addGearBtn")?.addEventListener("click", () => {
  editId = null;
  resetForm();
});

gearForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  saveGearBtn?.click();
});

gearModalElement?.addEventListener("hidden.bs.modal", resetForm);

document.querySelectorAll(".category-link").forEach((link) => {
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

if (gears.length === 0) {
  gears = [
    {
      id: "1",
      title: "Razer Viper V3 Pro",
      category: "Chuột",
      price: 15900000,
      quantity: 10,
      description:
        "Chuột gaming siêu nhẹ 54g, sensor Focus Pro 35K DPI, switch quang học Gen 3, pin lên đến 90 giờ.",
      image:
        "https://cdn.cs.1worldsync.com/2e/53/2e53ff46-8e48-445c-b3b9-952c0e8e452f.jpg",
      specs: {
        "Thương hiệu": "Razer",
        "Trọng lượng": "54g",
        DPI: "35,000",
        Switch: "Quang học Gen 3",
        Pin: "90 giờ",
        "Kết nối": "Wireless 2.4GHz",
        "Bảo hành": "2 năm",
      },
    },
    {
      id: "2",
      title: "SteelSeries Apex Pro TKL Gen 3",
      category: "Bàn phím",
      price: 6990000,
      quantity: 15,
      description:
        "Bàn phím cơ adjustable switch, OLED screen, RGB lighting, PBT keycaps.",
      image:
        "https://cdn.cs.1worldsync.com/0b/84/0b8472e6-d2fb-4ecb-96f7-137231008396.jpg",
      specs: {
        "Thương hiệu": "SteelSeries",
        Switch: "OmniPoint Adjustable",
        Layout: "TKL (87 keys)",
        Lighting: "RGB per-key",
        Display: "OLED Smart Display",
        Keycaps: "PBT Double-Shot",
        "Bảo hành": "2 năm",
      },
    },
    {
      id: "3",
      title: "SteelSeries Arctis Nova Pro",
      category: "Tai nghe",
      price: 10900000,
      quantity: 8,
      description:
        "Tai nghe không dây gaming, ANC, battery 36 giờ, Discord certified.",
      image:
        "https://images.ctfassets.net/hmm5mo4qf4mf/5jLjb5ljMWTBZ6fxdM5jWt/2c374af74a65f763c8507699290df1b3/buy_image_4_24.png__1920x1080_crop-fit_optimize_subsampling-2-3649.png?fm=webp&q=90&fit=scale&w=1920",
      specs: {
        "Thương hiệu": "SteelSeries",
        "Kết nối": "Wireless 2.4GHz",
        Battery: "36 giờ",
        ANC: "Có",
        Microphone: "Retractable",
        Certification: "Discord Certified",
        "Bảo hành": "2 năm",
      },
    },
    {
      id: "4",
      title: "Mouse Pad RGB Large",
      category: "Chuột",
      price: 799000,
      quantity: 20,
      description:
        "Lót chuột RGB lớn 900x400mm, bề mặt microfiber, lighting RGB.",
      image:
        "https://m.media-amazon.com/images/I/51sezMIH1iL._AC_UF894,1000_QL80_.jpg",
      specs: {
        "Kích thước": "900x400mm",
        "Bề mặt": "Microfiber",
        Lighting: "RGB",
        "Độ dày": "3mm",
        "Bảo hành": "1 năm",
      },
    },
    {
      id: "5",
      title: "Logitech G Pro X Superlight 2",
      category: "Chuột",
      price: 12900000,
      quantity: 12,
      description: "Chuột không dây 8KHz, trọng lượng 58g, sensor HERO 2.",
      image:
        "https://content.abt.com/image.php/logitech-mouse-910-006636-top-view.jpg?image=/images/products/BDP_Images/logitech-mouse-910-006636-top-view.jpg&canvas=1&width=750&height=550",
      specs: {
        "Thương hiệu": "Logitech",
        "Trọng lượng": "58g",
        "Polling Rate": "8,000 Hz",
        Sensor: "HERO 2",
        DPI: "32,000",
        Battery: "70 giờ",
        "Bảo hành": "2 năm",
      },
    },
    {
      id: "6",
      title: "FIFINE RGB Speakers + Mic",
      category: "Loa/Mic",
      price: 2490000,
      quantity: 5,
      description: "Loa RGB kèm micro không dây, kết nối USB, RGB lighting.",
      image:
        "https://us.maxgaming.com/bilder/artiklar/zoom/31673_1.jpg?m=1723197868",
      specs: {
        "Kết nối": "USB",
        Microphone: "Có",
        Lighting: "RGB",
        Power: "5W",
        "Bảo hành": "1 năm",
      },
    },
    {
      id: "7",
      title: "Dell UltraSharp 27",
      category: "Màn hình",
      price: 12490000,
      quantity: 8,
      description:
        "Màn hình IPS 27 inch, độ phân giải QHD 1440p, tần số 144Hz.",
      image: "https://via.placeholder.com/400x300?text=Dell+UltraSharp+27",
      specs: {
        "Kích thước": "27 inch",
        "Độ phân giải": "QHD (2560x1440)",
        "Tần số": "144Hz",
        Panel: "IPS",
        HDR: "HDR400",
        Ports: "HDMI, DP, USB-C",
        "Bảo hành": "3 năm",
      },
    },
    {
      id: "8",
      title: "MSI Gaming Laptop GF63",
      category: "Laptop",
      price: 21990000,
      quantity: 6,
      description: "Laptop gaming 15.6 inch, RTX 4050, i5-12450H, 16GB RAM.",
      image: "https://via.placeholder.com/400x300?text=MSI+Gaming+Laptop",
      specs: {
        "Màn hình": "15.6 inch FHD 144Hz",
        CPU: "Intel Core i5-12450H",
        GPU: "RTX 4050 6GB",
        RAM: "16GB DDR4",
        SSD: "512GB",
        Pin: "3 cell 51Wh",
        "Bảo hành": "2 năm",
      },
    },
    {
      id: "9",
      title: "HP Pavilion Gaming Desktop",
      category: "PC",
      price: 18990000,
      quantity: 4,
      description: "PC gaming cấu hình cao, RTX 3060, i5-12400F, 16GB RAM.",
      image: "https://via.placeholder.com/400x300?text=HP+Gaming+Desktop",
      specs: {
        CPU: "Intel Core i5-12400F",
        GPU: "RTX 3060 12GB",
        RAM: "16GB DDR4",
        SSD: "1TB",
        PSU: "500W",
        Case: "Mid Tower",
        "Bảo hành": "2 năm",
      },
    },
  ];
  saveGears();
}

filterAndRender();
updateCartCountDisplay();
updateAdminButtons();
