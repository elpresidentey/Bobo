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

// -----------------------------------------
// Enhanced Header Scroll Behavior
// -----------------------------------------

class EnhancedNavbarController {
    constructor() {
        this.header = null;
        this.hero = null;
        this.navbar = null;
        this.lastScrollTop = 0;
        this.scrollTimeout = null;
        this.isScrollingUp = false;
        this.isScrollingDown = false;
        this.scrollDirection = 'none';
        this.scrollVelocity = 0;
        this.hideThreshold = 80;
        this.showThreshold = 100;
        this.debounceDelay = 10;
        this.progressEnabled = false;
        this.touchStartY = 0;
        this.isTouch = false;
        
        // Performance optimization
        this.raf = null;
        this.ticking = false;
        
        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.updateNavbar = this.updateNavbar.bind(this);
        
        this.init();
    }
    
    init() {
        this.header = document.querySelector('.header');
        this.hero = document.querySelector('.hero');
        this.navbar = document.querySelector('.navbar');
        
        if (!this.header) {
            console.warn('Header element not found for enhanced navbar controller');
            return;
        }
        
        // Set up initial state
        this.setupInitialState();
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Initial update
        requestAnimationFrame(() => this.updateNavbar());
        
        // Enable progress indicator after 1 second
        setTimeout(() => {
            this.progressEnabled = true;
            this.header.classList.add('header--show-progress');
        }, 1000);
    }
    
    setupInitialState() {
        // Set CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--navbar-height', '80px');
        root.style.setProperty('--navbar-height-compressed', '64px');
        
        // Add loading class temporarily to prevent flash
        this.header.classList.add('header--loading');
        
        // Remove loading class after a tick
        requestAnimationFrame(() => {
            this.header.classList.remove('header--loading');
        });
    }
    
    bindEventListeners() {
        // Scroll events with passive listening
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.handleResize, { passive: true });
        
        // Touch events for mobile optimization
        window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        
        // Intersection Observer for hero section
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        // Removed intersection observer logic for transparency
        // Navbar will always have solid background now
        return;
    }
    
    handleScroll() {
        if (!this.ticking) {
            this.raf = requestAnimationFrame(this.updateNavbar);
            this.ticking = true;
        }
    }
    
    handleResize() {
        // Debounce resize events
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.updateNavbar();
        }, 150);
    }
    
    handleTouchStart(e) {
        this.isTouch = true;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        if (!this.isTouch) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;
        
        // Enhanced touch scroll detection
        if (Math.abs(deltaY) > 10) {
            this.scrollDirection = deltaY > 0 ? 'down' : 'up';
            this.touchStartY = touchY;
        }
    }
    
    calculateScrollMetrics() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const heroHeight = this.hero ? this.hero.offsetHeight : windowHeight;
        
        // Calculate scroll direction and velocity
        const scrollDelta = scrollTop - this.lastScrollTop;
        this.scrollVelocity = Math.abs(scrollDelta);
        
        if (scrollDelta > 0) {
            this.scrollDirection = 'down';
            this.isScrollingDown = true;
            this.isScrollingUp = false;
        } else if (scrollDelta < 0) {
            this.scrollDirection = 'up';
            this.isScrollingDown = false;
            this.isScrollingUp = true;
        } else {
            this.scrollDirection = 'none';
            this.isScrollingDown = false;
            this.isScrollingUp = false;
        }
        
        // Calculate scroll progress
        const scrollProgress = Math.min(
            Math.max(scrollTop / (documentHeight - windowHeight), 0),
            1
        );
        
        this.lastScrollTop = Math.max(0, scrollTop);
        
        return {
            scrollTop,
            scrollDelta,
            scrollProgress,
            heroHeight,
            documentHeight,
            windowHeight
        };
    }
    
    updateCSSVariables(metrics) {
        const root = document.documentElement;
        const { scrollTop, scrollProgress } = metrics;
        
        // Update scroll progress for progress bar
        if (this.progressEnabled) {
            root.style.setProperty('--scroll-progress', scrollProgress);
        }
        
        // Simplified navbar properties - always solid background
        // Background always fully opaque
        root.style.setProperty('--navbar-bg-opacity', '1');
        
        // No blur effect
        root.style.setProperty('--navbar-blur', '0px');
        
        // Shadow opacity based on scroll
        const shadowOpacity = Math.min(scrollTop / 100, 1);
        root.style.setProperty('--navbar-shadow-opacity', shadowOpacity);
        
        // Border opacity
        const borderOpacity = scrollTop > 100 ? 1 : 0;
        root.style.setProperty('--navbar-border-opacity', borderOpacity);
        
        // Scale for subtle compression effect
        const scrollFactor = Math.min(scrollTop / 200, 1);
        const scale = scrollTop > 50 ? Math.max(0.95, 1 - (scrollFactor * 0.05)) : 1;
        root.style.setProperty('--navbar-scale', scale);
    }
    
    updateNavbarClasses(metrics) {
        const { scrollTop, heroHeight } = metrics;
        
        // Remove all state classes
        this.header.classList.remove(
            'header--transparent',
            'header--scrolled',
            'header--hidden',
            'header--compressed'
        );
        
        // Determine primary state
        if (scrollTop <= 50) {
            this.header.classList.add('header--transparent');
        } else {
            this.header.classList.add('header--scrolled');
            
            if (scrollTop > 200) {
                this.header.classList.add('header--compressed');
            }
        }
        
        // Smart hide/show logic
        this.updateVisibility(metrics);
    }
    
    updateVisibility(metrics) {
        const { scrollTop, heroHeight } = metrics;
        
        // Simplified logic: Don't hide navbar automatically on scroll down
        // This prevents the glitchy behavior users experience
        // The navbar will stay visible but change appearance based on scroll position
        
        // Always keep navbar visible - just change its appearance
        this.header.classList.remove('header--hidden');
        
        // Optional: Only hide if user scrolls down very aggressively (uncomment if needed)
        // if (scrollTop > 800 && this.isScrollingDown && this.scrollVelocity > 15) {
        //     this.header.classList.add('header--hidden');
        // }
        
        // Always show when scrolling up or near top
        if (this.isScrollingUp || scrollTop < 200) {
            this.header.classList.remove('header--hidden');
        }
    }
    
    updateNavbar() {
        this.ticking = false;
        
        try {
            const metrics = this.calculateScrollMetrics();
            this.updateCSSVariables(metrics);
            this.updateNavbarClasses(metrics);
            
            // Accessibility: Announce visibility changes
            this.announceVisibilityChanges();
            
        } catch (error) {
            console.warn('Error updating navbar:', error);
        }
    }
    
    announceVisibilityChanges() {
        // Respect reduced motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.header.classList.remove('header--hidden');
        }
    }
    
    // Public methods for external control
    show() {
        this.header.classList.remove('header--hidden');
    }
    
    hide() {
        if (this.lastScrollTop > 200) {
            this.header.classList.add('header--hidden');
        }
    }
    
    setTransparent(transparent = true) {
        this.header.classList.toggle('header--transparent', transparent);
    }
    
    destroy() {
        // Clean up event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        
        // Cancel any pending animation frames
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
        
        // Clear timeouts
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }
}

// Global instance
let enhancedNavbar = null;

// Initialize enhanced navbar
function initHeaderBehavior() {
    if (enhancedNavbar) {
        enhancedNavbar.destroy();
    }
    
    enhancedNavbar = new EnhancedNavbarController();
    
    // Expose for external control
    window.enhancedNavbar = enhancedNavbar;
}

// -----------------------------------------
// Smooth Scrolling Enhancement
// -----------------------------------------

function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const mobileMenu = document.querySelector('.mobile-menu');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }
    });
}

// -----------------------------------------
// Initialize Everything
// -----------------------------------------


// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!navLinks || !mobileMenu) return;

    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-expanded', 
        mobileMenu.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
    const expanded = mobileMenu.getAttribute('aria-expanded') === 'true';
    navLinks.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    if (expanded) {
        document.body.classList.add('no-scroll');
        document.body.setAttribute('data-nav-open', '');
    } else {
        document.body.classList.remove('no-scroll');
        document.body.removeAttribute('data-nav-open');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!navLinks || !mobileMenu) return;
    if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-expanded', 'false');
            navLinks.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
            document.body.removeAttribute('data-nav-open');
        }
    }
});

