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
const themeToggle = document.getElementById("themeToggle");

let fertilizers = [];
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("soilixaCart") || "[]");
let currentLanguage = localStorage.getItem("soilixaLanguage") || "en";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const normalize = (value) => String(value || "").toLowerCase();
const defaultProductImage = "/images/default-fertilizer.png";
const normalizeProductId = (value) => String(value ?? "").trim();
const imageFallback = "this.onerror = null; this.src = '/images/default-fertilizer.png';";

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

const translations = {
  en: {
    "nav.about": "About",
    "nav.services": "Services",
    "nav.fertilizers": "🌱 Fertilizers",
    "nav.howItWorks": "How It Works",
    "nav.whyUs": "Why Us",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "hero.eyebrow": "Data-Driven Agriculture",
    "hero.title": "Smart Farming Starts with Healthy Soil",
    "hero.subtitle": "Soilixa helps farmers with soil testing, crop guidance, and scientific farming advice.",
    "hero.cta": "Get Started",
    "promise.title": "Our Promise to Farmers",
    "promise.subtitle": "Helping Farmers Grow Better with Trusted Organic Solutions.",
    "promise.item1": "Premium Quality Fertilizers",
    "promise.item2": "Farmer-First Support",
    "promise.item3": "Supporting Sustainable Farming",
    "promise.item4": "Trusted Service",
    "about.eyebrow": "About Soilixa",
    "about.title": "Helping Farmers Make Better Decisions",
    "about.copy1": "Soilixa is an early-stage agriculture startup focused on helping farmers improve yield through practical soil-based decisions. We combine soil data with expert guidance so farmers can choose the right crop strategy at the right time.",
    "about.copy2": "Our mission is to support sustainable and efficient farming with easy-to-understand recommendations that work in real field conditions.",
    "services.eyebrow": "Our Services",
    "services.title": "Simple Support, Strong Results",
    "services.card1Title": "Soil Analysis & Insights",
    "services.card1Text": "Understand soil health, nutrient levels, and key factors affecting crop productivity.",
    "services.card2Title": "Crop Recommendation Guidance",
    "services.card2Text": "Get crop suggestions based on local conditions, soil type, and field goals.",
    "services.card3Title": "Fertilizer & Nutrient Advice",
    "services.card3Text": "Use balanced nutrient plans to improve growth while avoiding unnecessary fertilizer use.",
    "marketplace.eyebrow": "Fertilizer Marketplace",
    "marketplace.title": "Recommended Inputs, Ready to Order",
    "marketplace.copy": "Browse verified products, compare pack sizes and prices, and complete your order directly through Soilixa.",
    "marketplace.cta": "Need Help Choosing Fertilizers",
    "marketplace.searchLabel": "Search fertilizers",
    "marketplace.searchPlaceholder": "Search AZOIS, Borax, Humic, Calcium",
    "marketplace.filterAll": "All",
    "marketplace.filterOrganic": "Organic Manure",
    "marketplace.filterBio": "Biofertilizers",
    "marketplace.filterGrowth": "Plant Growth Promoters",
    "marketplace.filterMicronutrients": "Micronutrients",
    "marketplace.filterSoil": "Soil Conditioners",
    "checkout.orderEyebrow": "Your Order",
    "checkout.cartTitle": "Shopping Cart",
    "checkout.checkoutEyebrow": "Checkout",
    "checkout.checkoutTitle": "Delivery Details",
    "checkout.farmerName": "Farmer Name",
    "checkout.mobileNumber": "Mobile Number",
    "checkout.deliveryAddress": "Delivery Address",
    "checkout.village": "Village",
    "checkout.taluk": "Taluk",
    "checkout.district": "District",
    "checkout.state": "State",
    "checkout.pinCode": "PIN Code",
    "checkout.paymentHelp": "Place your order now and complete payment using the UPI details shown below.",
    "checkout.placeOrder": "Place Order",
    "workflow.eyebrow": "How It Works",
    "workflow.title": "From Soil Data to Better Farming",
    "workflow.step1": "Farmer submits soil details",
    "workflow.step2": "Soilixa analyzes data",
    "workflow.step3": "Expert-backed recommendations provided",
    "workflow.step4": "Continuous guidance during crop cycle",
    "whyUs.eyebrow": "Why Choose Us",
    "whyUs.title": "Built for Real Farm Challenges",
    "whyUs.item1": "Scientific approach",
    "whyUs.item2": "Expert-backed advice",
    "whyUs.item3": "Focus on real farmer problems",
    "whyUs.item4": "Simple and easy guidance",
    "contact.eyebrow": "Contact Us",
    "contact.title": "🌱 Contact Soilixa",
    "contact.subtitle": "Have questions about fertilizers, organic farming, or your order?",
    "contact.support": "Our team is ready to help you.",
    "contact.phoneLabel": "📞 Phone",
    "contact.emailLabel": "✉️ Email",
    "contact.formName": "Name",
    "contact.formNamePlaceholder": "Your Name",
    "contact.formPhone": "Phone",
    "contact.formPhonePlaceholder": "Your Phone Number",
    "contact.formEmail": "Email",
    "contact.formEmailPlaceholder": "you@example.com",
    "contact.formMessage": "Message",
    "contact.formMessagePlaceholder": "Tell us about your farm needs",
    "contact.submit": "Submit",
    "footer.copy": "Empowering Farmers with Smart Decisions"
  },
  kn: {
    "nav.about": "ನಮ್ಮ ಬಗ್ಗೆ",
    "nav.services": "ಸೇವೆಗಳು",
    "nav.fertilizers": "🌱 ರಸಗೊಬ್ಬರಗಳು",
    "nav.howItWorks": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    "nav.whyUs": "ನಾವು ಏಕೆ",
    "nav.contact": "ಸಂಪರ್ಕ",
    "nav.cart": "ಗಾಡಿ",
    "hero.eyebrow": "ಡೇಟಾ-ಆಧಾರಿತ ಕೃಷಿ",
    "hero.title": "ಆರೋಗ್ಯಕರ ಮಣ್ಣಿನಿಂದ ಚುಚ್ಚುವ ಕೃಷಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ",
    "hero.subtitle": "ಸೊಲಿಕ্সಾ ರೈತರಿಗೆ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ, ಬೆಳೆ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ವೈಜ್ಞಾನಿಕ ಕೃಷಿ ಸಲಹೆ ನೀಡುತ್ತದೆ.",
    "hero.cta": "ಪ್ರಾರಂಭಿಸು",
    "promise.title": "ರೈತರಿಗೆ ನಮ್ಮ ಬದ್ಧತೆ",
    "promise.subtitle": "ಗುಣಮಟ್ಟದ ಸಾವಯವ ಪರಿಹಾರಗಳೊಂದಿಗೆ ಉತ್ತಮ ಬೆಳೆ ಬೆಳವಣಿಗೆಗೆ ನಿಮ್ಮ ಸಹಾಯ.",
    "promise.item1": "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ರಸಗೊಬ್ಬರಗಳು",
    "promise.item2": "ರೈತ-ಮೊದಲ ಬೆಂಬಲ",
    "promise.item3": "ಸುಸ್ಥಿರ ಕೃಷಿಗೆ ಬೆಂಬಲ",
    "promise.item4": "ವಿಶ್ವಾಸಾರ್ಹ ಸೇವೆ",
    "about.eyebrow": "ಸೊಲಿಕ್ಸಾ ಬಗ್ಗೆ",
    "about.title": "ರೈತರು ಉತ್ತಮ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುವುದು",
    "about.copy1": "ಸೊಲಿಕ್ಸಾ ಒಂದು ಆರಂಭಿಕ ಕೃಷಿ ಸ್ಟಾರ್ಟ್ಅಪ್ ಆಗಿದ್ದು, ರೈತರು Practical soil-based ನಿರ್ಧಾರಗಳಿಂದ ಬೆಳೆ ಲಾಭವನ್ನು ಹೆಚ್ಚಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ನಾವು ಮಣ್ಣಿನ ಡೇಟಾ ಮತ್ತು ತಜ್ಞರ ಮಾರ್ಗದರ್ಶನವನ್ನು ಸಂಯೋಜಿಸಿ ರೈತರು ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಸರಿಯಾದ ಬೆಳೆ ಜೋಡಣೆ ಆಯ್ಕೆ ಮಾಡಬಹುದು.",
    "about.copy2": "ನಮ್ಮ ಗುರಿ ಸುಸ್ಥಿರ ಮತ್ತು ಪರಿಣಾಮಕಾರಿ ಕೃಷಿಗೆ ಸಹಾಯ ಮಾಡುವುದು, ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಸಲಹೆಗಳೊಂದಿಗೆ ವಾಸ್ತವಿಕ ಕ್ಷೇತ್ರ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಂತೆ ಮಾಡುವುದು.",
    "services.eyebrow": "ನಮ್ಮ ಸೇವೆಗಳು",
    "services.title": "ಸರಳ ಬೆಂಬಲ, ಬಲವಾದ ಫಲಿತಾಂಶ",
    "services.card1Title": "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಒಳನೋಟಗಳು",
    "services.card1Text": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ಪೋಷಕಾಂಶ ಮಟ್ಟಗಳು ಮತ್ತು ಬೆಳೆ ಉತ್ಪಾದನೆಗೆ ಪರಿಣಾಮ ಬೀರುವ ಪ್ರಮುಖ ಅಂಶಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
    "services.card2Title": "ಬೆಳೆ ಶಿಫಾರಸು ಮಾರ್ಗದರ್ಶನ",
    "services.card2Text": "ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗಳು, ಮಣ್ಣಿನ ರೀತಿಯ ಮತ್ತು ಕ್ಷೇತ್ರದ ಗುರಿಗಳ ಆಧಾರದ ಮೇಲೆ ಬೆಳೆ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
    "services.card3Title": "ರಸಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕ ಸಲಹೆಗಳು",
    "services.card3Text": "ಅತ್ಯುತ್ತಮ ಬೆಳವಣಿಗೆಗಾಗಿ ಸಮತೋಲಿತ ಪೋಷಕ ಯೋಜನೆಗಳನ್ನು ಬಳಸಿ ಮತ್ತು ಅನಗತ್ಯ ರಸಗೊಬ್ಬರ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ.",
    "marketplace.eyebrow": "ರಸಗೊಬ್ಬರ ಮಾರುಕಟ್ಟೆ",
    "marketplace.title": "ಶಿಫಾರಸು ಮಾಡಲಾದ ಇನ್ಪುಟ್‌ಗಳು, ಈಗ ಆರ್ಡರ್ ಮಾಡಬಹುದಾಗಿದೆ",
    "marketplace.copy": "ಪರಿಶೀಲಿತ ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ, ಪ್ಯಾಕ್ ಗಾತ್ರ ಮತ್ತು ಬೆಲೆಯನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ಸೊಲಿಕ್ಸಾದ ಮೂಲಕ ನೇರವಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿ.",
    "marketplace.cta": "ರಸಗೊಬ್ಬರ ಆಯ್ಕೆಗೆ ಸಹಾಯ ಬೇಕೇ?",
    "marketplace.searchLabel": "ರಸಗೊಬ್ಬರಗಳನ್ನು ಹುಡುಕಿ",
    "marketplace.searchPlaceholder": "AZOIS, Borax, Humic, Calcium ಅನ್ನು ಹುಡುಕಿ",
    "marketplace.filterAll": "ಎಲ್ಲಾ",
    "marketplace.filterOrganic": "ಸಾವಯವ್ ಗೊಬ್ಬರ",
    "marketplace.filterBio": "ಜೈವಿಕ ರಸಗೊಬ್ಬರಗಳು",
    "marketplace.filterGrowth": "ಬೆಳೆ ಬೆಳವಣಿಗೆ ಪ್ರಚಾರಕರು",
    "marketplace.filterMicronutrients": "ಸೂಕ್ಷ್ಮಪೋಷಕಗಳು",
    "marketplace.filterSoil": "ಮಣ್ಣಿನ ಪರಿಸ್ಥಿತಿಗೊಳಿಸುವವರು",
    "checkout.orderEyebrow": "ನಿಮ್ಮ ಆರ್ಡರ್",
    "checkout.cartTitle": "ಶಾಪಿಂಗ್ ಗಾಡಿ",
    "checkout.checkoutEyebrow": "ಚೆಕ್ಔಟ್",
    "checkout.checkoutTitle": "ವಿತರಣಾ ವಿವರಗಳು",
    "checkout.farmerName": "ರೈತ ಹೆಸರು",
    "checkout.mobileNumber": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "checkout.deliveryAddress": "ವಿತರಣಾ ವಿಳಾಸ",
    "checkout.village": "ಹಳ್ಳಿಯ ಹೆಸರು",
    "checkout.taluk": "ತಾಲೂಕು",
    "checkout.district": "ಜಿಲ್ಲೆ",
    "checkout.state": "ರಾಜ್ಯ",
    "checkout.pinCode": "ಪಿನ್ ಕೋಡ್",
    "checkout.paymentHelp": "ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ಈಗದ್ವಾರಾ ಇರಿಸಿ ಮತ್ತು ಕೆಳಗಿನ ಯುಪಿಐ ವಿವರಗಳನ್ನು ಬಳಸಿ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
    "checkout.placeOrder": "ಆರ್ಡರ್ ಹಾಕಿ",
    "workflow.eyebrow": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    "workflow.title": "ಮಣ್ಣಿನ ಡೇಟಾದಿಂದ ಉತ್ತಮ ಕೃಷಿಗೆ",
    "workflow.step1": "ರೈತ ಮಣ್ಣಿನ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸುತ್ತಾನೆ",
    "workflow.step2": "ಸೊಲಿಕ್ಸಾ ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ",
    "workflow.step3": "ತಜ್ಞರ ಆಧಾರಿತ ಶಿಫಾರಸುಗಳನ್ನು ಒದಗಿಸಲಾಗುತ್ತದೆ",
    "workflow.step4": "ಬೆಳೆ ಚಕ್ರದ ಅವಧಿಯಲ್ಲಿ ನಿರಂತರ ಮಾರ್ಗದರ್ಶನ",
    "whyUs.eyebrow": "ನಾವು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು",
    "whyUs.title": "ವಾಸ್ತವಿಕ ಕೃಷಿ ಸವಾಲುಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ",
    "whyUs.item1": "ವಿಜ್ಞಾನ grounded approach",
    "whyUs.item2": "ತಜ್ಞರ ಆಧಾರಿತ ಸಲಹೆ",
    "whyUs.item3": "ವಾಸ್ತವಿಕ ರೈತರ ಸಮಸ್ಯೆಗಳಿಗೆ ಗಮನ",
    "whyUs.item4": "ಸರಳ ಮತ್ತು ಸುಲಭ ಮಾರ್ಗದರ್ಶನ",
    "contact.eyebrow": "ಸಂಪರ್ಕಿಸಿ",
    "contact.title": "🌱 ಸೊಲಿಕ್ಸಾ ಜೊತೆ ಮಾತನಾಡಿ",
    "contact.subtitle": "ರಸಗೊಬ್ಬರಗಳು, ಸಾವಯವ ಕೃಷಿ ಅಥವಾ ನಿಮ್ಮ ಆರ್ಡರ್ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
    "contact.support": "ನಿಮ್ಮ ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ತಂಡ ಸಿದ್ಧವಾಗಿದೆ.",
    "contact.phoneLabel": "📞 ಫೋನ್",
    "contact.emailLabel": "✉️ ಇಮೇಲ್",
    "contact.formName": "ಹೆಸರು",
    "contact.formNamePlaceholder": "ನಿಮ್ಮ ಹೆಸರು",
    "contact.formPhone": "ಫೋನ್",
    "contact.formPhonePlaceholder": "ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ",
    "contact.formEmail": "ಇಮೇಲ್",
    "contact.formEmailPlaceholder": "ನಿಮ್ಮ ಇಮೇಲ್",
    "contact.formMessage": "ಸಂದೇಶ",
    "contact.formMessagePlaceholder": "ನಿಮ್ಮ Fazenda ಅಗತ್ಯಗಳನ್ನು ಹೇಳಿ",
    "contact.submit": "ಸಲ್ಲಿಸಿ",
    "footer.copy": "ರೈತರಿಗೆ ಚುಚ್ಚುವ ತೀರ್ಮಾನಗಳೊಂದಿಗೆ ಅಧಿಕಾರ ನೀಡುವುದು"
  }
};

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "🌙 Dark" : "☀️ Light";
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  }
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("soilixaLanguage", language);
  document.documentElement.lang = language === "kn" ? "kn" : "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const value = translations[language]?.[key];
    if (value) element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    const value = translations[language]?.[key];
    if (value) element.placeholder = value;
  });
  document.querySelectorAll(".lang-switcher .header-pill").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === language);
  });
}

