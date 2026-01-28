# START HERE

## 3 Steps Total

### 1. Create Google Sheet + Add Script (3 minutes)

1. Go to https://sheets.google.com → Create blank sheet
2. Click **Extensions** → **Apps Script**
3. Delete everything, paste code from `GoogleAppsScript.gs`
4. Save
5. Click **Deploy** → **New deployment** → Web app
6. Set "Who has access" to **Anyone**
7. Deploy and **COPY THE URL**

### 2. Paste URL into sheetsService.ts (30 seconds)

Open `sheetsService.ts`, line 5:
```typescript
const SCRIPT_URL = "PASTE_YOUR_SCRIPT_URL_HERE";
```

Replace with your URL.

### 3. Run (30 seconds)

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## See Results

- **Raw data**: Open your Google Sheet
- **Charts**: Go to http://localhost:3000/results

---

That's it. Read SETUP.md if you need more detail.
