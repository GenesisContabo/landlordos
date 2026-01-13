# CHUNK 6: SEO & ANALYTICS - FINAL CHUNK

## Completion Promise
```
npm run build exits 0 AND
sitemap.xml generates dynamically AND
robots.txt exists AND
All pages have unique meta tags AND
Google Analytics 4 integrated AND
Schema.org markup present
```

## Requirements

### 1. Meta Tags System
- Unique title and description for every page
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags
- Viewport and charset meta tags
- Theme color meta tag

### 2. Dynamic Sitemap
- `/sitemap.xml` route that generates XML sitemap
- Include all static pages (/, /pricing, /login, /signup)
- Include dashboard pages for logged-in users
- Set lastmod, changefreq, priority

### 3. Robots.txt
- `/robots.txt` route
- Allow all crawlers
- Reference sitemap.xml location
- Disallow sensitive paths (/api/, /dashboard/settings)

### 4. Google Analytics 4
- Create lib/analytics.ts with GA4 helper functions
- Add GA4 script to root layout
- Track page views
- Track custom events (signup, login, property_added)
- Use NEXT_PUBLIC_GA_MEASUREMENT_ID from env

### 5. Schema.org Markup
- Add Organization schema to homepage
- Add SoftwareApplication schema
- Add BreadcrumbList schema to dashboard pages
- JSON-LD format in <script> tags

### 6. Favicon Integration
- Verify favicon.ico exists in /app
- Add apple-touch-icon
- Add manifest.json reference

## Pages Requiring Unique Meta Tags

1. **Homepage (/)** - "LandlordOS - Property Management Software"
2. **Pricing (/pricing)** - "Pricing Plans - LandlordOS"
3. **Login (/login)** - "Sign In - LandlordOS"
4. **Signup (/signup)** - "Create Account - LandlordOS"
5. **Dashboard (/dashboard)** - "Dashboard - LandlordOS"
6. **Properties (/dashboard/properties)** - "My Properties - LandlordOS"
7. **Tenants (/dashboard/tenants)** - "Tenants - LandlordOS"
8. **Maintenance (/dashboard/maintenance)** - "Maintenance Requests - LandlordOS"
9. **Payments (/dashboard/payments)** - "Payment History - LandlordOS"
10. **Settings (/dashboard/settings)** - "Account Settings - LandlordOS"

## Files to Create

1. `app/sitemap.xml/route.ts` - Dynamic sitemap generation
2. `app/robots.txt/route.ts` - Robots.txt route
3. `lib/analytics.ts` - GA4 helper functions
4. `components/seo/JsonLd.tsx` - Schema.org component
5. `lib/metadata.ts` - Centralized metadata helper

## Files to Modify

1. `app/layout.tsx` - Add GA4 script, default meta tags
2. `app/page.tsx` - Homepage meta tags + schema
3. `app/pricing/page.tsx` - Pricing meta tags
4. `app/login/page.tsx` - Login meta tags
5. `app/signup/page.tsx` - Signup meta tags
6. `app/dashboard/layout.tsx` - Dashboard default meta tags
7. `app/dashboard/page.tsx` - Dashboard meta tags
8. `app/dashboard/properties/page.tsx` - Properties meta tags
9. `.env.local` - Add NEXT_PUBLIC_GA_MEASUREMENT_ID (placeholder)

## Acceptance Criteria

✅ Every page has unique title and description
✅ Open Graph and Twitter Card tags present
✅ /sitemap.xml returns valid XML
✅ /robots.txt returns valid robots.txt
✅ GA4 tracking code in root layout
✅ Schema.org markup on homepage
✅ npm run build exits 0
✅ No TypeScript errors
✅ All meta tags validated

## Testing Commands

```bash
npm run build
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

## Notes

- Use Next.js 14 Metadata API (export const metadata)
- Use generateMetadata for dynamic pages
- GA4 measurement ID format: G-XXXXXXXXXX
- Schema.org in JSON-LD format only
- All external URLs must be absolute (https://...)