// Close mobile menu on Escape
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!navLinks || !mobileMenu) return;
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        document.body.removeAttribute('data-nav-open');
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize header scroll behavior first
    initHeaderBehavior();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Load stored stock levels
    loadStoredStock();
    
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
                navLinksEl.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('no-scroll');
                document.body.removeAttribute('data-nav-open');
            });
        });
    }

    // Initialize header overlay behavior
    initHeaderOverlay();
});

// -----------------------------------------
// Product Data and Rendering
// -----------------------------------------

// Reviews and Ratings System
class ReviewsSystem {
    constructor() {
        this.reviews = this.loadReviews();
    }

    loadReviews() {
        try {
            return JSON.parse(localStorage.getItem('productReviews')) || {};
        } catch {
            return {};
        }
    }

    saveReviews() {
        localStorage.setItem('productReviews', JSON.stringify(this.reviews));
    }

    addReview(productId, review) {
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        
        const newReview = {
            id: Date.now().toString(),
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            author: review.author,
            verified: review.verified || false,
            helpful: 0,
            date: new Date().toISOString(),
            ...review
        };
        
        this.reviews[productId].unshift(newReview);
        this.saveReviews();
        this.updateProductRating(productId);
        return newReview;
    }

    getReviews(productId) {
        return this.reviews[productId] || [];
    }

    updateProductRating(productId) {
        const reviews = this.getReviews(productId);
        if (reviews.length === 0) return;
        
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const product = productsData.find(p => p.id === productId);
        if (product) {
            product.rating = Math.round(avgRating * 10) / 10;
            product.reviewCount = reviews.length;
        }
    }

    markHelpful(productId, reviewId) {
        const reviews = this.getReviews(productId);
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful = (review.helpful || 0) + 1;
            this.saveReviews();
        }
    }

    getRatingDistribution(productId) {
        const reviews = this.getReviews(productId);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        return distribution;
    }
}

const reviewsSystem = new ReviewsSystem();

