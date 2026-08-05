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
    // Try API first (Supabase-backed). Fallback to local JSON for dev/offline.
    let response = await fetch('/api/products');
    if (!response.ok) {
      response = await fetch('data/fertilizers.json');
    }
    if (!response.ok) throw new Error('Could not load fertilizer catalog.');
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

function computeTotals() {
  const rows = getCartRows();
  const subtotal = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);
  const gst = +(subtotal * 0.18).toFixed(2); // 18% GST
  const delivery_charge = subtotal > 1000 ? 0 : 50; // simple rule
  const total = +(subtotal + gst + delivery_charge).toFixed(2);
  return { subtotal, gst, delivery_charge, total };
}

async function createRazorpayOrder(amount) {
  const resp = await fetch('/api/payment/create-order', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  if (!resp.ok) throw new Error('Unable to create payment order');
  return resp.json();
}

async function verifyPayment(payload) {
  const resp = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return resp.json();
}

async function saveOrderToServer(orderPayload) {
  const resp = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
  if (!resp.ok) throw new Error('Failed to save order');
  return resp.json();
}

// Checkout form handling when present on checkout.html
if (document.location.pathname.endsWith('/checkout.html') && checkoutForm) {
  const summaryEl = document.getElementById('checkoutSummary');
  function renderCheckoutSummary() {
    const rows = getCartRows();
    if (!rows.length) return summaryEl.innerHTML = '<p>Your cart is empty.</p>';
    const totals = computeTotals();
    summaryEl.innerHTML = `
      <h3>Summary</h3>
      ${rows.map(r=>`<p>${r.product.name} x ${r.quantity} <strong>${formatPrice(r.product.price * r.quantity)}</strong></p>`).join('')}
      <p>Subtotal: <strong>${formatPrice(totals.subtotal)}</strong></p>
      <p>GST: <strong>${formatPrice(totals.gst)}</strong></p>
      <p>Delivery: <strong>${formatPrice(totals.delivery_charge)}</strong></p>
      <p class="summary-total">Grand Total: <strong>${formatPrice(totals.total)}</strong></p>
    `;
  }
  renderCheckoutSummary();

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getCartRows().length) return checkoutStatus.textContent = 'Cart is empty.';
    if (!checkoutForm.checkValidity()) return checkoutStatus.textContent = 'Please complete required fields.';

    checkoutStatus.textContent = 'Creating payment...';
    try {
      const totals = computeTotals();
      const razorOrder = await createRazorpayOrder(totals.total);

      // fetch razorpay key id from server (public)
      const cfgResp = await fetch('/api/config');
      const cfg = cfgResp.ok ? await cfgResp.json() : {};

      const options = {
        key: cfg.razorpayKeyId || '',
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        name: 'Soilixa',
        description: 'Order Payment',
        order_id: razorOrder.id,
        handler: async function (response) {
          // Verify signature on server
          checkoutStatus.textContent = 'Verifying payment...';
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (!verification.verified) {
            checkoutStatus.textContent = 'Payment verification failed.';
            return;
          }

          // Save order to DB
          const form = new FormData(checkoutForm);
          const payload = Object.fromEntries(form.entries());
          const items = getCartRows().map((r) => ({ product_id: r.product.id, name: r.product.name, price: r.product.price, quantity: r.quantity, total: +(r.product.price * r.quantity).toFixed(2) }));
          const orderPayload = {
            ...payload,
            items,
            subtotal: totals.subtotal,
            gst: totals.gst,
            delivery_charge: totals.delivery_charge,
            total_amount: totals.total,
            payment_status: 'paid',
            payment_method: 'razorpay',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id
          };

          const saved = await saveOrderToServer(orderPayload);

          // Clear cart and redirect to success page
          cart = [];
          saveCart();
          window.location.href = `order-success.html?order=${encodeURIComponent(saved.order.order_number)}`;
        },
        modal: { escape: true }
      };

      const rzp = new Razorpay(options);
      rzp.open();
      checkoutStatus.textContent = 'Payment window opened.';
    } catch (err) {
      checkoutStatus.textContent = err.message || 'Payment initialization failed.';
    }
  });
}

// Order success page rendering
if (document.location.pathname.endsWith('/order-success.html')) {
  const params = new URLSearchParams(window.location.search);
  const orderNum = params.get('order');
  const successMessage = document.getElementById('successMessage');
  const orderDetails = document.getElementById('orderDetails');
  const downloadInvoice = document.getElementById('downloadInvoice');
  const printInvoice = document.getElementById('printInvoice');

  async function loadOrder() {
    if (!orderNum) return successMessage.textContent = 'Order not found.';
    const resp = await fetch(`/api/orders/${encodeURIComponent(orderNum)}`);
    if (!resp.ok) return successMessage.textContent = 'Unable to load order.';
    const data = await resp.json();
    const { order, items } = data;
    successMessage.innerHTML = `<p>Thank you. Your order <strong>${order.order_number}</strong> is confirmed.</p><p>Payment: ${order.payment_status} · ${order.razorpay_payment_id || ''}</p>`;
    orderDetails.innerHTML = `
      <h3>Order Details</h3>
      <p>${order.customer_name} · ${order.phone}</p>
      <p>${order.address}</p>
      <div>${items.map(it=>`<p>${it.product_name} x ${it.quantity} · ₹${it.total}</p>`).join('')}</div>
      <p>Total Paid: ₹${order.total_amount}</p>
    `;

    downloadInvoice?.addEventListener('click', async () => {
      const invResp = await fetch(`/api/orders/${encodeURIComponent(orderNum)}/invoice`);
      if (!invResp.ok) return alert('Unable to download invoice');
      const blob = await invResp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    printInvoice?.addEventListener('click', () => window.print());
  }

  loadOrder();
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
