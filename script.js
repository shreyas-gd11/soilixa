const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const productsGrid = document.getElementById("productsGrid");
const fertilizerState = document.getElementById("fertilizerState");
const fertilizerSearch = document.getElementById("fertilizerSearch");
const filterChips = document.querySelectorAll(".filter-chip");
const productDetailSection = document.getElementById("product-detail");
const productDetail = document.getElementById("productDetail");
const recommendationGrid = document.getElementById("recommendationGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const orderSummary = document.getElementById("orderSummary");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutStatus = document.getElementById("checkoutStatus");

let fertilizers = [];
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("soilixaCart") || "[]");

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const normalize = (value) => String(value || "").toLowerCase();
const imageFallback = "this.closest('.product-card, .detail-image, .cart-row')?.classList.add('image-missing'); this.remove();";

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

function saveCart() {
  localStorage.setItem("soilixaCart", JSON.stringify(cart));
}

function showSkeletons() {
  if (!productsGrid) return;
  productsGrid.innerHTML = Array.from({ length: 6 }, () => (
    `<div class="product-card skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-line wide"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>`
  )).join("");
}

async function loadFertilizers() {
  showSkeletons();

  try {
    const response = await fetch("data/fertilizers.json");
    if (!response.ok) throw new Error("Could not load fertilizer catalog.");
    fertilizers = await response.json();
    fertilizerState.textContent = "";
    renderProducts();
    renderRecommendations("Sugarcane");
    renderCart();
    handleHashRoute();
  } catch (error) {
    if (productsGrid) productsGrid.innerHTML = "";
    if (fertilizerState) {
      fertilizerState.innerHTML = `<div class="state-card error-state">Unable to load fertilizers. Please try again after refreshing the page.</div>`;
    }
  }
}

function getFilteredProducts() {
  const query = normalize(fertilizerSearch?.value);
  return fertilizers.filter((product) => {
    const inCategory = activeCategory === "All" || product.category === activeCategory;
    const searchable = [
      product.name,
      product.category,
      product.sourceCategory,
      product.shortDescription,
      product.description,
      product.recommendedCrops.join(" ")
    ].join(" ");
    return inCategory && normalize(searchable).includes(query);
  });
}

function renderProducts() {
  if (!productsGrid) return;
  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productsGrid.innerHTML = "";
    fertilizerState.innerHTML = `<div class="state-card">No fertilizers found. Try another search or category.</div>`;
    return;
  }

  fertilizerState.textContent = `${filtered.length} products available`;
  productsGrid.innerHTML = filtered.map((product) => createProductCard(product)).join("");
}

function createProductCard(product, compact = false) {
  return `
    <article class="product-card ${compact ? "compact-card" : ""}">
      <button class="product-image-button" type="button" data-view-product="${product.id}" aria-label="View ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="${imageFallback}">
        <span class="image-fallback">${product.name}</span>
      </button>
      <div class="badge-row">${product.badges.map((badge) => `<span>${badge}</span>`).join("")}</div>
      <p class="product-category">${product.category}</p>
      <h3>${product.name}</h3>
      <p class="product-description">${product.shortDescription}</p>
      <div class="product-meta">
        <span>${product.unit}</span>
        <strong>${formatPrice(product.price)}</strong>
      </div>
      <div class="product-actions">
        <button class="btn-secondary" type="button" data-view-product="${product.id}">View Details</button>
        <button class="btn-primary" type="button" data-buy-product="${product.id}">Buy Now</button>
      </div>
    </article>
  `;
}

function renderProductDetail(id) {
  const product = fertilizers.find((item) => item.id === id);
  if (!product || !productDetail || !productDetailSection) return;

  productDetailSection.hidden = false;
  productDetail.innerHTML = `
    <div class="detail-grid">
      <div class="detail-image">
        <img src="${product.image}" alt="${product.name}" onerror="${imageFallback}">
        <span class="image-fallback">${product.name}</span>
      </div>
      <div class="detail-content">
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <div class="badge-row">${product.badges.map((badge) => `<span>${badge}</span>`).join("")}</div>
        <p class="detail-price">${formatPrice(product.price)} <span>${product.unit}</span></p>
        <p class="detail-copy">${product.description}</p>
        <div class="detail-lists">
          <div>
            <h3>Benefits</h3>
            <ul>${product.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}</ul>
          </div>
          <div>
            <h3>Recommended Crops</h3>
            <p>${product.recommendedCrops.join(", ")}</p>
            <h3>Recommended Growth Stage</h3>
            <p>${product.growthStage}</p>
          </div>
        </div>
        <label class="quantity-label" for="detailQty">Quantity</label>
        <div class="quantity-row">
          <input id="detailQty" type="number" min="1" value="1">
          <button class="btn-primary" type="button" data-buy-product="${product.id}" data-use-detail-qty="true">Buy Now</button>
        </div>
      </div>
    </div>
  `;
  productDetailSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRecommendations(crop) {
  if (!recommendationGrid) return;
  const cropRecommendations = fertilizers.filter((product) => (
    ["azois", "eco-humic", "evolve", "calcium-nitrate"].includes(product.id) ||
    product.recommendedCrops.includes(crop)
  )).slice(0, 4);

  recommendationGrid.innerHTML = cropRecommendations.map((product) => createProductCard(product, true)).join("");
}

function addToCart(id, quantity = 1) {
  const product = fertilizers.find((item) => item.id === id);
  if (!product) return;
  const amount = Math.max(1, Number(quantity) || 1);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({ id, quantity: amount });
  }

  saveCart();
  renderCart();
  window.location.hash = "cart";
}

