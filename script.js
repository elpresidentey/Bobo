// Newsletter Form Handling
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('#emailInput');
    const emailError = document.getElementById('emailError');
    const successMessage = document.getElementById('newsletterSuccess');
    const submitButton = form.querySelector('button[type="submit"]');
    const buttonText = submitButton ? submitButton.querySelector('.button-text') : null;
    const buttonSpinner = submitButton ? submitButton.querySelector('.button-spinner') : null;
    
    // Reset previous states
    emailError.textContent = '';
    emailError.style.display = 'none';
    successMessage.style.display = 'none';
    emailInput.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-describedby');
    
    // Set focused attribute for CSS validation
    emailInput.setAttribute('focused', 'true');
    
    // Basic validation
    if (!emailInput.validity.valid) {
        if (emailInput.validity.valueMissing) {
            emailError.textContent = 'Email address is required';
        } else if (emailInput.validity.typeMismatch || emailInput.validity.patternMismatch) {
            emailError.textContent = 'Please enter a valid email address';
        } else {
            emailError.textContent = 'Please enter a valid email address';
        }
        emailError.style.display = 'block';
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.setAttribute('aria-describedby', 'emailError');
        return false;
    }
    
    // Show loading state
    if (buttonText && buttonSpinner) {
        buttonText.textContent = 'Subscribing...';
        buttonSpinner.style.display = 'inline-block';
        submitButton.disabled = true;
    }
    
    // Simulate API call (replace with actual API call)
    setTimeout(() => {
        // Reset button state
        if (buttonText && buttonSpinner) {
            buttonText.textContent = 'Subscribe';
            buttonSpinner.style.display = 'none';
            submitButton.disabled = false;
        }
        
        // Show success message
        successMessage.textContent = 'Thank you for subscribing to our newsletter!';
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
        emailInput.removeAttribute('focused');
        emailInput.removeAttribute('aria-invalid');
        emailInput.removeAttribute('aria-describedby');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }, 1500);
    
    return false;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-expanded', 
        mobileMenu.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-expanded', 'false');
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart count from localStorage or default to 0
    const cartCount = localStorage.getItem('cartCount') || 0;
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
    
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', subscribeNewsletter);
    }
    
    // Initialize mobile menu button
    const mobileMenuButton = document.querySelector('.mobile-menu');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }

    // Filter buttons (no inline handlers)
    const filterContainer = document.querySelector('.product-filters');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn && btn.hasAttribute('data-filter')) {
                e.preventDefault();
                filterProducts(btn.getAttribute('data-filter'));
            }
        });
    }

    // Search form submit
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('searchQuery');
            const q = (input && input.value || '').trim();
            if (!q) return false;
            runSearch(q);
            closeModal('searchModal');
            return false;
        });
    }

    // Shipping selection change
    const shippingSelect = document.getElementById('coDelivery');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', () => {
            currentShipping = shippingSelect.value;
            localStorage.setItem('coShipping', currentShipping);
            renderCheckoutSummary();
        });
    }

    // Promo apply button
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('coPromo');
    const promoMsg = document.getElementById('promoMessage');
    if (applyPromoBtn && promoInput) {
        applyPromoBtn.addEventListener('click', () => {
            const code = (promoInput.value || '').trim().toUpperCase();
            if (code && PROMO_CODES[code]) {
                currentPromo = code;
                localStorage.setItem('coPromo', currentPromo);
                if (promoMsg) {
                    promoMsg.textContent = `${code} applied: ${Math.round(PROMO_CODES[code]*100)}% off merchandise.`;
                    promoMsg.style.color = '#2ecc71';
                    promoMsg.style.display = 'block';
                }
                renderCheckoutSummary();
            } else {
                currentPromo = '';
                localStorage.removeItem('coPromo');
                if (promoMsg) {
                    promoMsg.textContent = 'Invalid promo code.';
                    promoMsg.style.color = '#ff6b6b';
                    promoMsg.style.display = 'block';
                }
                renderCheckoutSummary();
            }
        });
    }

    // Load more button
    const loadMoreBtn = document.querySelector('[data-action="load-more"]');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadMoreProducts();
        });
    }

    // Checkout form submit
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = checkoutForm.querySelector('button[type="submit"]');
            const text = button.querySelector('.button-text');
            const spinner = button.querySelector('.button-spinner');
            const name = document.getElementById('coName');
            const email = document.getElementById('coEmail');
            const phone = document.getElementById('coPhone');
            const city = document.getElementById('coCity');
            const address = document.getElementById('coAddress');
            // basic validation
            if (!name.value.trim() || !email.validity.valid || !phone.value.trim() || !city.value.trim() || !address.value.trim()) {
                const success = document.getElementById('checkoutSuccess');
                if (success) {
                    success.textContent = 'Please complete all required fields with a valid email.';
                    success.style.color = '#ff6b6b';
                    success.style.display = 'block';
                }
                return false;
            }
            // loading state
            if (text && spinner) {
                text.textContent = 'Processing...';
                spinner.style.display = 'inline-block';
                button.disabled = true;
            }
            payWithPaystack({
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                city: city.value.trim(),
                address: address.value.trim()
            });
            // Reset button state shortly after opening the payment widget
            setTimeout(() => {
                if (text && spinner) {
                    text.textContent = 'Pay Now';
                    spinner.style.display = 'none';
                    button.disabled = false;
                }
            }, 1500);
            return false;
        });
    }

    // If Paystack not configured, disable checkout and show top notice
    if (!isPaystackConfigured()) {
        const btn = document.querySelector('#checkoutForm button[type="submit"]');
        if (btn) {
            const txt = btn.querySelector('.button-text');
            if (txt) txt.textContent = 'Checkout disabled';
            btn.disabled = true;
            btn.title = 'Add your Paystack public key to enable payments';
        }
        const nb = document.getElementById('noticeBar');
        if (nb) nb.style.display = 'block';
    }

    // Close mobile menu when a nav link is clicked (for in-page anchors)
    const navLinksEl = document.getElementById('navLinks');
    if (navLinksEl) {
        navLinksEl.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                navLinksEl.classList.remove('active');
                const menuBtn = document.querySelector('.mobile-menu');
                if (menuBtn) {
                    menuBtn.classList.remove('active');
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});

