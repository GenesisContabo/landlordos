const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const PROOFS_DIR = path.join(__dirname, 'proofs');

// Ensure proofs directory exists
if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function runAudit() {
  console.log('Starting Stage 6 Content Quality Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    visual: { score: 0, issues: [], screenshots: [] },
    seo: { score: 0, issues: [], pages: {} },
    accessibility: { score: 0, violations: [] },
    performance: { score: 0, issues: [] },
    security: { score: 0, issues: [] },
    brand: { score: 0, issues: [] }
  };

  // ============================================
  // 1. VISUAL AUDIT (min 70/100)
  // ============================================
  console.log('1. Running Visual Audit...');
  const pages = [
    { path: '/', name: 'home' },
    { path: '/pricing', name: 'pricing' },
    { path: '/login', name: 'login' },
    { path: '/signup', name: 'signup' }
  ];

  let visualIssues = 0;

  for (const pageDef of pages) {
    try {
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(PROOFS_DIR, `visual_${pageDef.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.visual.screenshots.push(screenshotPath);
      console.log(`  ✓ Screenshot: ${pageDef.name}`);

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.complete || img.naturalHeight === 0).length;
      });
      if (brokenImages > 0) {
        visualIssues += brokenImages;
        results.visual.issues.push(`${pageDef.path}: ${brokenImages} broken images`);
      }

      // Check for text overflow
      const overflowElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const style = window.getComputedStyle(el);
          return el.scrollWidth > el.clientWidth && style.overflow === 'visible';
        }).length;
      });
      if (overflowElements > 0) {
        visualIssues += Math.min(overflowElements, 3); // Cap impact
        results.visual.issues.push(`${pageDef.path}: ${overflowElements} overflow elements`);
      }

    } catch (err) {
      visualIssues += 10;
      results.visual.issues.push(`${pageDef.path}: Failed to load - ${err.message}`);
    }
  }

  results.visual.score = Math.max(0, 100 - (visualIssues * 5));
  console.log(`  Visual Score: ${results.visual.score}/100\n`);

  // ============================================
  // 2. SEO AUDIT (min 70/100)
  // ============================================
  console.log('2. Running SEO Audit...');
  let seoIssues = 0;

  for (const pageDef of pages) {
    try {
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'domcontentloaded' });

      const seoData = await page.evaluate(() => {
        const title = document.querySelector('title')?.textContent || '';
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const h1Count = document.querySelectorAll('h1').length;
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
        const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
        const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;

        return { title, metaDesc, h1Count, canonical, ogTitle, ogDesc, ogImage, imagesWithoutAlt };
      });

      results.seo.pages[pageDef.path] = seoData;

      // Check title (10-60 chars)
      if (!seoData.title || seoData.title.length < 10 || seoData.title.length > 60) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: Title length invalid (${seoData.title.length} chars)`);
      }

      // Check meta description (>50 chars)
      if (!seoData.metaDesc || seoData.metaDesc.length < 50) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: Meta description too short (${seoData.metaDesc.length} chars)`);
      }

      // Check H1 count (exactly 1)
      if (seoData.h1Count !== 1) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: H1 count is ${seoData.h1Count} (should be 1)`);
      }

      // Check OG tags
      if (!seoData.ogTitle) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: Missing og:title`);
      }
      if (!seoData.ogDesc) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: Missing og:description`);
      }
      if (!seoData.ogImage) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: Missing og:image`);
      }

      // Check images with alt text
      if (seoData.imagesWithoutAlt > 0) {
        seoIssues++;
        results.seo.issues.push(`${pageDef.path}: ${seoData.imagesWithoutAlt} images without alt text`);
      }

    } catch (err) {
      seoIssues += 5;
      results.seo.issues.push(`${pageDef.path}: SEO check failed - ${err.message}`);
    }
  }

  results.seo.score = Math.max(0, 100 - (seoIssues * 5));
  console.log(`  SEO Score: ${results.seo.score}/100\n`);

  // ============================================
  // 3. ACCESSIBILITY AUDIT (min 80/100)
  // ============================================
  console.log('3. Running Accessibility Audit (axe-core)...');

  // Install axe-core on the page
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
  });

  let totalViolations = 0;

  for (const pageDef of pages) {
    try {
      await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: 'networkidle' });

      // Inject axe if needed
      const axeExists = await page.evaluate(() => typeof window.axe !== 'undefined');
      if (!axeExists) {
        await page.addScriptTag({
          url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
        });
      }

      const axeResults = await page.evaluate(async () => {
        return await axe.run();
      });

      const violations = axeResults.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      totalViolations += violations.length;

      violations.forEach(v => {
        results.accessibility.violations.push({
          page: pageDef.path,
          id: v.id,
          impact: v.impact,
          description: v.description,
          count: v.nodes.length
        });
      });

    } catch (err) {
      totalViolations += 5;
      results.accessibility.violations.push({
        page: pageDef.path,
        error: err.message
      });
    }
  }

  results.accessibility.score = Math.max(0, 100 - (totalViolations * 5));
  console.log(`  Accessibility Score: ${results.accessibility.score}/100 (${totalViolations} violations)\n`);

  // ============================================
  // 4. PERFORMANCE AUDIT (min 75/100)
  // ============================================
  console.log('4. Running Performance Audit...');
  let perfIssues = 0;

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Check bundle size estimates
    const resources = await page.evaluate(() => {
      const perf = performance.getEntriesByType('resource');
      const jsSize = perf.filter(r => r.name.includes('.js')).reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const cssSize = perf.filter(r => r.name.includes('.css')).reduce((sum, r) => sum + (r.transferSize || 0), 0);
      return { jsSize, cssSize, total: jsSize + cssSize };
    });

    // Large JS bundle (>500KB is concerning)
    if (resources.jsSize > 500000) {
      perfIssues += 2;
      results.performance.issues.push(`Large JS bundle: ${(resources.jsSize/1024).toFixed(0)}KB`);
    }

    // Check for lazy loading on images
    const imagesWithoutLazy = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img:not([loading="lazy"])')).length;
    });
    if (imagesWithoutLazy > 3) {
      perfIssues++;
      results.performance.issues.push(`${imagesWithoutLazy} images not lazy-loaded`);
    }

  } catch (err) {
    perfIssues += 3;
    results.performance.issues.push(`Performance check failed: ${err.message}`);
  }

  results.performance.score = Math.max(0, 100 - (perfIssues * 10));
  console.log(`  Performance Score: ${results.performance.score}/100\n`);

  // ============================================
  // 5. SECURITY AUDIT (min 80/100)
  // ============================================
  console.log('5. Running Security Audit...');
  let securityIssues = 0;

  // Check for dangerouslySetInnerHTML without DOMPurify
  const dangerousHTML = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.filter(s =>
      s.textContent.includes('dangerouslySetInnerHTML') &&
      !s.textContent.includes('DOMPurify')
    ).length;
  });

  if (dangerousHTML > 0) {
    securityIssues += 2;
    results.security.issues.push(`Found ${dangerousHTML} uses of dangerouslySetInnerHTML (check for DOMPurify)`);
  }

  // Check security headers (would need server check, skipping for now)
  // Checking for exposed secrets in source (basic check)
  const pageContent = await page.content();
  const suspiciousPatterns = [
    /sk_live_[a-zA-Z0-9]{24,}/,  // Stripe live keys
    /sk_test_[a-zA-Z0-9]{24,}/,  // Stripe test keys (less critical but still bad)
    /AKIA[0-9A-Z]{16}/,          // AWS keys
  ];

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(pageContent)) {
      securityIssues += 10; // Critical!
      results.security.issues.push(`CRITICAL: Potential exposed secret matching pattern ${pattern}`);
    }
  });

  results.security.score = Math.max(0, 100 - (securityIssues * 10));
  console.log(`  Security Score: ${results.security.score}/100\n`);

  // ============================================
  // 6. BRAND CONSISTENCY AUDIT (min 80/100)
  // ============================================
  console.log('6. Running Brand Consistency Audit...');
  let brandIssues = 0;

  // Expected colors from DESIGN_SPECIFICATION.json
  const expectedColors = {
    primary: '#2563EB',
    secondary: '#059669',
    accent: '#EA580C'
  };

  // Default Tailwind colors to avoid
  const defaultTailwindColors = ['#3B82F6', '#6366F1', '#8B5CF6'];

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Check CSS variables
  const cssVars = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      primary: root.getPropertyValue('--color-primary').trim() || root.getPropertyValue('--primary').trim(),
      secondary: root.getPropertyValue('--color-secondary').trim() || root.getPropertyValue('--secondary').trim(),
      accent: root.getPropertyValue('--color-accent').trim() || root.getPropertyValue('--accent').trim(),
    };
  });

  // Normalize colors for comparison (handle both hex and rgb)
  const normalizeColor = (color) => {
    if (!color) return '';
    return color.replace(/\s/g, '').toLowerCase();
  };

  if (normalizeColor(cssVars.primary) !== normalizeColor(expectedColors.primary)) {
    brandIssues++;
    results.brand.issues.push(`Primary color mismatch: expected ${expectedColors.primary}, got ${cssVars.primary}`);
  }
  if (normalizeColor(cssVars.secondary) !== normalizeColor(expectedColors.secondary)) {
    brandIssues++;
    results.brand.issues.push(`Secondary color mismatch: expected ${expectedColors.secondary}, got ${cssVars.secondary}`);
  }
  if (normalizeColor(cssVars.accent) !== normalizeColor(expectedColors.accent)) {
    brandIssues++;
    results.brand.issues.push(`Accent color mismatch: expected ${expectedColors.accent}, got ${cssVars.accent}`);
  }

  // Check for default Tailwind colors in computed styles
  const hasDefaultColors = await page.evaluate((defaults) => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.some(el => {
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      const color = style.color;
      const border = style.borderColor;

      return defaults.some(defaultColor =>
        bg.includes(defaultColor) || color.includes(defaultColor) || border.includes(defaultColor)
      );
    });
  }, defaultTailwindColors);

  if (hasDefaultColors) {
    brandIssues++;
    results.brand.issues.push('Using default Tailwind colors instead of custom brand colors');
  }

  // Check for logo presence
  const hasLogo = await page.evaluate(() => {
    return document.querySelector('img[alt*="logo" i], img[src*="logo"]') !== null ||
           document.querySelector('svg[aria-label*="logo" i]') !== null;
  });

  if (!hasLogo) {
    brandIssues += 2;
    results.brand.issues.push('No logo found on homepage');
  }

  results.brand.score = Math.max(0, 100 - (brandIssues * 10));
  console.log(`  Brand Consistency Score: ${results.brand.score}/100\n`);

  await browser.close();

  // ============================================
  // CALCULATE OVERALL SCORE
  // ============================================
  const weights = {
    visual: 0.15,
    seo: 0.20,
    accessibility: 0.25,
    performance: 0.15,
    security: 0.15,
    brand: 0.10
  };

  const overallScore = Math.round(
    results.visual.score * weights.visual +
    results.seo.score * weights.seo +
    results.accessibility.score * weights.accessibility +
    results.performance.score * weights.performance +
    results.security.score * weights.security +
    results.brand.score * weights.brand
  );

  // ============================================
  // CHECK MINIMUM THRESHOLDS
  // ============================================
  const minimums = {
    visual: 70,
    seo: 70,
    accessibility: 80,
    performance: 75,
    security: 80,
    brand: 80
  };

  const failures = [];
  Object.keys(minimums).forEach(audit => {
    if (results[audit].score < minimums[audit]) {
      failures.push(`${audit}: ${results[audit].score}/${minimums[audit]} (FAILED)`);
    }
  });

  const blocksDeploy = failures.length > 0 || overallScore < 75;
  const verified = !blocksDeploy;

  // ============================================
  // GENERATE CHECKPOINT
  // ============================================
  const checkpoint = {
    stage: 6,
    stage_name: 'CONTENT_QUALITY',
    business_id: 'landlordos',
    verified,
    completed_at: new Date().toISOString(),
    score: overallScore,
    executor: 'hudson',
    audits: {
      visual: { score: results.visual.score, minimum: 70, passed: results.visual.score >= 70, issues: results.visual.issues },
      seo: { score: results.seo.score, minimum: 70, passed: results.seo.score >= 70, issues: results.seo.issues },
      accessibility: { score: results.accessibility.score, minimum: 80, passed: results.accessibility.score >= 80, violations: results.accessibility.violations },
      performance: { score: results.performance.score, minimum: 75, passed: results.performance.score >= 75, issues: results.performance.issues },
      security: { score: results.security.score, minimum: 80, passed: results.security.score >= 80, issues: results.security.issues },
      brand: { score: results.brand.score, minimum: 80, passed: results.brand.score >= 80, issues: results.brand.issues }
    },
    blocks_deploy: blocksDeploy,
    failures: failures.length > 0 ? failures : undefined
  };

  fs.writeFileSync(
    path.join(__dirname, 'stage_6_checkpoint.json'),
    JSON.stringify(checkpoint, null, 2)
  );

  // ============================================
  // PRINT SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('STAGE 6 AUDIT COMPLETE');
  console.log('========================================\n');
  console.log(`Overall Score: ${overallScore}/100 (minimum 75 required)\n`);
  console.log('Audit Breakdown:');
  console.log(`  Visual:        ${results.visual.score}/100 (min 70) ${results.visual.score >= 70 ? '✓' : '✗'}`);
  console.log(`  SEO:           ${results.seo.score}/100 (min 70) ${results.seo.score >= 70 ? '✓' : '✗'}`);
  console.log(`  Accessibility: ${results.accessibility.score}/100 (min 80) ${results.accessibility.score >= 80 ? '✓' : '✗'}`);
  console.log(`  Performance:   ${results.performance.score}/100 (min 75) ${results.performance.score >= 75 ? '✓' : '✗'}`);
  console.log(`  Security:      ${results.security.score}/100 (min 80) ${results.security.score >= 80 ? '✓' : '✗'}`);
  console.log(`  Brand:         ${results.brand.score}/100 (min 80) ${results.brand.score >= 80 ? '✓' : '✗'}`);
  console.log('\n');

  if (failures.length > 0) {
    console.log('⚠️  FAILED AUDITS:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n');
  }

  console.log(`Status: ${verified ? '✓ VERIFIED - Ready for Stage 7' : '✗ BLOCKED - Fix issues before deployment'}`);
  console.log(`Checkpoint written to: stage_6_checkpoint.json`);
  console.log(`Screenshots saved to: ${PROOFS_DIR}`);
  console.log('\n========================================\n');

  process.exit(verified ? 0 : 1);
}

// Wait for server to be ready
setTimeout(() => {
  runAudit().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}, 10000); // Wait 10s for server to start