function initUi() {
  const savedTheme = localStorage.getItem("soilixaTheme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);
  setLanguage(currentLanguage);
}

function asStringList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim());
  if (typeof value !== 'string') return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function normalizeProductRecord(product) {
  const recommendedCrops = asStringList(product.recommended_crops || product.recommendedCrops || product.crop || product.category);

  return {
    id: normalizeProductId(product.id ?? product.product_id),
    name: product.name || product.product_name || product.productName || 'Untitled Product',
    price: Number(product.price) || 0,
    unit: product.unit || '',
    category: product.category || '',
    sourceCategory: product.source_category || product.sourceCategory || '',
    badges: asStringList(product.badges),
    image: product.image_url || product.image || defaultProductImage,
    shortDescription: product.short_description || product.shortDescription || product.description || '',
    description: product.description || '',
    benefits: asStringList(product.benefits),
    recommendedCrops: recommendedCrops.length ? recommendedCrops : ['All crops'],
    growthStage: product.growth_stage || product.growthStage || '',
    is_available: product.is_available,
    stock_quantity: Number(product.stock_quantity) || 0
  };
}

async function loadFertilizers() {
  showSkeletons();

  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Unable to load fertilizer catalog from API.');
    }

    const data = await response.json();
    const normalizedProducts = Array.isArray(data)
      ? data.map(normalizeProductRecord).filter((item) => item.is_available && item.stock_quantity > 0)
      : [];

    fertilizers = normalizedProducts;

    if (!fertilizers.length) {
      throw new Error('No available products found.');
    }

    fertilizerState.textContent = "";
    renderProducts();
    renderRecommendations("Sugarcane");
    renderCart();
    handleHashRoute();
  } catch (error) {
    if (productsGrid) productsGrid.innerHTML = "";
    if (fertilizerState) {
      const isDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const message = isDevelopment && error?.message
        ? `Unable to load fertilizers.<br>Reason: ${error.message}`
        : 'Unable to load fertilizers. Please try again after refreshing the page.';
      fertilizerState.innerHTML = `<div class="state-card error-state">${message}</div>`;
    }
    console.error('Product load failed:', error);
  }
}