// -----------------------------------------
// Product Data and Rendering
// -----------------------------------------

const productsData = [
    { id: 'p1', title: 'Aso Oke Kimono', description: 'Handwoven elegance with modern tailoring', price: 120000, category: 'clothing', badge: 'Limited', image: 'https://images.pexels.com/photos/3058391/pexels-photo-3058391.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p2', title: 'Adire Silk Scarf', description: 'Artisan-dyed silk, ultra-soft sheen', price: 45000, category: 'accessories', image: 'https://images.pexels.com/photos/3045642/pexels-photo-3045642.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p3', title: 'Beaded Evening Clutch', description: 'Meticulously beaded, heirloom-grade', price: 95000, category: 'accessories', image: 'https://images.unsplash.com/photo-1681545290284-679e6291c440?auto=format&fit=crop&w=800&h=600&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHlvcnViYSUyMGFzbyUyMG9rZXxlbnwwfDJ8MHx8fDI%3D' },
    { id: 'p4', title: 'Ankara Statement Blazer', description: 'Structured, bold, and bespoke', price: 150000, category: 'clothing', badge: 'New', image: 'https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p5', title: 'Leather Sandals', description: 'Full-grain leather with artisanal stitching', price: 70000, category: 'limited', badge: 'Limited', image: 'https://images.pexels.com/photos/1368483/pexels-photo-1368483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p6', title: 'Handcrafted Coral Necklace', description: 'Luxurious coral and gold-plated accents', price: 180000, category: 'limited', badge: 'Limited', image: 'https://images.pexels.com/photos/14538746/pexels-photo-14538746.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p7', title: 'Silk Kaftan', description: 'Floaty silhouette in premium silk', price: 135000, category: 'clothing', image: 'https://images.pexels.com/photos/16934252/pexels-photo-16934252.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p8', title: 'Gold-Trim Headwrap', description: 'Lightweight, versatile styling', price: 30000, category: 'accessories', image: 'https://images.pexels.com/photos/1820559/pexels-photo-1820559.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p9', title: 'Embroidered Cape', description: 'Statement cape with intricate motifs', price: 210000, category: 'limited', badge: 'Limited', image: 'https://images.pexels.com/photos/31004640/pexels-photo-31004640.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p10', title: 'Velvet Wrap Dress', description: 'Luxe velvet with a flattering silhouette', price: 160000, category: 'clothing', badge: 'Editors Pick', image: 'https://images.unsplash.com/photo-1564280263685-0e610aad6fb9?auto=format&fit=crop&w=800&h=600&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 'p11', title: 'Kente Weekender Duffle', description: 'Handwoven Kente with full-grain leather trims', price: 190000, category: 'limited', badge: 'Limited', image: 'https://images.pexels.com/photos/2916819/pexels-photo-2916819.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
    { id: 'p12', title: 'Ankara Panel Sneakers', description: 'Custom sneakers with Ankara accents', price: 85000, category: 'accessories', badge: 'New', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' }
];

let currentFilter = 'all';
let productsPerPage = 6;
let currentPage = 1;

// Replace with your actual Paystack public key (pk_test_... or pk_live_...)
const PAYSTACK_PUBLIC_KEY = 'pk_test_replace_with_your_key';

// Detect if Paystack is configured
const PAYSTACK_KEY_PLACEHOLDER = (PAYSTACK_PUBLIC_KEY || '').includes('replace_with_your_key');
function isPaystackConfigured() {
    return typeof PAYSTACK_PUBLIC_KEY === 'string' &&
           PAYSTACK_PUBLIC_KEY.startsWith('pk_') &&
           !PAYSTACK_KEY_PLACEHOLDER;
}

// Checkout config
const SHIPPING_OPTIONS = {
    standard: { label: 'Standard (2–5 days)', amount: 2500 },
    express: { label: 'Express (1–2 days)', amount: 6000 }
};
const PROMO_CODES = {
    VIP10: 0.10,
    BOBO20: 0.20
};
let currentShipping = localStorage.getItem('coShipping') || 'standard';
let currentPromo = localStorage.getItem('coPromo') || '';

// Helpers to update product images at runtime
function setProductImage(productId, imageUrl) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return false;
    product.image = imageUrl;
    renderProducts(true);
    return true;
}

function setProductImages(imageMap) {
    if (!imageMap || typeof imageMap !== 'object') return;
    Object.entries(imageMap).forEach(([id, url]) => {
        const product = productsData.find(p => p.id === id);
        if (product && url) product.image = url;
    });
    renderProducts(true);
}

// Image load handler to reveal image and hide skeleton
function handleImageLoaded(imgEl) {
    try {
        imgEl.classList.remove('loading');
        const container = imgEl.closest('.product-image');
        if (container) {
            container.classList.remove('loading');
            container.classList.add('ready');
        }
    } catch (_) { /* no-op */ }
}

const RESPONSIVE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

function getResponsiveSrcSet(url, id) {
    try {
        const widths = [400, 800, 1200];
        const urls = widths.map((w) => {
            try {
                const u = new URL(url, window.location.href);
                if (u.searchParams.has('w')) {
                    u.searchParams.set('w', String(w));
                    if (u.searchParams.has('h')) {
                        u.searchParams.set('h', String(Math.round(w * 0.75)));
                    }
                    return u.toString();
                }
            } catch (_) {}
            return `https://picsum.photos/seed/${id}/${w}/${Math.round(w * 0.75)}`;
        });
        return `${urls[0]} 400w, ${urls[1]} 800w, ${urls[2]} 1200w`;
    } catch (_) {
        return `https://picsum.photos/seed/${id}/400/300 400w, https://picsum.photos/seed/${id}/800/600 800w, https://picsum.photos/seed/${id}/1200/900 1200w`;
    }
}

function formatCurrencyNaira(amount) {
    try {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    } catch (_) {
        return `₦${amount}`;
    }
}

function getFilteredProducts() {
    if (currentFilter === 'all') return productsData;
    return productsData.filter(p => p.category === currentFilter);
}

function renderProducts(reset = false) {
    const grid = document.getElementById('productGrid');
    const loadMoreSection = document.getElementById('loadMoreSection');
    if (!grid) return;

    const filtered = getFilteredProducts();
    const totalToShow = currentPage * productsPerPage;
    const visible = filtered.slice(0, totalToShow);

    if (reset) grid.innerHTML = '';

    grid.innerHTML = visible.map(product => {
        const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const fallback = `https://picsum.photos/seed/${product.id}/800/600`;
        return `
            <div class="product-card" data-id="${product.id}">
                <div class=\"product-image has-image loading\">${badgeHtml}<img class=\"product-img loading\" src=\"${product.image}\" srcset=\"${getResponsiveSrcSet(product.image, product.id)}\" sizes=\"${RESPONSIVE_SIZES}\" alt=\"${product.title}\" width=\"800\" height=\"600\" loading=\"lazy\" decoding=\"async\" fetchpriority=\"low\" referrerpolicy=\"no-referrer\" onload=\"handleImageLoaded(this)\" onerror=\"this.onerror=null;this.src='${fallback}'\"></div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${formatCurrencyNaira(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                        <button class="btn-wishlist" onclick="toggleWishlistItem('${product.id}')" aria-label="Add to wishlist">♡</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateWishlistButtonsState();

    if (loadMoreSection) {
        if (visible.length >= filtered.length) {
            loadMoreSection.style.display = 'none';
        } else {
            loadMoreSection.style.display = 'block';
        }
    }
}

function filterProducts(category) {
    currentFilter = category;
    currentPage = 1;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const active = Array.from(buttons).find(b => b.textContent.toLowerCase().includes(category === 'all' ? 'all' : category));
    if (active) active.classList.add('active');
    renderProducts(true);
}

function loadMoreProducts() {
    const spinner = document.getElementById('loadMoreSpinner');
    const text = document.getElementById('loadMoreText');
    if (spinner && text) {
        spinner.style.display = 'inline-block';
        text.textContent = 'Loading...';
    }
    setTimeout(() => {
        currentPage += 1;
        renderProducts();
        if (spinner && text) {
            spinner.style.display = 'none';
            text.textContent = 'Load More';
        }
    }, 600);
}

// -----------------------------------------
// Cart Management
// -----------------------------------------

function getCart() {
    try { return JSON.parse(localStorage.getItem('cartItems')) || []; } catch (_) { return []; }
}

function saveCart(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = String(count);
    localStorage.setItem('cartCount', String(count));
}

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, title: product.title, price: product.price, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    updateCartUI();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    updateCartUI();
}

function changeCartQty(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    saveCart(cart);
    updateCartCount();
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!container || !totalEl) return;
    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.textContent = formatCurrencyNaira(0);
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <strong>${item.title}</strong>
                    <div>${formatCurrencyNaira(item.price)} × ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-wishlist" onclick="changeCartQty('${item.id}', -1)">−</button>
                    <button class="btn-wishlist" onclick="changeCartQty('${item.id}', 1)">+</button>
                    <button class="btn-primary" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    totalEl.textContent = formatCurrencyNaira(total);
}

function toggleCart() {
    openModal('cartModal');
    updateCartUI();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getShippingAmount() {
    const cart = getCart();
    if (!cart || cart.length === 0) return 0;
    const opt = SHIPPING_OPTIONS[currentShipping] || SHIPPING_OPTIONS.standard;
    return opt.amount;
}

function getDiscountAmount(subtotal) {
    const code = (currentPromo || '').trim().toUpperCase();
    const rate = PROMO_CODES[code];
    if (!rate) return 0;
    return Math.round(subtotal * rate);
}

function computeTotals() {
    const subtotal = getSubtotal();
    const shipping = getShippingAmount();
    const discount = getDiscountAmount(subtotal);
    const total = Math.max(0, subtotal + shipping - discount);
    return { subtotal, shipping, discount, total };
}

function renderCheckoutSummary() {
    const listEl = document.getElementById('checkoutSummaryList');
    const totalEl = document.getElementById('checkoutSummaryTotal');
    if (!listEl || !totalEl) return;
    const cart = getCart();
    if (cart.length === 0) {
        listEl.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.textContent = formatCurrencyNaira(0);
        return;
    }
    listEl.innerHTML = cart.map(item => `
        <div class="summary-row">
            <div class="title">${item.title}<span class="meta"> × ${item.quantity}</span></div>
            <div>${formatCurrencyNaira(item.price * item.quantity)}</div>
        </div>
    `).join('');
    const { subtotal, shipping, discount, total } = computeTotals();
    const subEl = document.getElementById('summarySubtotal');
    const shipEl = document.getElementById('summaryShipping');
    const discEl = document.getElementById('summaryDiscount');
    if (subEl) subEl.textContent = formatCurrencyNaira(subtotal);
    if (shipEl) shipEl.textContent = formatCurrencyNaira(shipping);
    if (discEl) discEl.textContent = '-' + formatCurrencyNaira(discount);
    totalEl.textContent = formatCurrencyNaira(total);
}

function clearCart() {
    saveCart([]);
    updateCartCount();
    updateCartUI();
}

function readOrders() {
    try { return JSON.parse(localStorage.getItem('orders')) || []; } catch (_) { return []; }
}
function writeOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function proceedToCheckout() {
    const cart = getCart();
    if (!cart || cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    // If cart modal is open, close it
    closeModal('cartModal');
    // Initialize delivery and promo inputs
    const shippingSelect = document.getElementById('coDelivery');
    if (shippingSelect) {
        shippingSelect.value = currentShipping;
    }
    const promoInput = document.getElementById('coPromo');
    if (promoInput) {
        promoInput.value = currentPromo;
    }
    renderCheckoutSummary();
    openModal('checkoutModal');
}

async function verifyPayment(reference) {
    const endpoints = ['/api/verify-paystack', '/.netlify/functions/verify-paystack'];
    for (const ep of endpoints) {
        try {
            const res = await fetch(`${ep}?reference=${encodeURIComponent(reference)}`);
            if (res.status === 404) continue; // try next
            if (!res.ok) continue;
            return await res.json();
        } catch (_) {
            continue;
        }
    }
    return null;
}

function saveOrder(status, ref, customer) {
    const { subtotal, shipping, discount, total } = computeTotals();
    const order = {
        id: 'ORD-' + Date.now(),
        createdAt: new Date().toISOString(),
        items: getCart(),
        subtotal,
        shipping: { method: currentShipping, amount: shipping },
        discount: { code: currentPromo ? currentPromo.toUpperCase() : null, amount: discount },
        total,
        customer,
        paystack: { reference: ref, verified: false },
        status
    };
    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);
    return order.id;
}

function updateOrderVerification(reference, verified) {
    const orders = readOrders();
    const idx = orders.findIndex(o => o.paystack && o.paystack.reference === reference);
    if (idx >= 0) {
        orders[idx].paystack.verified = !!verified;
        orders[idx].status = verified ? 'paid' : orders[idx].status;
        writeOrders(orders);
    }
}

function payWithPaystack(data) {
    const cart = getCart();
    if (!cart || cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    if (!isPaystackConfigured()) {
        alert('Checkout is disabled: add your Paystack public key in script.js to enable payments.');
        return;
    }
    if (!window.PaystackPop) {
        alert('Payment script failed to load. Please check your connection.');
        return;
    }
    const { total } = computeTotals();
    const amountKobo = Math.max(100, total * 100); // ensure >= ₦1.00
    const ref = 'BOBO-' + Date.now();
    // Save order as pending before opening payment widget
    saveOrder('pending', ref, data);
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: amountKobo,
        currency: 'NGN',
        ref,
        metadata: {
            custom_fields: [
                { display_name: 'Customer Name', variable_name: 'customer_name', value: data.name },
                { display_name: 'Phone', variable_name: 'phone', value: data.phone },
                { display_name: 'Address', variable_name: 'address', value: `${data.address}, ${data.city}` },
                { display_name: 'Items', variable_name: 'items', value: cart.map(i => `${i.title} x${i.quantity}`).join(', ') }
            ]
        },
        callback: async function(response) {
            try {
                const successEl = document.getElementById('checkoutSuccess');
                if (successEl) {
                    successEl.textContent = `Payment received! Verifying... Ref: ${response.reference}`;
                    successEl.style.display = 'block';
                }
                // Verify on serverless endpoint if available
                const verify = await verifyPayment(response.reference);
                if (verify && ((verify.status === true && verify.data && verify.data.status === 'success') || (verify.data && verify.data.status === 'success'))) {
                    updateOrderVerification(response.reference, true);
                    if (successEl) successEl.textContent = `Payment verified. Ref: ${response.reference}`;
                } else {
                    if (successEl) {
                        successEl.textContent = `Payment captured, but verification pending. Ref: ${response.reference}`;
                        successEl.style.color = '#f39c12';
                    }
                }
                clearCart();
                renderCheckoutSummary();
                setTimeout(() => { closeModal('checkoutModal'); }, 1800);
            } catch (_) {}
        },
        onClose: function() {
            // User dismissed the payment iframe
        }
    });
    handler.openIframe();
}

// -----------------------------------------
// Wishlist
// -----------------------------------------

function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch (_) { return []; }
}

function saveWishlist(list) {
    localStorage.setItem('wishlist', JSON.stringify(list));
}

function toggleWishlistItem(productId) {
    const list = getWishlist();
    const index = list.indexOf(productId);
    if (index >= 0) {
        list.splice(index, 1);
    } else {
        list.push(productId);
    }
    saveWishlist(list);
    updateWishlistUI();
    updateWishlistButtonsState();
}

function updateWishlistButtonsState() {
    const list = new Set(getWishlist());
    document.querySelectorAll('.product-card').forEach(card => {
        const id = card.getAttribute('data-id');
        const btn = card.querySelector('.btn-wishlist');
        if (!btn || !id) return;
        if (list.has(id)) {
            btn.classList.add('active');
            btn.textContent = '❤';
        } else {
            btn.classList.remove('active');
            btn.textContent = '♡';
        }
    });
}

function updateWishlistUI() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    const list = getWishlist();
    if (list.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }
    const items = productsData.filter(p => list.includes(p.id));
    container.innerHTML = items.map(p => `
        <div class="wishlist-item">
            <div>
                <strong>${p.title}</strong>
                <div>${formatCurrencyNaira(p.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-primary" onclick="addToCart('${p.id}')">Add to Cart</button>
                <button class="btn-wishlist" onclick="toggleWishlistItem('${p.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function toggleWishlist() {
    openModal('wishlistModal');
    updateWishlistUI();
}

// -----------------------------------------
// Modals and Utilities
// -----------------------------------------

function openModal(id, triggerEl) {
    const el = document.getElementById(id);
    if (!el) return;
    lastOpenModal = el;
    lastFocusEl = triggerEl || document.activeElement;
    el.classList.add('show');
    // focus first focusable element in modal
    const focusables = el.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (focusables.length > 0) {
        setTimeout(() => focusables[0].focus(), 0);
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    if (lastOpenModal === el && lastFocusEl && document.contains(lastFocusEl)) {
        try { lastFocusEl.focus(); } catch (_) {}
    }
    if (lastOpenModal === el) {
        lastOpenModal = null;
    }
}

function showModal(key, triggerEl) {
    const modal = document.getElementById('genericModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;
    const contentMap = {
        contact: `
            <h2 class="serif">Contact Us</h2>
            <p style="margin-bottom:1rem;color:var(--light-text)">We typically respond within 1 business day.</p>
            <form id="contactForm" class="contact-form" onsubmit="return submitContact(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="contactName">Full name</label>
                        <input id="contactName" name="name" type="text" placeholder="Jane Doe" required aria-required="true" />
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">Email</label>
                        <input id="contactEmail" name="email" type="email" placeholder="jane@example.com" required aria-required="true" />
                    </div>
                </div>
                <div class="form-group">
                    <label for="contactSubject">Subject</label>
                    <input id="contactSubject" name="subject" type="text" placeholder="How can we help?" required aria-required="true" />
                </div>
                <div class="form-group">
                    <label for="contactMessage">Message</label>
                    <textarea id="contactMessage" name="message" rows="5" placeholder="Write your message..." required aria-required="true"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary"><span class="button-text">Send Message</span><span class="button-spinner" aria-hidden="true"></span></button>
                </div>
                <div id="contactSuccess" class="success-message" role="alert" aria-live="polite"></div>
            </form>
        `,
        shipping: '<h2 class="serif">Shipping Information</h2><p>Worldwide express shipping available.</p>',
        returns: '<h2 class="serif">Returns</h2><p>Returns accepted within 14 days in original condition.</p>',
        sizing: '<h2 class="serif">Size Guide</h2><p>Tailored fits; contact us for bespoke sizing.</p>',
        styling: '<h2 class="serif">Personal Styling</h2><p>Book a session with our stylists.</p>',
        authenticity: '<h2 class="serif">Authenticity</h2><p>All products are authenticated by experts.</p>',
        gift: '<h2 class="serif">Gift Cards</h2><p>Digital and physical cards available.</p>',
        careers: '<h2 class="serif">Careers</h2><p>Join our team; send your CV.</p>',
        sustainability: '<h2 class="serif">Sustainability</h2><p>Ethical sourcing and fair-trade partnerships.</p>',
        press: '<h2 class="serif">Press</h2><p>Press inquiries: press@boboandomoge.com</p>',
        privacy: '<h2 class="serif">Privacy Policy</h2><p>Your privacy matters to us.</p>',
        terms: '<h2 class="serif">Terms of Service</h2><p>Please review our terms.</p>'
    };
    body.innerHTML = contentMap[key] || '<h2 class="serif">Information</h2><p>Details coming soon.</p>';
    openModal('genericModal', triggerEl);
}

function showVIPModal() {
    openModal('vipModal');
}

function selectVIPPlan(plan) {
    alert(`Selected VIP plan: ${plan.toUpperCase()}. Our team will contact you.`);
}

// Track last open modal and trigger element for focus management
let lastOpenModal = null;
let lastFocusEl = null;

// Close modals only when clicking on the overlay (outside the content)
document.addEventListener('click', (e) => {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        if (!content) return;
        // Close if click happened directly on the overlay element
        if (e.target === modal) {
            closeModal(modal.id);
            return;
        }
        // Or if the click is within the overlay but outside the content box
        if (!content.contains(e.target) && modal.contains(e.target)) {
            closeModal(modal.id);
        }
    });
});

// Global keyboard handlers: Esc to close, Tab to trap focus in modal
document.addEventListener('keydown', (e) => {
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0) return;
    const topModal = openModals[openModals.length - 1];
    if (e.key === 'Escape') {
        e.preventDefault();
        closeModal(topModal.id);
        return;
    }
    if (e.key === 'Tab') {
        const focusables = topModal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// Prevent default jump for placeholder links (href="#")
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href="#"]');
    if (anchor) {
        e.preventDefault();
    }
});

// Event delegation for data-* actions, modal links, and social links
document.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
        const action = actionEl.getAttribute('data-action');
        switch (action) {
            case 'open-search':
                e.preventDefault();
                toggleSearch();
                break;
            case 'open-wishlist':
                e.preventDefault();
                toggleWishlist();
                break;
            case 'open-cart':
                e.preventDefault();
                toggleCart();
                break;
            case 'open-account':
                e.preventDefault();
                showModal('contact', actionEl);
                break;
            case 'toggle-mobile-menu':
                e.preventDefault();
                toggleMobileMenu();
                break;
            case 'load-more':
                e.preventDefault();
                loadMoreProducts();
                break;
            case 'open-vip':
                e.preventDefault();
                showVIPModal();
                break;
            case 'checkout':
                e.preventDefault();
                proceedToCheckout();
                break;
            default:
                break;
        }
    }

    const modalLink = e.target.closest('[data-modal]');
    if (modalLink) {
        e.preventDefault();
        showModal(modalLink.getAttribute('data-modal'), modalLink);
    }

    const closeEl = e.target.closest('[data-close]');
    if (closeEl) {
        e.preventDefault();
        closeModal(closeEl.getAttribute('data-close'));
    }

    const vipPlanEl = e.target.closest('[data-vip-plan]');
    if (vipPlanEl) {
        e.preventDefault();
        selectVIPPlan(vipPlanEl.getAttribute('data-vip-plan'));
    }

    const socialEl = e.target.closest('[data-social]');
    if (socialEl) {
        e.preventDefault();
        openSocial(socialEl.getAttribute('data-social'));
    }
});

// -----------------------------------------
// Search and Account
// -----------------------------------------

function toggleSearch() {
    openModal('searchModal');
    const input = document.getElementById('searchQuery');
    if (input) {
        input.value = '';
        input.focus();
    }
}

function runSearch(query) {
    const results = productsData.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
    const grid = document.getElementById('productGrid');
    if (grid) {
        grid.innerHTML = results.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class=\"product-image has-image loading\"><img class=\"product-img loading\" src=\"${product.image}\" srcset=\"${getResponsiveSrcSet(product.image, product.id)}\" sizes=\"${RESPONSIVE_SIZES}\" alt=\"${product.title}\" width=\"800\" height=\"600\" loading=\"lazy\" decoding=\"async\" fetchpriority=\"low\" referrerpolicy=\"no-referrer\" onload=\"handleImageLoaded(this)\" onerror=\"this.onerror=null;this.src='https://picsum.photos/seed/${product.id}/800/600'\"></div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${formatCurrencyNaira(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                        <button class="btn-wishlist" onclick="toggleWishlistItem('${product.id}')">♡</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    updateWishlistButtonsState();
    const loadMoreSection = document.getElementById('loadMoreSection');
    if (loadMoreSection) loadMoreSection.style.display = 'none';
}

function toggleAccount() {
    showModal('contact');
}

function openSocial(platform) {
    const urlMap = {
        instagram: 'https://www.instagram.com/boboandomoge',
        facebook: 'https://www.facebook.com/boboandomoge',
        twitter: 'https://www.twitter.com/boboandomoge'
    };
    const url = urlMap[platform];
    if (url) {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (w) w.opener = null;
    }
}

// -----------------------------------------
// Initial Render
// -----------------------------------------

// Wait for DOM ready before first render
document.addEventListener('DOMContentLoaded', () => {
    try {
        renderProducts(true);
        updateCartCount();
    } catch (err) {
        console.error('Initialization error:', err);
    }
});

// -----------------------------------------
// Contact Form Submit
// -----------------------------------------

function submitContact(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#contactName');
    const email = form.querySelector('#contactEmail');
    const subject = form.querySelector('#contactSubject');
    const message = form.querySelector('#contactMessage');
    const success = form.querySelector('#contactSuccess');
    const button = form.querySelector('button[type="submit"]');
    const text = button.querySelector('.button-text');
    const spinner = button.querySelector('.button-spinner');

    // reset aria states
    [name, email, subject, message].forEach(input => {
        if (input) {
            input.removeAttribute('aria-invalid');
        }
    });

    // basic validation
    let valid = true;
    if (!name.value.trim()) { name.setAttribute('aria-invalid', 'true'); valid = false; }
    if (!email.validity.valid) { email.setAttribute('aria-invalid', 'true'); valid = false; }
    if (!subject.value.trim()) { subject.setAttribute('aria-invalid', 'true'); valid = false; }
    if (!message.value.trim()) { message.setAttribute('aria-invalid', 'true'); valid = false; }

    if (!valid) {
        success.textContent = 'Please complete all fields with a valid email.';
        success.style.color = '#ff6b6b';
        success.style.display = 'block';
        return false;
    }

    // loading state
    text.textContent = 'Sending...';
    spinner.style.display = 'inline-block';
    button.disabled = true;

    setTimeout(() => {
        text.textContent = 'Send Message';
        spinner.style.display = 'none';
        button.disabled = false;
        success.textContent = 'Thank you! Your message has been sent.';
        success.style.color = '#2ecc71';
        success.style.display = 'block';
        form.reset();
    }, 1200);

    return false;
}
 