const productsData = [
    {
        id: 'p1',
        title: 'Aso Oke Kimono',
        description: 'Handwoven elegance with modern tailoring',
        longDescription: 'This exquisite kimono showcases the finest Aso Oke weaving traditions, reimagined for contemporary luxury. Each piece is handwoven by master artisans using traditional techniques passed down through generations.',
        price: 120000,
        originalPrice: 150000,
        category: 'clothing',
        badge: 'Limited',
        stock: 3,
        lowStock: 5,
        tags: ['handwoven', 'traditional', 'luxury', 'kimono', 'aso oke'],
        images: [
            'https://images.pexels.com/photos/3058391/pexels-photo-3058391.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
            'https://images.pexels.com/photos/3045642/pexels-photo-3045642.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
            'https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: [{ name: 'Royal Blue', hex: '#1e3a8a' }, { name: 'Gold', hex: '#d4af37' }, { name: 'Emerald', hex: '#10b981' }]
        },
        rating: 4.9,
        reviewCount: 27,
        popularity: 95
    },
    {
        id: 'p2',
        title: 'Adire Silk Scarf',
        description: 'Artisan-dyed silk, ultra-soft sheen',
        longDescription: 'Hand-dyed using traditional Adire techniques, this silk scarf features intricate patterns that tell stories of Nigerian heritage. The luxurious silk provides an ultra-soft feel against the skin.',
        price: 45000,
        category: 'accessories',
        stock: 15,
        lowStock: 5,
        tags: ['silk', 'adire', 'handmade', 'scarf', 'traditional'],
        images: [
            'https://images.pexels.com/photos/3045642/pexels-photo-3045642.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
            'https://images.pexels.com/photos/1820559/pexels-photo-1820559.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            colors: [{ name: 'Indigo Blue', hex: '#4f46e5' }, { name: 'Earth Brown', hex: '#a16207' }, { name: 'Forest Green', hex: '#166534' }]
        },
        rating: 4.7,
        reviewCount: 42,
        popularity: 88
    },
    {
        id: 'p3',
        title: 'Beaded Evening Clutch',
        description: 'Meticulously beaded, heirloom-grade',
        longDescription: 'Every bead on this stunning clutch is hand-placed by skilled artisans. The intricate beadwork creates mesmerizing patterns that catch light beautifully, making it the perfect accessory for special occasions.',
        price: 95000,
        category: 'accessories',
        stock: 8,
        lowStock: 5,
        tags: ['beaded', 'clutch', 'evening', 'handcrafted', 'luxury'],
        images: [
            'https://images.unsplash.com/photo-1681545290284-679e6291c440?auto=format&fit=crop&w=800&h=600&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHlvcnViYSUyMGFzbyUyMG9rZXxlbnwwfDJ8MHx8fDI%3D'
        ],
        variants: {
            colors: [{ name: 'Gold', hex: '#d4af37' }, { name: 'Silver', hex: '#9ca3af' }, { name: 'Rose Gold', hex: '#f59e0b' }]
        },
        rating: 4.8,
        reviewCount: 19,
        popularity: 76
    },
    {
        id: 'p4',
        title: 'Ankara Statement Blazer',
        description: 'Structured, bold, and bespoke',
        longDescription: 'This striking blazer combines traditional Ankara prints with contemporary tailoring. The structured silhouette and bold patterns make it a perfect statement piece for the modern professional.',
        price: 150000,
        category: 'clothing',
        badge: 'New',
        stock: 12,
        lowStock: 5,
        tags: ['ankara', 'blazer', 'professional', 'statement', 'tailored'],
        images: [
            'https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: [{ name: 'Vibrant Orange', hex: '#ea580c' }, { name: 'Deep Purple', hex: '#7c3aed' }]
        },
        rating: 4.6,
        reviewCount: 33,
        popularity: 92
    },
    {
        id: 'p5',
        title: 'Leather Sandals',
        description: 'Full-grain leather with artisanal stitching',
        longDescription: 'Crafted from premium full-grain leather, these sandals feature intricate hand-stitching and comfortable cushioned soles. Each pair is individually crafted by skilled leather artisans.',
        price: 70000,
        category: 'limited',
        badge: 'Limited',
        stock: 2,
        lowStock: 5,
        tags: ['leather', 'sandals', 'handcrafted', 'comfort', 'artisan'],
        images: [
            'https://images.pexels.com/photos/1368483/pexels-photo-1368483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['36', '37', '38', '39', '40', '41', '42'],
            colors: [{ name: 'Cognac', hex: '#b45309' }, { name: 'Black', hex: '#1f2937' }]
        },
        rating: 4.9,
        reviewCount: 15,
        popularity: 68
    },
    {
        id: 'p6',
        title: 'Handcrafted Coral Necklace',
        description: 'Luxurious coral and gold-plated accents',
        longDescription: 'This stunning necklace features authentic coral beads complemented by gold-plated accents. Each piece is unique, showcasing the natural beauty of coral in an elegant design.',
        price: 180000,
        category: 'limited',
        badge: 'Limited',
        stock: 4,
        lowStock: 5,
        tags: ['coral', 'necklace', 'gold', 'jewelry', 'unique'],
        images: [
            'https://images.pexels.com/photos/14538746/pexels-photo-14538746.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            lengths: ['16"', '18"', '20"']
        },
        rating: 4.8,
        reviewCount: 11,
        popularity: 84
    },
    {
        id: 'p7',
        title: 'Silk Kaftan',
        description: 'Floaty silhouette in premium silk',
        longDescription: 'This elegant kaftan drapes beautifully with its flowing silhouette. Made from premium silk, it offers comfort and sophistication perfect for resort wear or elegant evening occasions.',
        price: 135000,
        category: 'clothing',
        stock: 9,
        lowStock: 5,
        tags: ['silk', 'kaftan', 'flowing', 'elegant', 'resort'],
        images: [
            'https://images.pexels.com/photos/16934252/pexels-photo-16934252.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['One Size'],
            colors: [{ name: 'Sunset Orange', hex: '#f97316' }, { name: 'Ocean Blue', hex: '#0ea5e9' }]
        },
        rating: 4.5,
        reviewCount: 24,
        popularity: 71
    },
    {
        id: 'p8',
        title: 'Gold-Trim Headwrap',
        description: 'Lightweight, versatile styling',
        longDescription: 'This versatile headwrap features elegant gold trim detailing. Made from lightweight, breathable fabric, it can be styled in numerous ways to complement any outfit.',
        price: 30000,
        category: 'accessories',
        stock: 25,
        lowStock: 5,
        tags: ['headwrap', 'gold trim', 'versatile', 'lightweight', 'styling'],
        images: [
            'https://images.pexels.com/photos/1820559/pexels-photo-1820559.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            colors: [{ name: 'Burgundy', hex: '#991b1b' }, { name: 'Navy', hex: '#1e40af' }, { name: 'Emerald', hex: '#059669' }]
        },
        rating: 4.4,
        reviewCount: 56,
        popularity: 63
    },
    {
        id: 'p9',
        title: 'Embroidered Cape',
        description: 'Statement cape with intricate motifs',
        longDescription: 'This dramatic cape features elaborate embroidered motifs inspired by traditional African art. The flowing design and intricate detailing make it a true statement piece.',
        price: 210000,
        originalPrice: 280000,
        category: 'limited',
        badge: 'Limited',
        stock: 1,
        lowStock: 5,
        tags: ['cape', 'embroidered', 'statement', 'dramatic', 'art'],
        images: [
            'https://images.pexels.com/photos/31004640/pexels-photo-31004640.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['One Size'],
            colors: [{ name: 'Midnight Black', hex: '#1f2937' }]
        },
        rating: 4.9,
        reviewCount: 8,
        popularity: 97
    },
    {
        id: 'p10',
        title: 'Velvet Wrap Dress',
        description: 'Luxe velvet with a flattering silhouette',
        longDescription: 'This sumptuous velvet wrap dress combines luxury with elegance. The flattering wrap silhouette and rich velvet fabric create a sophisticated look perfect for special occasions.',
        price: 160000,
        category: 'clothing',
        badge: 'Editors Pick',
        stock: 7,
        lowStock: 5,
        tags: ['velvet', 'wrap dress', 'luxury', 'elegant', 'special occasion'],
        images: [
            'https://images.unsplash.com/photo-1564280263685-0e610aad6fb9?auto=format&fit=crop&w=800&h=600&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ],
        variants: {
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: [{ name: 'Deep Emerald', hex: '#065f46' }, { name: 'Royal Purple', hex: '#6b21a8' }]
        },
        rating: 4.7,
        reviewCount: 41,
        popularity: 89
    },
    {
        id: 'p11',
        title: 'Kente Weekender Duffle',
        description: 'Handwoven Kente with full-grain leather trims',
        longDescription: 'This luxurious weekender bag combines authentic Kente cloth with premium leather trims. Spacious and stylish, it\'s perfect for the sophisticated traveler who appreciates cultural heritage.',
        price: 190000,
        category: 'limited',
        badge: 'Limited',
        stock: 6,
        lowStock: 5,
        tags: ['kente', 'weekender', 'travel', 'leather', 'heritage'],
        images: [
            'https://images.pexels.com/photos/2916819/pexels-photo-2916819.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            colors: [{ name: 'Traditional Multi', hex: '#d97706' }, { name: 'Royal Blue', hex: '#1d4ed8' }]
        },
        rating: 4.6,
        reviewCount: 22,
        popularity: 79
    },
    {
        id: 'p12',
        title: 'Ankara Panel Sneakers',
        description: 'Custom sneakers with Ankara accents',
        longDescription: 'These contemporary sneakers feature custom Ankara fabric panels that make each pair unique. Combining street style with cultural heritage, they\'re perfect for the fashion-forward individual.',
        price: 85000,
        category: 'accessories',
        badge: 'New',
        stock: 18,
        lowStock: 5,
        tags: ['sneakers', 'ankara', 'custom', 'street style', 'unique'],
        images: [
            'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ],
        variants: {
            sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
            colors: [{ name: 'Multi Color', hex: '#f59e0b' }, { name: 'Blue Accent', hex: '#3b82f6' }]
        },
        rating: 4.3,
        reviewCount: 38,
        popularity: 82
    }
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
        const fallback = `https://picsum.photos/seed/${product.id}/800/600`;
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        return `
            <div class="recently-viewed-card" onclick="showProductQuickView('${product.id}')" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProductQuickView('${product.id}')}"
                 aria-label="${product.title} - ${formatCurrencyNaira(product.price)}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="recently-viewed-image">
                    <img src="${mainImage}" alt="${product.title}" 
                         onerror="this.onerror=null;this.src='${fallback}'" loading="lazy">
                </div>
                <div class="recently-viewed-info">
                    <h3 class="recently-viewed-title">${product.title}</h3>
                    <p class="recently-viewed-description">${product.description}</p>
                    <div class="recently-viewed-price">${formatCurrencyNaira(product.price)}</div>
                    <div class="recently-viewed-actions">
                        <button class="rec-btn" onclick="event.stopPropagation(); addToCart('${product.id}'); toast.show('Added to cart!', 'success')">
                            Add to Cart
                        </button>
                        <button class="rec-btn-secondary" onclick="event.stopPropagation(); toggleWishlistItem('${product.id}'); updateWishlistButtonsState()" 
                                aria-label="Add to wishlist">♡</button>
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
    
    // Show success message
    if (typeof toast !== 'undefined') {
        toast.show(`${product.title} added to cart!`, 'success');
    }
    
    // Track as recently viewed
    addToRecentlyViewed(productId);
    
    // Update stock if available
    if (typeof updateStock === 'function') {
        updateStock(productId, 1);
    }
    
    // Redirect to checkout after a short delay to show the toast
    setTimeout(() => {
        proceedToCheckout();
    }, 500);
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
// Modals and Utilities
// -----------------------------------------

// Header overlay helpers
function setHeaderOverlay(isOverlay) {
    try {
        const header = document.querySelector('.header');
        if (!header) return;
        header.classList.toggle('header--overlay', !!isOverlay);
    } catch (_) {}
}

function initHeaderOverlay() {
    try {
        const header = document.querySelector('.header');
        if (!header) return;
        const hero = document.querySelector('.hero');
        const sentinel = document.getElementById('heroSentinel');

        // If there is no hero/sentinel, default to solid header
        if (!hero || !sentinel) {
            setHeaderOverlay(false);
            return;
        }

        const getHeaderHeight = () => Math.max(56, Math.round(header.getBoundingClientRect().height || 64));

        let io = null;
        const observe = () => {
            if (io) io.disconnect();
            const rootMargin = `-${getHeaderHeight()}px 0px 0px 0px`;
            io = new IntersectionObserver((entries) => {
                const e = entries[0];
                const navOpen = document.body.hasAttribute('data-nav-open');
                // Overlay only when sentinel is visible and nav is not open
                setHeaderOverlay(e && e.isIntersecting && !navOpen);
            }, { root: null, threshold: 0, rootMargin });
            io.observe(sentinel);
        };

        observe();
        window.addEventListener('resize', observe);
    } catch (_) {}
}

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
        grid.innerHTML = results.map(product => {
            const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
            const fallback = `https://picsum.photos/seed/${product.id}/800/600`;
            return `
                <div class="recently-viewed-card" onclick="showProductQuickView('${product.id}')" role="button" tabindex="0"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProductQuickView('${product.id}')}"
                     aria-label="${product.title} - ${formatCurrencyNaira(product.price)}">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    <div class="recently-viewed-image">
                        <img src="${mainImage}" alt="${product.title}" 
                             onerror="this.onerror=null;this.src='${fallback}'" loading="lazy">
                    </div>
                    <div class="recently-viewed-info">
                        <h3 class="recently-viewed-title">${product.title}</h3>
                        <p class="recently-viewed-description">${product.description}</p>
                        <div class="recently-viewed-price">${formatCurrencyNaira(product.price)}</div>
                        <div class="recently-viewed-actions">
                            <button class="rec-btn" onclick="event.stopPropagation(); addToCart('${product.id}'); toast.show('Added to cart!', 'success')">
                                Add to Cart
                            </button>
                            <button class="rec-btn-secondary" onclick="event.stopPropagation(); toggleWishlistItem('${product.id}'); updateWishlistButtonsState()" 
                                    aria-label="Add to wishlist">♡</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
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
        initializeRecommendations();
        renderRecentlyViewed();
    } catch (err) {
        console.error('Initialization error:', err);
    }
});

// -----------------------------------------
// Recommendations and Recently Viewed Functions
// -----------------------------------------

function initializeRecommendations() {
    // Set up recommendation tabs
    const tabsContainer = document.querySelector('.recommendations-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.rec-tab');
            if (tab) {
                e.preventDefault();
                switchRecommendationTab(tab.getAttribute('data-rec-type'));
            }
        });
    }
    
    // Load initial recommendations
    renderRecommendations('personalized');
}

function switchRecommendationTab(type) {
    // Update active tab
    document.querySelectorAll('.rec-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-rec-type') === type);
    });
    
    // Render recommendations for selected type
    renderRecommendations(type);
}

function renderRecommendations(type = 'personalized') {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) return;
    
    let products = [];
    let title = '';
    
    switch (type) {
        case 'personalized':
            products = recommendationEngine.getPersonalizedRecommendations(6);
            title = 'Based on your browsing history';
            break;
        case 'trending':
            products = recommendationEngine.getTrendingProducts(6);
            title = 'Popular right now';
            break;
        case 'similar':
            const recentlyViewed = getRecentlyViewed();
            if (recentlyViewed.length > 0) {
                products = recommendationEngine.getSimilarProducts(recentlyViewed[0].id, 6);
                title = `Similar to ${recentlyViewed[0].title}`;
            } else {
                products = recommendationEngine.getTrendingProducts(6);
                title = 'You might also like';
            }
            break;
    }
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--light-text); grid-column: 1 / -1;">No recommendations available yet. Browse some products to see personalized suggestions!</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        const fallback = `https://picsum.photos/seed/${product.id}/400/300`;
        
        // Generate recommendation reason
        let reason = '';
        if (type === 'personalized') {
            if (product.category === 'clothing') reason = '👗 You browse clothing frequently';
            else if (product.category === 'accessories') reason = '💍 Perfect accessories for you';
            else if (product.category === 'limited') reason = '✨ Limited edition picks';
            else reason = '🎯 Curated for your taste';
        } else if (type === 'trending') {
            reason = `🔥 ${product.popularity}% popularity score`;
        } else {
            reason = '🎨 Similar style and craftsmanship';
        }
        
        return `
            <div class="recently-viewed-card" onclick="showProductQuickView('${product.id}')" role="button" tabindex="0" 
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProductQuickView('${product.id}')}"
                 aria-label="${product.title} - ${formatCurrencyNaira(product.price)}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="recently-viewed-image">
                    <img src="${mainImage}" alt="${product.title}" 
                         onerror="this.onerror=null;this.src='${fallback}'" loading="lazy">
                </div>
                <div class="recently-viewed-info">
                    <div class="recommendation-why">${reason}</div>
                    <h3 class="recently-viewed-title">${product.title}</h3>
                    <p class="recently-viewed-description">${product.description}</p>
                    <div class="recommendation-meta">
                        ${product.rating ? `
                            <div class="recommendation-rating">
                                ${'★'.repeat(Math.floor(product.rating))}
                                <span>${product.rating}</span>
                            </div>
                        ` : ''}
                        <span>${product.reviewCount || 0} reviews</span>
                    </div>
                    <div class="recently-viewed-price">${formatCurrencyNaira(product.price)}</div>
                    <div class="recently-viewed-actions">
                        <button class="rec-btn" onclick="event.stopPropagation(); addToCart('${product.id}'); toast.show('Added to cart!', 'success')">
                            Add to Cart
                        </button>
                        <button class="rec-btn-secondary" onclick="event.stopPropagation(); toggleWishlistItem('${product.id}'); updateWishlistButtonsState()" 
                                aria-label="Add to wishlist">♡</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Update wishlist button states
    updateWishlistButtonsState();
}

function renderRecentlyViewed() {
    let recentlyViewed = getRecentlyViewed();
    const section = document.getElementById('recentlyViewedSection');
    const grid = document.getElementById('recentlyViewedGrid');
    
    if (!section || !grid) return;
    
    // If no recently viewed items, populate with some default products for demo
    if (recentlyViewed.length === 0) {
        const defaultRecentlyViewed = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
        defaultRecentlyViewed.forEach(id => addToRecentlyViewed(id));
        recentlyViewed = getRecentlyViewed();
    }
    
    // Ensure we have at least 6 items for demo purposes
    if (recentlyViewed.length < 6) {
        const additionalProducts = ['p7', 'p8', 'p9', 'p10', 'p11', 'p12'];
        additionalProducts.slice(0, 6 - recentlyViewed.length).forEach(id => {
            if (!recentlyViewed.some(p => p.id === id)) {
                addToRecentlyViewed(id);
            }
        });
        recentlyViewed = getRecentlyViewed();
    }
    
    section.style.display = 'block';
    
    grid.innerHTML = recentlyViewed.slice(0, 6).map(product => {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        const fallback = `https://picsum.photos/seed/${product.id}/400/300`;
        
        return `
            <div class="recently-viewed-card" onclick="showProductQuickView('${product.id}')" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProductQuickView('${product.id}')}"
                 aria-label="${product.title} - ${formatCurrencyNaira(product.price)}">
                <div class="recently-viewed-image">
                    <img src="${mainImage}" alt="${product.title}" 
                         onerror="this.onerror=null;this.src='${fallback}'" loading="lazy">
                </div>
                <div class="recently-viewed-info">
                    <h3 class="recently-viewed-title">${product.title}</h3>
                    <p class="recently-viewed-description">${product.description}</p>
                    <div class="recently-viewed-price">${formatCurrencyNaira(product.price)}</div>
                    <div class="recently-viewed-actions">
                        <button class="rec-btn" onclick="event.stopPropagation(); addToCart('${product.id}'); toast.show('Added to cart!', 'success')">
                            Add to Cart
                        </button>
                        <button class="rec-btn-secondary" onclick="event.stopPropagation(); toggleWishlistItem('${product.id}'); updateWishlistButtonsState()" 
                                aria-label="Add to wishlist">♡</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Update wishlist button states
    updateWishlistButtonsState();
}

// Update recently viewed when products are added to cart
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
    
    // Track as recently viewed
    addToRecentlyViewed(productId);
    
    // Re-render recently viewed section
    renderRecentlyViewed();
    
    // Update recommendations based on new interaction
    setTimeout(() => {
        renderRecommendations(document.querySelector('.rec-tab.active')?.getAttribute('data-rec-type') || 'personalized');
    }, 100);
}

// -----------------------------------------
// Missing Core Functions
// -----------------------------------------

// Modal Management Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Store the currently focused element to restore later
    modal.previousFocusElement = document.activeElement;
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the modal or first focusable element
    const firstFocusable = modal.querySelector('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
        firstFocusable.focus();
    } else {
        modal.focus();
    }
    
    // Add modal to stack for proper layering
    if (!document.body.modalStack) {
        document.body.modalStack = [];
    }
    document.body.modalStack.push(modalId);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Remove from modal stack
    if (document.body.modalStack) {
        const index = document.body.modalStack.indexOf(modalId);
        if (index > -1) {
            document.body.modalStack.splice(index, 1);
        }
    }
    
    // Restore body scroll if no modals are open
    if (!document.body.modalStack || document.body.modalStack.length === 0) {
        document.body.style.overflow = '';
    }
    
    // Restore focus to the element that opened the modal
    if (modal.previousFocusElement) {
        modal.previousFocusElement.focus();
        modal.previousFocusElement = null;
    }
}

// Wishlist Management Functions
function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlistItems')) || []; } catch (_) { return []; }
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
}

function toggleWishlistItem(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    let wishlist = getWishlist();
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    let wasAdded = false;
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        wasAdded = false;
    } else {
        // Add to wishlist
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        wishlist.push({ 
            id: productId, 
            title: product.title, 
            price: product.price,
            image: mainImage,
            description: product.description
        });
        wasAdded = true;
    }
    
    saveWishlist(wishlist);
    updateWishlistButtonsState();
    updateWishlistUI();
    
    // Show toast notification
    if (typeof toast !== 'undefined') {
        if (wasAdded) {
            toast.show(`💖 ${product.title} added to wishlist!`, 'success');
        } else {
            toast.show(`💔 ${product.title} removed from wishlist`, 'info');
        }
    }
}

function updateWishlistButtonsState() {
    const wishlist = getWishlist();
    const wishlistIds = new Set(wishlist.map(item => item.id));
    
    // Update all wishlist buttons
    document.querySelectorAll('.btn-wishlist[onclick*="toggleWishlistItem"]').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/toggleWishlistItem\('([^']+)'\)/);
        if (match) {
            const productId = match[1];
            if (wishlistIds.has(productId)) {
                btn.textContent = '♥'; // Filled heart
                btn.setAttribute('aria-label', 'Remove from wishlist');
                btn.style.color = '#ff6b6b';
            } else {
                btn.textContent = '♡'; // Empty heart
                btn.setAttribute('aria-label', 'Add to wishlist');
                btn.style.color = '';
            }
        }
    });
}

function updateWishlistUI() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }
    
    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item" data-id="${item.id}">
            <div class="wishlist-item-image">
                <img src="${item.image}" alt="${item.title}" width="80" height="60" loading="lazy">
            </div>
            <div class="wishlist-item-info">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <div class="wishlist-item-price">${formatCurrencyNaira(item.price)}</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="btn-primary" onclick="addToCart('${item.id}')">Add to Cart</button>
                <button class="btn-secondary" onclick="toggleWishlistItem('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function toggleWishlist() {
    openModal('wishlistModal');
    updateWishlistUI();
}

// Payment Integration with Paystack
function payWithPaystack(customerData) {
    if (!isPaystackConfigured()) {
        alert('Payment is not configured. Please add your Paystack public key.');
        return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    const { total } = computeTotals();
    const reference = 'bobo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    
    // Paystack expects amount in kobo (Nigerian cents)
    const amountInKobo = Math.round(total * 100);
    
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: customerData.email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: reference,
        metadata: {
            customer_name: customerData.name,
            customer_phone: customerData.phone,
            customer_address: customerData.address,
            customer_city: customerData.city,
            cart_items: JSON.stringify(cart),
            shipping_method: currentShipping,
            promo_code: currentPromo,
            order_summary: JSON.stringify(computeTotals())
        },
        callback: function(response) {
            // Payment successful
            console.log('Payment successful:', response);
            
            // Clear cart
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartCount');
            updateCartCount();
            updateCartUI();
            
            // Close checkout modal
            closeModal('checkoutModal');
            
            // Show success message
            const successEl = document.getElementById('checkoutSuccess');
            if (successEl) {
                successEl.textContent = `Payment successful! Your order reference is: ${response.reference}`;
                successEl.style.color = '#2ecc71';
                successEl.style.display = 'block';
                
                // Hide success message after 10 seconds
                setTimeout(() => {
                    successEl.style.display = 'none';
                }, 10000);
            }
            
            // Optional: Call verification endpoint
            verifyPayment(response.reference);
        },
        onClose: function() {
            // Payment popup closed without completing payment
            console.log('Payment popup closed');
        }
    });
    
    handler.openIframe();
}

// Optional payment verification
function verifyPayment(reference) {
    // Try Vercel-style endpoint first
    fetch(`/api/verify-paystack?reference=${encodeURIComponent(reference)}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Vercel endpoint not available');
        })
        .then(data => {
            console.log('Payment verified via Vercel:', data);
        })
        .catch(() => {
            // Try Netlify-style endpoint as fallback
            fetch(`/.netlify/functions/verify-paystack?reference=${encodeURIComponent(reference)}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Netlify endpoint not available');
                })
                .then(data => {
                    console.log('Payment verified via Netlify:', data);
                })
                .catch(error => {
                    console.log('Payment verification endpoints not available:', error.message);
                    // This is OK for static hosting - payment still went through Paystack
                });
        });
}

// Additional helper functions
function showModal(type, trigger) {
    // Generic modal content loader for various modal types
    const modal = document.getElementById('genericModal');
    const body = document.getElementById('modalBody');
    
    if (!modal || !body) return;
    
    const content = getModalContent(type);
    body.innerHTML = content;
    
    openModal('genericModal');
}

function getModalContent(type) {
    const contentMap = {
        'contact': `
            <h2 class="serif">Contact Us</h2>
            <form id="contactForm" class="contact-form" onsubmit="return submitContact(event)" novalidate>
                <div class="form-group">
                    <label for="contactName">Name</label>
                    <input id="contactName" name="name" type="text" required aria-required="true">
                </div>
                <div class="form-group">
                    <label for="contactEmail">Email</label>
                    <input id="contactEmail" name="email" type="email" required aria-required="true">
                </div>
                <div class="form-group">
                    <label for="contactSubject">Subject</label>
                    <input id="contactSubject" name="subject" type="text" required aria-required="true">
                </div>
                <div class="form-group">
                    <label for="contactMessage">Message</label>
                    <textarea id="contactMessage" name="message" rows="4" required aria-required="true"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        <span class="button-text">Send Message</span>
                        <span class="button-spinner" aria-hidden="true"></span>
                    </button>
                </div>
                <div id="contactSuccess" class="success-message" role="alert" aria-live="polite"></div>
            </form>
        `,
        'shipping': '<h2 class="serif">Shipping Information</h2><p>We offer standard (2-5 days) and express (1-2 days) shipping options. All items are carefully packaged with luxury materials.</p>',
        'returns': '<h2 class="serif">Returns Policy</h2><p>We accept returns within 30 days of purchase. Items must be in original condition with tags attached.</p>',
        'sizing': '<h2 class="serif">Size Guide</h2><p>Please refer to our detailed size charts for each category. Contact us for personalized fitting advice.</p>',
        'styling': '<h2 class="serif">Personal Styling</h2><p>Our VIP members enjoy complimentary personal styling sessions. Book an appointment with our fashion experts.</p>',
        'authenticity': '<h2 class="serif">Authenticity Guarantee</h2><p>Every item is guaranteed authentic and comes with a certificate of authenticity from our artisan partners.</p>',
        'gift': '<h2 class="serif">Gift Cards</h2><p>Purchase digital gift cards in any amount. Perfect for the luxury fashion enthusiast in your life.</p>',
        'careers': '<h2 class="serif">Careers</h2><p>Join our team of luxury fashion experts. We offer exciting opportunities in styling, curation, and customer experience.</p>',
        'sustainability': '<h2 class="serif">Sustainability</h2><p>We are committed to ethical sourcing and supporting traditional artisans while maintaining environmental responsibility.</p>',
        'press': '<h2 class="serif">Press & Media</h2><p>For press inquiries, high-resolution images, or interview requests, please contact our media relations team.</p>',
        'privacy': '<h2 class="serif">Privacy Policy</h2><p>We respect your privacy and are committed to protecting your personal information. View our full privacy policy for details.</p>',
        'terms': '<h2 class="serif">Terms of Service</h2><p>By using our website and services, you agree to our terms and conditions. Please read them carefully.</p>'
    };
    
    return contentMap[type] || '<h2>Information</h2><p>Content not available.</p>';
}

function showVIPModal() {
    openModal('vipModal');
}

function selectVIPPlan(plan) {
    // For now, just show a confirmation
    alert(`You selected the VIP ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Payment integration coming soon!`);
    closeModal('vipModal');
}

function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }
    
    closeModal('cartModal');
    openModal('checkoutModal');
    renderCheckoutSummary();
}

// -----------------------------------------
// Advanced Features: Toast Notifications
// -----------------------------------------

class ToastNotification {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 500;
            max-width: 350px;
            word-wrap: break-word;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            position: relative;
            border-left: 4px solid rgba(255,255,255,0.3);
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${this.getIcon(type)}</span>
                <span style="flex: 1;">${message}</span>
                <span style="opacity: 0.7; cursor: pointer; font-size: 18px; line-height: 1;">&times;</span>
            </div>
        `;

        // Close on click
        toast.addEventListener('click', () => this.hide(toast));
        
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    }

    hide(toast) {
        if (!toast.parentElement) return;
        
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentElement) {
                this.container.removeChild(toast);
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) this.toasts.splice(index, 1);
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Global toast instance
const toast = new ToastNotification();

// -----------------------------------------
// Enhanced Product Features
// -----------------------------------------

// Recently viewed products
function addToRecentlyViewed(productId) {
    let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recent = recent.filter(id => id !== productId);
    recent.unshift(productId);
    recent = recent.slice(0, 8); // Keep only 8 recent items
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
}

function getRecentlyViewed() {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    return recent.map(id => productsData.find(p => p.id === id)).filter(Boolean);
}

// Stock management
function updateStock(productId, quantity) {
    const product = productsData.find(p => p.id === productId);
    if (product && product.stock !== undefined) {
        product.stock = Math.max(0, product.stock - quantity);
        // Save to localStorage for persistence in demo
        const stockData = JSON.parse(localStorage.getItem('stockLevels') || '{}');
        stockData[productId] = product.stock;
        localStorage.setItem('stockLevels', JSON.stringify(stockData));
        
        // Show low stock notification
        if (product.stock <= product.lowStock && product.stock > 0) {
            toast.show(`⚠️ Only ${product.stock} left of ${product.title}!`, 'warning');
        } else if (product.stock === 0) {
            toast.show(`❌ ${product.title} is now out of stock`, 'error');
        }
        
        renderProducts(true); // Re-render to show stock status
    }
}

// Load stock from localStorage on init
function loadStoredStock() {
    const stockData = JSON.parse(localStorage.getItem('stockLevels') || '{}');
    Object.keys(stockData).forEach(productId => {
        const product = productsData.find(p => p.id === productId);
        if (product) {
            product.stock = stockData[productId];
        }
    });
}

// Advanced search with autocomplete
class SearchEngine {
    constructor(products) {
        this.products = products;
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }

    search(query, options = {}) {
        const { 
            category = null, 
            minPrice = null, 
            maxPrice = null, 
            sortBy = 'relevance',
            inStock = null 
        } = options;

        let results = this.products.filter(product => {
            const matchesQuery = this.matchesSearchQuery(product, query);
            const matchesCategory = !category || product.category === category;
            const matchesPrice = this.matchesPriceRange(product, minPrice, maxPrice);
            const matchesStock = inStock === null || (inStock ? product.stock > 0 : true);
            
            return matchesQuery && matchesCategory && matchesPrice && matchesStock;
        });

        // Sort results
        results = this.sortResults(results, sortBy, query);

        // Save search to history
        if (query.trim()) {
            this.addToSearchHistory(query);
        }

        return results;
    }

    matchesSearchQuery(product, query) {
        if (!query.trim()) return true;
        
        const searchTerms = query.toLowerCase().split(' ');
        const searchableText = [
            product.title,
            product.description,
            product.longDescription,
            ...(product.tags || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
    }

    matchesPriceRange(product, minPrice, maxPrice) {
        if (minPrice !== null && product.price < minPrice) return false;
        if (maxPrice !== null && product.price > maxPrice) return false;
        return true;
    }

    sortResults(results, sortBy, query) {
        switch (sortBy) {
            case 'price-asc':
                return results.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return results.sort((a, b) => b.price - a.price);
            case 'rating':
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'popularity':
                return results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            case 'newest':
                return results.sort((a, b) => {
                    const aIsNew = a.badge === 'New' ? 1 : 0;
                    const bIsNew = b.badge === 'New' ? 1 : 0;
                    return bIsNew - aIsNew;
                });
            case 'relevance':
            default:
                return this.sortByRelevance(results, query);
        }
    }

    sortByRelevance(results, query) {
        if (!query.trim()) return results;
        
        return results.sort((a, b) => {
            const aScore = this.calculateRelevanceScore(a, query);
            const bScore = this.calculateRelevanceScore(b, query);
            return bScore - aScore;
        });
    }

    calculateRelevanceScore(product, query) {
        const queryLower = query.toLowerCase();
        let score = 0;

        // Exact title match gets highest score
        if (product.title.toLowerCase().includes(queryLower)) {
            score += 100;
        }

        // Description match
        if (product.description.toLowerCase().includes(queryLower)) {
            score += 50;
        }

        // Tag matches
        if (product.tags) {
            product.tags.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower)) {
                    score += 25;
                }
            });
        }

        // Popularity bonus
        score += (product.popularity || 0) * 0.1;

        // Rating bonus
        score += (product.rating || 0) * 5;

        return score;
    }

    getSuggestions(query, limit = 5) {
        if (!query.trim() || query.length < 2) {
            return this.searchHistory.slice(0, limit).map(term => ({ type: 'history', value: term }));
        }

        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Product title suggestions
        this.products.forEach(product => {
            if (product.title.toLowerCase().includes(queryLower)) {
                suggestions.push({ type: 'product', value: product.title, product });
            }
        });

        // Tag suggestions
        const tags = new Set();
        this.products.forEach(product => {
            if (product.tags) {
                product.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(queryLower)) {
                        tags.add(tag);
                    }
                });
            }
        });

        tags.forEach(tag => {
            suggestions.push({ type: 'tag', value: tag });
        });

        return suggestions.slice(0, limit);
    }

    addToSearchHistory(query) {
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
}

