# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Bobo & Omoge** is a luxury African-inspired fashion e-commerce static site with client-side shopping cart functionality and Paystack payment integration. The site showcases premium products with advanced features including product quick views, search functionality, stock management, and administrative order tracking.

## Development Commands

### Local Development Servers

**Simple Static Preview (basic functionality):**
```bash
# Using the custom dev server
node dev-server.js [port]
# Default port 3000, serves all static files with proper MIME types

# Or using serve
npm i -g serve
serve -l 3000 --single
```

**Full-Featured Development (with serverless functions):**
```bash
# Netlify Dev (enables /.netlify/functions/verify-paystack)
npm i -g netlify-cli
netlify dev
# Requires .env with PAYSTACK_SECRET_KEY=sk_test_xxx

# Vercel Dev (enables /api/verify-paystack)
npm i -g vercel
vercel dev
# Requires .env.local with PAYSTACK_SECRET_KEY=sk_test_xxx
```

### Testing & Admin

**View Orders (Local Admin):**
```bash
# Open orders.html in browser after running local server
# URL: http://localhost:3000/orders.html
# Admin interface for managing local orders stored in localStorage
```

**Paystack Integration Testing:**
```bash
# Test verification endpoints locally
curl "http://localhost:8888/.netlify/functions/verify-paystack?reference=TEST_REF"
curl "http://localhost:3000/api/verify-paystack?reference=TEST_REF"
```

### Deployment

**GitHub Pages (automatic):**
- Push to `main` branch triggers GitHub Actions workflow
- Uses `pages.yml` and `gh-pages.yml` workflows
- Deployed site available at `https://<username>.github.io/<repo>/`

**Manual Deploy Preparation:**
```bash
# No build step required - pure static site
# All assets are already optimized and ready to serve
rsync -av --delete --exclude ".git" --exclude ".github" ./ dist/
```

## Architecture & Code Structure

### High-Level Architecture

The application follows a **client-side SPA pattern** with static hosting:
- **Frontend**: Vanilla HTML/CSS/JS with progressive enhancement
- **Payments**: Client-side Paystack integration with serverless verification
- **Data**: Product catalog in JavaScript, orders/cart in localStorage
- **Deployment**: Static hosting with optional serverless functions

### Key Files & Responsibilities

**Core Application:**
- `index.html` - Main SPA with complete UI structure and metadata
- `script.js` - All application logic including cart, search, payments (~2500+ lines)
- `style.css` - Base styling system with CSS custom properties
- `enhanced-styles.css` - Advanced UI features (toasts, quick-view modal, variants)

**Payment & Admin:**
- `api/verify-paystack.js` - Vercel serverless function for payment verification
- `netlify/functions/verify-paystack.js` - Netlify serverless function (same purpose)
- `orders.html` + `orders.js` - Local admin interface for order management

**Development & Utilities:**
- `dev-server.js` - Custom Node.js static server with proper MIME types
- `.github/workflows/` - CI/CD for GitHub Pages deployment

### Data Architecture

**Product Data Model:**
```javascript
{
    id: 'unique-id',
    title: 'Product Name',
    description: 'Short description',
    longDescription: 'Detailed description for quick view',
    price: 50000, // in kobo/cents
    originalPrice: 60000, // optional for discounts
    category: 'clothing|accessories|limited',
    badge: 'New|Limited|Editors Pick', // optional
    stock: 10,
    lowStock: 3, // threshold for low stock warnings
    images: ['url1', 'url2'], // multiple images for gallery
    variants: {
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Blue', hex: '#0000ff' }],
        lengths: ['16"', '18"'] // for jewelry
    },
    tags: ['searchable', 'keywords'],
    rating: 4.5,
    reviewCount: 23,
    popularity: 85 // for sorting
}
```

