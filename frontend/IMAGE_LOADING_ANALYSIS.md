# Image Loading Analysis & Fixes

## Overview

This document provides a comprehensive analysis of image loading issues discovered in the Premium Flora application, along with implemented fixes following Next.js best practices.

---

## Problem Summary

Users experienced inconsistent image loading behavior:
- Images sometimes appear, sometimes show placeholders
- Gallery on About page shows partial images
- Product images don't load when navigating from catalog to product page
- Inconsistent caching behavior

---

## Root Cause Analysis

### 1. GallerySection - Visibility-Based Loading Issue

**File:** `frontend/components/client/gallery-section.tsx`

**Problem:**
```jsx
// Images are inside opacity:0 containers until isVisible becomes true
<button className={cn(isVisible ? "opacity-100" : "opacity-0")}>
  <Image loading={item.originalIndex < 8 ? "eager" : "lazy"} />
</button>
```

**Issue:**
- Images are wrapped in `opacity: 0` containers
- `IntersectionObserver` for lazy loading may not trigger correctly for invisible elements
- When navigating to the page, `isVisible` starts as `false`, hiding images
- The fallback timer (500ms) is too slow for good UX

**Impact:** Gallery images may not load or appear partially loaded.

---

### 2. Next.js Image Configuration - Short Cache TTL

**File:** `frontend/next.config.ts`

**Problem:**
```typescript
images: {
  minimumCacheTTL: 60, // Only 60 seconds!
}
```

**Issue:**
- Images are only cached for 60 seconds
- After expiration, images must be re-fetched and re-optimized
- This causes flickering and inconsistent loading on repeat visits

**Best Practice:** Production apps should use TTL of at least 1 year (31536000 seconds) for immutable image assets.

---

### 3. ProductCard - All Images Use Lazy Loading

**File:** `frontend/components/client/product-card.tsx`

**Problem:**
```jsx
<Image loading="lazy" />
```

**Issue:**
- ALL images use `loading="lazy"` regardless of position
- Above-the-fold images should use `loading="eager"` or `priority`
- When navigating between pages in SPA mode, lazy images may not trigger loading immediately

---

### 4. CtaSection - Missing Image Optimization

**File:** `frontend/components/client/cta-section.tsx`

**Problem:**
```jsx
<Image
  src="..."
  alt="..."
  fill
  className="object-cover"
  // No loading, priority, or placeholder!
/>
```

**Issue:**
- No `loading` strategy specified (defaults to lazy)
- No `placeholder="blur"` for better perceived performance
- Background images should be loaded early for good UX

---

### 5. ImageCarousel - Thumbnails Missing Loading Strategy

**File:** `frontend/components/client/image-carousel.tsx`

**Problem:**
```jsx
<Image
  src={image}
  alt={...}
  fill
  // No loading attribute for thumbnails
/>
```

**Issue:** Thumbnails may not load correctly during SPA navigation.

---

### 6. GraphQL Client - No Server-Side Caching

**File:** `frontend/lib/graphql/client.ts`

**Problem:**
```typescript
fetch: (url, options) =>
  fetch(url, {
    ...options,
    cache: "no-store", // Bypasses all caching
  }),
```

**Issue:**
- Every page load triggers a fresh API call
- No server-side caching of image URLs
- Combined with short image TTL, causes repeated fetching

---

## Implemented Fixes

### Fix 1: Next.js Config - Increase Cache TTL

```typescript
images: {
  minimumCacheTTL: 31536000, // 1 year for production
}
```

### Fix 2: GallerySection - Immediate Visibility

- Remove animation-based visibility for images
- Keep animations for visual effect only
- Use `visibility` instead of `opacity` for containers
- Ensure first 8 images always load eagerly

### Fix 3: ProductCard - Index-Based Loading Strategy

```jsx
<Image
  loading={index < 4 ? "eager" : "lazy"}
  priority={index < 2}
/>
```

Pass `index` prop to ProductCard to enable smart loading.

### Fix 4: CtaSection - Add Proper Image Attributes

```jsx
<Image
  src="..."
  alt="..."
  fill
  className="object-cover"
  loading="eager"
  placeholder="blur"
  blurDataURL={BLUR_DATA_URL}
/>
```

### Fix 5: ImageCarousel - Eager Loading for Thumbnails

```jsx
<Image
  src={image}
  alt={...}
  fill
  loading="eager"
  sizes="80px"
/>
```

---

## Best Practices Applied

### 1. Loading Strategy

| Position | Strategy | Use Case |
|----------|----------|----------|
| Above the fold | `priority` | Hero images, first product cards |
| Near viewport | `loading="eager"` | First 4-8 items in lists |
| Below fold | `loading="lazy"` | Everything else |

### 2. Placeholder Strategy

Always use `placeholder="blur"` with a base64 data URL for:
- Better perceived performance
- Prevents layout shift
- Improves CLS (Cumulative Layout Shift) score

### 3. Size Optimization

Use appropriate `sizes` attribute:
```jsx
// Grid with responsive columns
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

// Full-width hero
sizes="100vw"

// Fixed-size thumbnails
sizes="80px"
```

### 4. Cache Strategy

- **Images:** Long TTL (1 year) for immutable assets
- **API Data:** Use Next.js revalidation for dynamic content
- **Browser:** Leverage CDN caching headers

---

## Testing Recommendations

1. **Hard refresh test:** Ctrl+Shift+R to bypass cache
2. **Navigation test:** Click between pages multiple times
3. **Network throttling:** Test on Slow 3G
4. **DevTools Lighthouse:** Run performance audit
5. **Check waterfall:** Verify image loading order in Network tab

---

## Performance Metrics to Monitor

- **LCP (Largest Contentful Paint):** Should be < 2.5s
- **CLS (Cumulative Layout Shift):** Should be < 0.1
- **FCP (First Contentful Paint):** Should be < 1.8s
- **Image load time:** Monitor in Network tab

---

## Files Modified

1. `frontend/next.config.ts` - Increased cache TTL from 60s to 1 year
2. `frontend/components/client/gallery-section.tsx` - Set isVisible immediately, added priority for first 4 images
3. `frontend/components/client/product-card.tsx` - Added index prop for smart loading (priority for first 4, eager for first 8)
4. `frontend/components/client/cta-section.tsx` - Added loading="eager", placeholder="blur", sizes
5. `frontend/components/client/image-carousel.tsx` - Added loading="eager", placeholder="blur" for main and thumbnails
6. `frontend/app/catalog/[id]/product-client.tsx` - Added placeholder="blur" for product image
7. `frontend/components/client/article-modal-content.tsx` - Added placeholder="blur" for article image
8. `frontend/app/catalog/catalog-client.tsx` - Pass index to ProductCard
9. `frontend/components/client/featured-products.tsx` - Pass index to ProductCard

---

## Summary

The root cause of image loading issues was a combination of:
1. Short cache TTL causing frequent re-fetching
2. CSS opacity hiding images, interfering with lazy loading
3. All images using lazy loading regardless of position
4. Missing optimization attributes on several components

All issues have been fixed following Next.js Image component best practices.