// Global search engine instance
const searchEngine = new SearchEngine(productsData);

// Product Recommendations Engine
class RecommendationEngine {
    constructor(products) {
        this.products = products;
        this.viewHistory = JSON.parse(localStorage.getItem('productViewHistory') || '[]');
        this.purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
    }

    // Get similar products based on category and tags
    getSimilarProducts(productId, limit = 4) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return [];

        const similar = this.products
            .filter(p => p.id !== productId)
            .map(p => ({
                product: p,
                score: this.calculateSimilarityScore(product, p)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.product);

        return similar;
    }

    // Get personalized recommendations based on user behavior
    getPersonalizedRecommendations(limit = 6) {
        const userPreferences = this.analyzeUserPreferences();
        
        const recommendations = this.products
            .map(p => ({
                product: p,
                score: this.calculatePersonalizationScore(p, userPreferences)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.product);

        return recommendations;
    }

    // Get trending/popular products
    getTrendingProducts(limit = 4) {
        return this.products
            .filter(p => p.popularity && p.stock > 0)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }

    // Get products from same category
    getCategoryRecommendations(category, excludeId = null, limit = 4) {
        return this.products
            .filter(p => p.category === category && p.id !== excludeId && p.stock > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit);
    }

    // Get complementary products (accessories for clothing, etc.)
    getComplementaryProducts(productId, limit = 3) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return [];

        let complementaryCategory = null;
        if (product.category === 'clothing') {
            complementaryCategory = 'accessories';
        } else if (product.category === 'accessories') {
            complementaryCategory = 'clothing';
        }

        if (!complementaryCategory) {
            return this.getSimilarProducts(productId, limit);
        }

        return this.getCategoryRecommendations(complementaryCategory, null, limit);
    }

    // Get "customers also bought" recommendations
    getFrequentlyBoughtTogether(productId, limit = 3) {
        // In a real app, this would analyze purchase patterns
        // For now, we'll simulate with similar products and complementary items
        const similar = this.getSimilarProducts(productId, 2);
        const complementary = this.getComplementaryProducts(productId, 1);
        return [...similar, ...complementary].slice(0, limit);
    }

    // Calculate similarity score between two products
    calculateSimilarityScore(product1, product2) {
        let score = 0;

        // Same category gets high score
        if (product1.category === product2.category) {
            score += 50;
        }

        // Similar price range
        const priceDiff = Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
        score += (1 - priceDiff) * 20;

        // Shared tags
        if (product1.tags && product2.tags) {
            const sharedTags = product1.tags.filter(tag => product2.tags.includes(tag));
            score += sharedTags.length * 10;
        }

        // Rating similarity
        if (product1.rating && product2.rating) {
            const ratingDiff = Math.abs(product1.rating - product2.rating);
            score += (5 - ratingDiff) * 2;
        }

        return score;
    }

    // Analyze user preferences from viewing and purchase history
    analyzeUserPreferences() {
        const preferences = {
            categories: {},
            tags: {},
            priceRange: { min: 0, max: Infinity },
            avgRating: 0
        };

        const allViewed = [...this.viewHistory, ...this.purchaseHistory];
        if (allViewed.length === 0) return preferences;

        // Analyze categories
        allViewed.forEach(productId => {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                preferences.categories[product.category] = (preferences.categories[product.category] || 0) + 1;
                
                // Analyze tags
                if (product.tags) {
                    product.tags.forEach(tag => {
                        preferences.tags[tag] = (preferences.tags[tag] || 0) + 1;
                    });
                }
            }
        });

        return preferences;
    }

    // Calculate personalization score
    calculatePersonalizationScore(product, preferences) {
        let score = product.popularity || 0;

        // Category preference
        const categoryCount = preferences.categories[product.category] || 0;
        score += categoryCount * 20;

        // Tag preferences
        if (product.tags) {
            product.tags.forEach(tag => {
                const tagCount = preferences.tags[tag] || 0;
                score += tagCount * 10;
            });
        }

        // Rating boost
        score += (product.rating || 0) * 5;

        // Stock penalty for out of stock
        if (product.stock === 0) {
            score *= 0.1;
        }

        return score;
    }

    // Track product view
    trackView(productId) {
        this.viewHistory = this.viewHistory.filter(id => id !== productId);
        this.viewHistory.unshift(productId);
        this.viewHistory = this.viewHistory.slice(0, 50); // Keep last 50 views
        localStorage.setItem('productViewHistory', JSON.stringify(this.viewHistory));
    }

    // Track purchase
    trackPurchase(productId) {
        this.purchaseHistory.push(productId);
        localStorage.setItem('purchaseHistory', JSON.stringify(this.purchaseHistory));
    }

    // Get recommendations for homepage
    getHomepageRecommendations() {
        return {
            personalized: this.getPersonalizedRecommendations(6),
            trending: this.getTrendingProducts(4),
            recentlyViewed: this.getRecentlyViewedProducts(4)
        };
    }

    // Get recently viewed products
    getRecentlyViewedProducts(limit = 4) {
        return this.viewHistory
            .slice(0, limit)
            .map(id => this.products.find(p => p.id === id))
            .filter(Boolean);
    }
}

// Global recommendations engine
const recommendationEngine = new RecommendationEngine(productsData);

// Update showProductQuickView to track views for recommendations
function showProductQuickView(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    // Track for both recently viewed and recommendations
    addToRecentlyViewed(productId);
    recommendationEngine.trackView(productId);

    const modal = document.getElementById('genericModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    const isLowStock = product.stock <= product.lowStock;
    const isOutOfStock = product.stock === 0;
    const hasOriginalPrice = product.originalPrice && product.originalPrice > product.price;
    const discount = hasOriginalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    body.innerHTML = `
        <div class="quick-view-content">
            <h2 class="serif">${product.title}</h2>
            
            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img id="qvMainImage" src="${product.images ? product.images[0] : product.image}" alt="${product.title}" style="width: 100%; border-radius: 8px;" decoding="async" fetchpriority="high">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <div class="quick-view-nav">
                        <button class="btn-nav" type="button" data-qv-prev aria-label="Previous image">‹</button>
                        <div class="quick-view-count" id="qvCount"></div>
                        <button class="btn-nav" type="button" data-qv-next aria-label="Next image">›</button>
                    </div>
                    <div class="quick-view-thumbnails" id="qvThumbs"></div>
                    <div id="qvLive" class="sr-only" aria-live="polite"></div>
                </div>
                
                <div class="quick-view-details">
                    <div class="price-section">
                        <div class="current-price">${formatCurrencyNaira(product.price)}</div>
                        ${hasOriginalPrice ? `
                            <div class="original-price">${formatCurrencyNaira(product.originalPrice)}</div>
                            <div class="discount-badge">${discount}% OFF</div>
                        ` : ''}
                    </div>
                    
                    <div class="rating-section">
                        ${product.rating ? `
                            <div class="rating">
                                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                                <span class="rating-text">${product.rating} (${product.reviewCount} reviews)</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <p class="description">${product.longDescription || product.description}</p>
                    
                    <div class="stock-info">
                        ${isOutOfStock ? '<span class="out-of-stock">❌ Out of Stock</span>' :
                          isLowStock ? `<span class="low-stock">⚠️ Only ${product.stock} left!</span>` :
                          `<span class="in-stock">✅ In Stock (${product.stock} available)</span>`}
                    </div>
                    
                    ${product.variants ? renderVariantSelectors(product) : ''}
                    
                    <div class="quick-view-actions">
                        <div class="quantity-selector">
                            <button type="button" onclick="changeQuickViewQty(-1)">−</button>
                            <input type="number" id="quickViewQty" value="1" min="1" max="${product.stock}">
                            <button type="button" onclick="changeQuickViewQty(1)">+</button>
                        </div>
                        
                        <button class="btn-primary" onclick="addToCartFromQuickView('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        
                        <button class="btn-wishlist" onclick="toggleWishlistItem('${product.id}'); updateQuickViewWishlist('${product.id}')" 
                                id="quickViewWishlistBtn" aria-label="Add to wishlist">♡</button>
                    </div>
                    
                    ${product.tags ? `
                        <div class="product-tags">
                            ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    openModal('genericModal');
    updateQuickViewWishlist(productId);

    // Quick View Gallery setup
    try {
        const images = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
        let currentIndex = 0;
        const mainImg = document.getElementById('qvMainImage');
        const thumbs = document.getElementById('qvThumbs');
        const countEl = document.getElementById('qvCount');
        const liveEl = document.getElementById('qvLive');
        const prevBtn = document.querySelector('[data-qv-prev]');
        const nextBtn = document.querySelector('[data-qv-next]');

        function setIndex(i) {
            if (!images.length) return;
            currentIndex = (i + images.length) % images.length;
            updateUI();
        }

        function updateUI() {
            const src = images[currentIndex];
            if (mainImg) {
                mainImg.src = src;
                try { mainImg.srcset = getResponsiveSrcSet(src, product.id); } catch (_) {}
                mainImg.sizes = '(max-width: 768px) 90vw, 60vw';
                mainImg.setAttribute('alt', product.title);
            }
            if (countEl) countEl.textContent = `${currentIndex + 1} / ${images.length}`;
            if (liveEl) liveEl.textContent = `Image ${currentIndex + 1} of ${images.length}`;
            if (thumbs) {
                thumbs.querySelectorAll('.quick-view-thumbnail').forEach((btn, idx) => {
                    btn.setAttribute('aria-current', idx === currentIndex ? 'true' : 'false');
                });
            }
        }

        if (thumbs) {
            thumbs.innerHTML = images.map((src, i) => `
                <button class="quick-view-thumbnail" type="button" data-idx="${i}" aria-current="${i===0?'true':'false'}" aria-label="Image ${i+1} of ${images.length}">
                    <img src="${src}" alt="" width="64" height="64" loading="lazy" decoding="async" />
                </button>
            `).join('');
            thumbs.addEventListener('click', (e) => {
                const btn = e.target.closest('.quick-view-thumbnail');
                if (!btn) return;
                const i = parseInt(btn.getAttribute('data-idx')) || 0;
                setIndex(i);
            });
            thumbs.addEventListener('keydown', (e) => {
                const btn = e.target.closest('.quick-view-thumbnail');
                if (!btn) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const i = parseInt(btn.getAttribute('data-idx')) || 0;
                    setIndex(i);
                }
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => setIndex(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => setIndex(currentIndex + 1));

        // Arrow key support while modal is open
        if (window._qvKeydownHandler) {
            document.removeEventListener('keydown', window._qvKeydownHandler);
        }
        window._qvKeydownHandler = function (e) {
            const modal = document.getElementById('genericModal');
            const open = modal && (modal.classList.contains('show') || modal.style.display === 'block');
            if (!open) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); setIndex(currentIndex + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); setIndex(currentIndex - 1); }
            else if (e.key === 'Home') { e.preventDefault(); setIndex(0); }
            else if (e.key === 'End') { e.preventDefault(); setIndex(images.length - 1); }
        };
        document.addEventListener('keydown', window._qvKeydownHandler);

        updateUI();
    } catch (_) { /* no-op */ }
}

function renderVariantSelectors(product) {
    let html = '<div class="variant-selectors">';
    
    if (product.variants && product.variants.colors) {
        html += '<div class="variant-group">';
        html += '<label>Color:</label>';
        html += '<div class="color-options">';
        product.variants.colors.forEach((color, index) => {
            html += `<button class="color-option ${index === 0 ? 'selected' : ''}" 
                     style="background-color: ${color.hex}" 
                     title="${color.name}" 
                     data-color="${color.name}"
                     onclick="selectVariant('color', '${color.name}', this)"></button>`;
        });
        html += '</div></div>';
    }
    
    if (product.variants && product.variants.sizes) {
        html += '<div class="variant-group">';
        html += '<label>Size:</label>';
        html += '<select id="sizeSelect" onchange="selectVariant(\'size\', this.value, this)">';
        product.variants.sizes.forEach((size, index) => {
            html += `<option value="${size}" ${index === 0 ? 'selected' : ''}>${size}</option>`;
        });
        html += '</select></div>';
    }
    
    if (product.variants && product.variants.lengths) {
        html += '<div class="variant-group">';
        html += '<label>Length:</label>';
        html += '<select id="lengthSelect" onchange="selectVariant(\'length\', this.value, this)">';
        product.variants.lengths.forEach((length, index) => {
            html += `<option value="${length}" ${index === 0 ? 'selected' : ''}>${length}</option>`;
        });
        html += '</select></div>';
    }
    
    html += '</div>';
    return html;
}

// Global variant selection state
let currentVariantSelection = {};

function selectVariant(type, value, element) {
    currentVariantSelection[type] = value;
    
    // Update UI for color selection
    if (type === 'color' && element) {
        // Remove selected class from all color options
        const colorOptions = element.parentElement.querySelectorAll('.color-option');
        colorOptions.forEach(option => option.classList.remove('selected'));
        
        // Add selected class to clicked option
        element.classList.add('selected');
    }
    
    console.log('Selected variants:', currentVariantSelection);
    // You can add more logic here to update pricing, availability, etc.
}

function changeQuickViewQty(delta) {
    const input = document.getElementById('quickViewQty');
    if (input) {
        const newValue = Math.max(1, Math.min(parseInt(input.max), parseInt(input.value) + delta));
        input.value = newValue;
    }
}

function addToCartFromQuickView(productId) {
    const qtyInput = document.getElementById('quickViewQty');
    const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    
    const product = productsData.find(p => p.id === productId);
    if (!product || product.stock < quantity) {
        toast.show('Not enough stock available', 'error');
        return;
    }
    
    // Add to cart
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: productId, title: product.title, price: product.price, quantity });
    }
    saveCart(cart);
    updateCartCount();
    updateCartUI();
    
    // Update stock
    updateStock(productId, quantity);
    
    toast.show(`Added ${quantity}x ${product.title} to cart`, 'success');
    closeModal('genericModal');
}

function updateQuickViewWishlist(productId) {
    const wishlist = getWishlist();
    const btn = document.getElementById('quickViewWishlistBtn');
    if (btn) {
        const isInWishlist = wishlist.some(item => item.id === productId);
        btn.textContent = isInWishlist ? '♥' : '♡';
        btn.style.color = isInWishlist ? '#ff6b6b' : '';
        btn.setAttribute('aria-label', isInWishlist ? 'Remove from wishlist' : 'Add to wishlist');
    }
}

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

// -----------------------------------------
// Enhanced Navbar - Mobile Menu Integration
// -----------------------------------------

// Override mobile menu function to work with enhanced navbar
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!navLinks || !mobileMenu) return;

    const isOpening = !navLinks.classList.contains('active');
    
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
    navLinks.setAttribute('aria-hidden', isOpening ? 'false' : 'true');
    
    if (isOpening) {
        document.body.classList.add('no-scroll');
        document.body.setAttribute('data-nav-open', '');
        
        // Force navbar to be visible and non-transparent when menu is open
        if (window.enhancedNavbar) {
            window.enhancedNavbar.show();
            window.enhancedNavbar.header.classList.remove('header--transparent');
            window.enhancedNavbar.header.classList.add('header--scrolled');
        }
    } else {
        document.body.classList.remove('no-scroll');
        document.body.removeAttribute('data-nav-open');
        
        // Let enhanced navbar resume normal operation
        if (window.enhancedNavbar) {
            setTimeout(() => {
                window.enhancedNavbar.updateNavbar();
            }, 100);
        }
    }
}

// -----------------------------------------
// Performance Utilities
// -----------------------------------------

// Debounce utility for scroll events
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle utility for high-frequency events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// requestAnimationFrame utility with fallback
function requestAnimFrame(callback) {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60);
           };
}

// -----------------------------------------
// Enhanced UI Interactions
// -----------------------------------------

// Add smooth scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button (if needed)
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top-btn';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--deep-green);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: bold;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    button.addEventListener('click', scrollToTop);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 300) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        } else {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
        }
    }, { passive: true });
    
    document.body.appendChild(button);
    return button;
}

// -----------------------------------------
// Enhanced Error Handling
// -----------------------------------------

// Global error handler for better UX
window.addEventListener('error', (e) => {
    console.error('Global error caught:', e.error);
    // Don't show technical errors to users in production
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        toast.show(`Development error: ${e.error.message}`, 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// -----------------------------------------
// Enhanced Accessibility Features
// -----------------------------------------

// Announce dynamic content changes to screen readers
function announceToScreenReader(message, priority = 'polite') {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

// Enhanced keyboard navigation
function initKeyboardNavigation() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#products';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--deep-green);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10001;
        border-radius: 4px;
        transition: top 0.2s ease;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhanced focus management for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const openModal = document.querySelector('.modal.show, .modal[style*="block"]');
            if (openModal) {
                trapFocusInModal(e, openModal);
            }
        }
    });
}

function trapFocusInModal(e, modal) {
    const focusableElements = modal.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
    }
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', () => {
    initKeyboardNavigation();
    
    // Add scroll to top button if needed
    // createScrollToTopButton();
});

// -----------------------------------------
// Browser Feature Detection
// -----------------------------------------

// Check for essential browser features
function checkBrowserSupport() {
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        customProperties: window.CSS && CSS.supports && CSS.supports('(--foo: bar)'),
        backdropFilter: CSS.supports && CSS.supports('backdrop-filter: blur(10px)'),
        webkitBackdropFilter: CSS.supports && CSS.supports('-webkit-backdrop-filter: blur(10px)'),
        gridLayout: CSS.supports && CSS.supports('display: grid'),
        flexbox: CSS.supports && CSS.supports('display: flex')
    };
    
    // Add feature classes to body for CSS feature detection
    Object.entries(features).forEach(([feature, supported]) => {
        document.documentElement.classList.toggle(`supports-${feature}`, supported);
    });
    
    // Fallbacks for unsupported features
    if (!features.backdropFilter && !features.webkitBackdropFilter) {
        document.documentElement.classList.add('no-backdrop-filter');
    }
    
    return features;
}

// Initialize feature detection on load
document.addEventListener('DOMContentLoaded', () => {
    checkBrowserSupport();
});

// -----------------------------------------
// Cleanup and Page Visibility
// -----------------------------------------

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause expensive operations when tab is hidden
        if (window.enhancedNavbar) {
            window.enhancedNavbar.pauseUpdates = true;
        }
    } else {
        // Resume operations when tab becomes visible
        if (window.enhancedNavbar) {
            window.enhancedNavbar.pauseUpdates = false;
            // Force an update
            setTimeout(() => {
                window.enhancedNavbar.updateNavbar();
            }, 100);
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.enhancedNavbar) {
        window.enhancedNavbar.destroy();
    }
});

// -----------------------------------------
// Render Variant Selectors Helper
// -----------------------------------------

// Moving this outside of the class for global access
function renderVariantSelectors(product) {
    let html = '<div class="variant-selectors">';
    
    if (product.variants && product.variants.colors) {
        html += '<div class="variant-group">';
        html += '<label>Color:</label>';
        html += '<div class="color-options">';
        product.variants.colors.forEach((color, index) => {
            html += `<button class="color-option ${index === 0 ? 'selected' : ''}" 
                     style="background-color: ${color.hex}" 
                     title="${color.name}" 
                     data-color="${color.name}"
                     onclick="selectVariant('color', '${color.name}', this)"></button>`;
        });
        html += '</div></div>';
    }
    
    if (product.variants && product.variants.sizes) {
        html += '<div class="variant-group">';
        html += '<label>Size:</label>';
        html += '<select id="sizeSelect" onchange="selectVariant(\'size\', this.value, this)">';
        product.variants.sizes.forEach((size, index) => {
            html += `<option value="${size}" ${index === 0 ? 'selected' : ''}>${size}</option>`;
        });
        html += '</select></div>';
    }
    
    if (product.variants && product.variants.lengths) {
        html += '<div class="variant-group">';
        html += '<label>Length:</label>';
        html += '<select id="lengthSelect" onchange="selectVariant(\'length\', this.value, this)">';
        product.variants.lengths.forEach((length, index) => {
            html += `<option value="${length}" ${index === 0 ? 'selected' : ''}>${length}</option>`;
        });
        html += '</select></div>';
    }
    
    html += '</div>';
    return html;
}
 