**State Management:**
- Products: Static array in `script.js` (`productsData`)
- Cart: localStorage (`cart`, `cartCount`)
- Stock: localStorage (`productStock`) - simulated for demo
- Orders: localStorage (`orders`) - client-side order history
- User preferences: localStorage (shipping, promos, recently viewed)

### Advanced Features

**Toast Notification System:**
- Global toast manager (`ToastNotification` class)
- Auto-dismiss with manual close options
- Types: success, error, warning, info
- Stock alerts and user feedback

**Product Quick View Modal:**
- Image galleries with thumbnails and navigation
- Variant selection (colors with hex codes, sizes, lengths)
- Stock validation and quantity controls
- Direct add-to-cart/wishlist functionality

**Smart Search Engine:**
- Full-text search across titles, descriptions, tags
- Relevance scoring algorithm
- Advanced filters (price, category, stock status)
- Multiple sort options (relevance, price, rating, popularity)
- Search history and suggestions

**Stock Management System:**
- Real-time stock updates on purchase
- Low stock warnings via toast notifications
- Out-of-stock prevention in cart/checkout
- Stock persistence via localStorage (demo only)

### Paystack Integration

**Client-Side Flow:**
1. Customer fills checkout form with shipping details
2. Paystack popup handles payment collection
3. On success, attempts verification via serverless endpoint
4. Order stored locally with verification status

**Verification Endpoints:**
- Vercel: `/api/verify-paystack?reference=REF`
- Netlify: `/.netlify/functions/verify-paystack?reference=REF`
- Fallback gracefully if no serverless endpoint available

**Security Notes:**
- `PAYSTACK_PUBLIC_KEY` in client code (safe to expose)
- `PAYSTACK_SECRET_KEY` only in serverless environment variables
- Order verification prevents client-side tampering

## Configuration

### Paystack Setup
```javascript
// In script.js - replace with your public key
const PAYSTACK_PUBLIC_KEY = 'pk_test_replace_with_your_key';

// In serverless environment
PAYSTACK_SECRET_KEY = 'sk_test_xxx' // or sk_live_xxx for production
```

### Promo Codes
```javascript
// In script.js
const PROMO_CODES = {
    'VIP10': 0.10,    // 10% discount
    'BOBO20': 0.20,   // 20% discount
    // Add more codes here
};
```

### Stock Configuration
```javascript
// Each product has configurable thresholds
stock: 10,        // Current stock level
lowStock: 3,      // Show warning below this level
```

## Important Notes

### Content Security Policy
The site includes a strict CSP that allows Paystack domains. Update the meta tag in `index.html` if deploying to different domains or adding new external resources.

### GitHub Pages Compatibility
- `index.html` includes dynamic base href detection for GitHub Pages subdirectory deployment
- All asset paths are relative and work under `/repo/` subpaths
- Serverless verification disabled on GitHub Pages (static only)

### Responsive Design
- Mobile-first approach with extensive responsive breakpoints
- Touch-friendly interface elements for mobile devices
- Progressive enhancement - works without JavaScript for basic browsing

### Performance Considerations
- Lazy loading for product images with responsive srcsets
- Efficient DOM updates and event delegation
- Minimal external dependencies (only Paystack and Google Fonts)
- Optimized animations with reduced motion support

## Troubleshooting

### Payment Issues
- Check `PAYSTACK_PUBLIC_KEY` is set correctly in script.js
- Verify serverless environment has `PAYSTACK_SECRET_KEY`
- Test verification endpoints manually with curl

### Stock Not Updating
- Stock is localStorage-based for demo - clear browser storage to reset
- In production, replace with actual inventory management system

### Toast Notifications Not Showing
- Ensure `enhanced-styles.css` is loaded after `style.css`
- Check browser console for JavaScript errors
- Verify toast container is created in DOM

### Search Not Working
- Confirm `SearchEngine` class is properly instantiated
- Check that products have searchable content (title, description, tags)
- Verify search form event listeners are attached

This codebase represents a production-ready e-commerce solution with comprehensive features, clean architecture, and extensive customization options.