function updateCartQuantity(id, quantity) {
  const amount = Number(quantity);
  if (amount < 1) {
    cart = cart.filter((item) => item.id !== id);
  } else {
    cart = cart.map((item) => item.id === id ? { ...item, quantity: amount } : item);
  }
  saveCart();
  renderCart();
}

function getCartRows() {
  return cart
    .map((item) => ({ ...item, product: fertilizers.find((product) => product.id === item.id) }))
    .filter((item) => item.product);
}

function renderCart() {
  const rows = getCartRows();
  const totalItems = rows.reduce((sum, item) => sum + item.quantity, 0);
  const total = rows.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = totalItems;

  if (!cartItems || !orderSummary) return;

  if (!rows.length) {
    cartItems.innerHTML = `<div class="state-card">Your cart is empty. Add fertilizers to begin checkout.</div>`;
    orderSummary.innerHTML = `<p>No products selected.</p>`;
    return;
  }

  cartItems.innerHTML = rows.map(({ product, quantity }) => `
    <div class="cart-row">
      <img src="${product.image}" alt="${product.name}" onerror="${imageFallback}">
      <div>
        <strong>${product.name}</strong>
        <p>${product.unit} · ${formatPrice(product.price)}</p>
      </div>
      <input type="number" min="0" value="${quantity}" data-cart-qty="${product.id}" aria-label="Quantity for ${product.name}">
      <button type="button" class="text-button" data-remove-product="${product.id}">Remove</button>
    </div>
  `).join("");

  orderSummary.innerHTML = `
    <h3>Order Summary</h3>
    ${rows.map(({ product, quantity }) => `<p><span>${product.name} x ${quantity}</span><strong>${formatPrice(product.price * quantity)}</strong></p>`).join("")}
    <p class="summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></p>
  `;
}

function handleHashRoute() {
  const match = window.location.hash.match(/^#fertilizer\/(.+)/);
  if (match) {
    renderProductDetail(match[1]);
  }
}

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeCategory = chip.dataset.category;
    filterChips.forEach((item) => item.classList.toggle("active", item === chip));
    renderProducts();
  });
});

fertilizerSearch?.addEventListener("input", renderProducts);

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view-product]");
  const buyButton = event.target.closest("[data-buy-product]");
  const removeButton = event.target.closest("[data-remove-product]");

  if (viewButton) {
    window.location.hash = `fertilizer/${viewButton.dataset.viewProduct}`;
    renderProductDetail(viewButton.dataset.viewProduct);
  }

  if (buyButton) {
    const quantity = buyButton.dataset.useDetailQty ? document.getElementById("detailQty")?.value : 1;
    addToCart(buyButton.dataset.buyProduct, quantity);
  }

  if (removeButton) {
    updateCartQuantity(removeButton.dataset.removeProduct, 0);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-cart-qty]")) {
    updateCartQuantity(event.target.dataset.cartQty, event.target.value);
  }
});

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!getCartRows().length) {
    checkoutStatus.textContent = "Please add at least one fertilizer before checkout.";
    return;
  }

  if (!checkoutForm.checkValidity()) {
    checkoutStatus.textContent = "Please complete all delivery fields.";
    return;
  }

  checkoutStatus.textContent = "Order received. Soilixa will confirm delivery and payment options shortly.";
  cart = [];
  saveCart();
  renderCart();
  checkoutForm.reset();
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formStatus.textContent = "Please fill all fields correctly before submitting.";
      return;
    }

    formStatus.textContent = "Thanks! Your request has been received. Soilixa will contact you soon.";
    contactForm.reset();
  });
}

window.SoilixaFertilizerAPI = {
  getAll: () => fertilizers,
  getByCrop: (crop) => fertilizers.filter((product) => product.recommendedCrops.some((item) => normalize(item) === normalize(crop) || normalize(item) === "all crops")),
  addToCart
};

window.addEventListener("hashchange", handleHashRoute);
loadFertilizers();