function computeTotals() {
  const rows = getCartRows();
  const total = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
  return Number(total.toFixed(2));
}

const UPI_ID = 'soilixa@upi';
const WHATSAPP_NUMBER = '+91 96064241XX';
const UPI_QR_SVG = `
  <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UPI QR code">
    <rect width="220" height="220" fill="#fff" rx="18" />
    <rect x="14" y="14" width="56" height="56" fill="#000" />
    <rect x="150" y="14" width="56" height="56" fill="#000" />
    <rect x="14" y="150" width="56" height="56" fill="#000" />
    <rect x="92" y="92" width="36" height="36" fill="#000" />
    <rect x="64" y="64" width="16" height="16" fill="#000" />
    <rect x="150" y="92" width="16" height="16" fill="#000" />
    <rect x="92" y="150" width="16" height="16" fill="#000" />
    <text x="110" y="192" font-size="16" font-family="Arial, sans-serif" text-anchor="middle" fill="#444">UPI</text>
  </svg>
`;

async function saveOrderToServer(orderPayload) {
  const resp = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
  if (!resp.ok) {
    let errorMessage = 'Failed to save order';
    try {
      const body = await resp.json();
      errorMessage = body?.error || body?.message || errorMessage;
    } catch {
      const textBody = await resp.text();
      errorMessage = textBody || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return resp.json();
}

function showManualPaymentCard(orderNumber) {
  const card = document.getElementById('manualPaymentCard');
  if (!card) return;

  card.classList.remove('hidden');
  card.innerHTML = `
    <div class="manual-payment-grid">
      <div class="manual-payment-qr">
        <div class="manual-payment-qr-image">${UPI_QR_SVG}</div>
        <p class="manual-payment-id">UPI ID: <strong>${UPI_ID}</strong></p>
      </div>
      <div class="manual-payment-details">
        <p><strong>Order ID:</strong> ${orderNumber}</p>
        <p>Please complete your payment using the UPI QR code or UPI ID above.</p>
        <div class="warning-card">
          <p><strong>⚠️ PAYMENT CONFIRMATION REQUIRED</strong></p>
          <p>After completing your payment, please send the payment screenshot to our WhatsApp number: <strong>${WHATSAPP_NUMBER}</strong></p>
          <p><strong>Call this number to confirm your order.</strong></p>
          <p><strong>Please mention your Order ID while sending the payment screenshot.</strong></p>
          <p>Your order will be verified manually and confirmed once the payment is received.</p>
        </div>
      </div>
    </div>
  `;
}

const summaryEl = document.getElementById('checkoutSummary');
function renderCheckoutSummary() {
  if (!summaryEl) return;
  const rows = getCartRows();
  if (!rows.length) return summaryEl.innerHTML = '<p>Your cart is empty.</p>';
  const total = computeTotals();
  summaryEl.innerHTML = `
    <h3>Summary</h3>
    <p><strong>Products</strong></p>
    ${rows.map((row) => `<p>${row.product.name} x ${row.quantity} <strong>${formatPrice(row.product.price * row.quantity)}</strong></p>`).join('')}
    <p class="summary-total">Grand Total: <strong>${formatPrice(total)}</strong></p>
  `;
}
renderCheckoutSummary();

function validateCheckoutForm(form) {
  const requiredFields = [
    { name: 'farmerName', label: 'Customer Name' },
    { name: 'mobileNumber', label: 'Phone Number' },
    { name: 'deliveryAddress', label: 'Address' },
    { name: 'village', label: 'Village' },
    { name: 'district', label: 'District' },
    { name: 'state', label: 'State' },
    { name: 'pinCode', label: 'PIN Code' }
  ];

  const missing = requiredFields.filter((field) => !form.get(field.name)?.toString().trim());
  return missing;
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getCartRows().length) {
      checkoutStatus.textContent = 'Your cart is empty. Add products before placing an order.';
      return;
    }

    const form = new FormData(checkoutForm);
    const missingFields = validateCheckoutForm(form);
    if (missingFields.length) {
      checkoutStatus.textContent = 'Please complete all required fields before placing your order.';
      return;
    }

    checkoutStatus.textContent = 'Saving your order...';
    try {
      const totalAmount = computeTotals();
      const payload = {
        order_number: null,
        customer_name: form.get('farmerName')?.toString().trim(),
        phone: form.get('mobileNumber')?.toString().trim(),
        address: form.get('deliveryAddress')?.toString().trim(),
        village: form.get('village')?.toString().trim(),
        taluk: form.get('taluk')?.toString().trim() || null,
        district: form.get('district')?.toString().trim(),
        state: form.get('state')?.toString().trim(),
        pincode: form.get('pinCode')?.toString().trim(),
        total_amount: totalAmount,
        payment_status: 'Pending Payment',
        order_status: 'New',
        items: getCartRows().map((row) => ({ product_id: row.product.id, name: row.product.name, price: row.product.price, quantity: row.quantity, total: +(row.product.price * row.quantity).toFixed(2) }))
      };

      const saved = await saveOrderToServer(payload);
      const orderNumber = saved?.order?.order_number;
      if (!orderNumber) {
        throw new Error('Unable to place your order. Please try again.');
      }

      cart = [];
      saveCart();
      renderCart();
      window.location.href = `order-success.html?order=${encodeURIComponent(orderNumber)}`;
    } catch (err) {
      console.error('Order save failed:', err);
      checkoutStatus.textContent = 'Unable to place your order at the moment. Please try again.';
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
    successMessage.innerHTML = `
      <div class="order-success-card">
        <p class="success-icon">✅ Order Placed Successfully</p>
        <p>Thank you for choosing SoiliXa.</p>
        <p><strong>Order ID:</strong> ${order.order_number}</p>
        <p>Our SoiliXa team will contact you shortly to explain the recommended fertilizers and confirm your order.</p>
        <p>Please do not make any payment until our team contacts you.</p>
        <p><strong>WhatsApp:</strong> +91 96064241XX</p>
        <p><strong>Call:</strong> +91 96064241XX</p>
      </div>
    `;
    orderDetails.innerHTML = `
      <h3>Order Details</h3>
      <p>${order.customer_name} · ${order.phone}</p>
      <p>${order.address}</p>
      <div>${items.map(it=>`<p>${it.product_name} x ${it.quantity} · ₹${it.total}</p>`).join('')}</div>
      <p>Total Amount: ₹${order.total_amount}</p>
      <p><strong>Order Status:</strong> ${order.order_status || 'New'}</p>
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
  if (!productsGrid) {
    if (fertilizerState) {
      fertilizerState.innerHTML = '<div class="state-card error-state">The product catalog container is unavailable.</div>';
    }
    return;
  }

  if (!fertilizers.length) {
    productsGrid.innerHTML = "";
    if (fertilizerState) {
      fertilizerState.innerHTML = '<div class="state-card error-state">No available fertilizers were loaded.</div>';
    }
    return;
  }

  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productsGrid.innerHTML = "";
    if (fertilizerState) {
      fertilizerState.innerHTML = '<div class="state-card">No fertilizers found. Try another search or category.</div>';
    }
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
  const normalizedId = normalizeProductId(id);
  const product = fertilizers.find((item) => normalizeProductId(item.id) === normalizedId);
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
    ["azois", "eco-humic", "evolve", "calcium-nitrate"].includes(normalizeProductId(product.id)) ||
    product.recommendedCrops.includes(crop)
  )).slice(0, 4);

  recommendationGrid.innerHTML = cropRecommendations.map((product) => createProductCard(product, true)).join("");
}

function addToCart(id, quantity = 1) {
  const normalizedId = normalizeProductId(id);
  const product = fertilizers.find((item) => normalizeProductId(item.id) === normalizedId);
  if (!product) return;
  const amount = Math.max(1, Number(quantity) || 1);
  const existing = cart.find((item) => normalizeProductId(item.id) === normalizedId);

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({ id: normalizedId, quantity: amount });
  }

  saveCart();
  renderCart();
  window.location.hash = "cart";
}

function updateCartQuantity(id, quantity) {
  const normalizedId = normalizeProductId(id);
  const amount = Number(quantity);
  if (amount < 1) {
    cart = cart.filter((item) => normalizeProductId(item.id) !== normalizedId);
  } else {
    cart = cart.map((item) => normalizeProductId(item.id) === normalizedId ? { ...item, quantity: amount } : item);
  }
  saveCart();
  renderCart();
}

function getCartRows() {
  return cart
    .map((item) => ({ ...item, product: fertilizers.find((product) => normalizeProductId(product.id) === normalizeProductId(item.id)) }))
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

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("soilixaTheme", nextTheme);
    applyTheme(nextTheme);
  });
}

document.querySelectorAll(".lang-switcher .header-pill").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

window.addEventListener("hashchange", handleHashRoute);
initUi();
loadFertilizers();
