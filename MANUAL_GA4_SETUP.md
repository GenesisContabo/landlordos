# Manual GA4 Setup Required for LandlordOS

## ⚠️ CRITICAL: Shared GA4 ID Detected

The deployment currently uses the SHARED GA4 Measurement ID: **G-5B00STQFQL**

**Each business MUST have its OWN Google Analytics property.**

---

## Steps to Create NEW GA4 Property

### 1. Navigate to Google Analytics
Go to: https://analytics.google.com

### 2. Sign In
Use Google account credentials from .env:
- Email: (associated with GOOGLE_ANALYTICS_CLIENT_ID)

### 3. Click Admin
Click the **gear icon** in the bottom left corner

### 4. Create New Property
In the **Property** column (middle):
- Click **"Create Property"** (if you see existing properties)
- OR click **"Create"** → **"Property"** at the top

### 5. Configure Property
- **Property name:** LandlordOS Website
- **Reporting time zone:** Your timezone
- **Currency:** USD
- Click **"Next"**

### 6. Business Information (Optional)
- Industry: Real Estate
- Business size: Small
- Click **"Next"**

### 7. Business Objectives (Optional)
- Select relevant objectives (e.g., "Examine user behavior")
- Click **"Create"**

### 8. Accept Terms of Service
- Check the boxes
- Click **"I Accept"**

### 9. Create Data Stream
- Platform: **Web**
- Website URL: **https://landlordos.vercel.app**
- Stream name: **LandlordOS Production**
- Click **"Create stream"**

### 10. Copy Measurement ID
You'll see a screen with:
```
Measurement ID: G-XXXXXXXXXX
```

**Copy this ID!** It starts with "G-" followed by 10 characters.

### 11. Take Screenshot
- Take a screenshot showing the Measurement ID
- Save as: `C:\Users\Administrator\Desktop\BrowserBase Pipeline\website-genesis-output\landlordos\proofs\ga4_new_measurement_id.png`

### 12. Create Output File
Create file: `stage_9_output.json` with content:

```json
{
  "measurement_id": "G-YOUR_NEW_ID",
  "property_id": "properties/YOUR_PROPERTY_ID",
  "property_name": "LandlordOS Website",
  "data_stream_url": "https://landlordos.vercel.app",
  "created_at": "2026-01-14T01:XX:XXZ"
}
```

Replace `G-YOUR_NEW_ID` with the actual Measurement ID you copied.

---

## Update Vercel Environment Variable

After creating the new GA4 property:

```powershell
cd "C:\Users\Administrator\Desktop\BrowserBase Pipeline\website-genesis-output\landlordos"

# Add new measurement ID
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production --token Lj8oejZWJKGfmmb2bmcPJ0Lj
# When prompted, enter: G-YOUR_NEW_ID

# Redeploy with new ID
vercel --prod --yes --token Lj8oejZWJKGfmmb2bmcPJ0Lj
```

---

## Verify Tracking

1. Visit https://landlordos.vercel.app
2. Open Chrome DevTools (F12)
3. Go to Network tab
4. Filter for "gtag"
5. You should see requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-YOUR_NEW_ID`
   - Analytics events being sent

---

## Google Search Console Setup

After GA4 is complete:

### 1. Navigate to Search Console
Go to: https://search.google.com/search-console

### 2. Add Property
- Click **"Add property"**
- Choose **"URL prefix"**
- Enter: **https://landlordos.vercel.app**
- Click **"Continue"**

### 3. Verify Ownership
Choose verification method:
- **HTML tag** (easiest): Add meta tag to `app/layout.tsx`
- **Google Analytics** (if GA4 is set up)
- **Domain name provider**

### 4. Submit Sitemap
After verification:
- Go to **Sitemaps** in left menu
- Enter: **https://landlordos.vercel.app/sitemap.xml**
- Click **"Submit"**

### 5. Screenshot
- Take screenshot of verified property
- Save as: `proofs/gsc_verified.png`

---

## Why This Matters

**Shared GA4 ID Issues:**
- Can't distinguish between different businesses
- Analytics data gets mixed together
- Can't track individual business performance
- Violates Genesis pipeline requirements (Law 1)

**Each business needs:**
- Unique GA4 property
- Unique Measurement ID
- Separate analytics dashboard
- Individual performance tracking

---

## Status

Current: ❌ Using shared ID G-5B00STQFQL
Required: ✅ Unique ID G-XXXXXXXXXX

**Stage 9 cannot be marked complete until:**
1. New GA4 property created
2. New Measurement ID deployed to Vercel
3. GSC property added and verified
4. Screenshots saved as proof
5. `stage_9_output.json` created with new IDs
