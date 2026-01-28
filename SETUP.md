# SETUP - GOOGLE SHEETS VERSION (5 MINUTES)

## Step 1: Create Google Sheet (1 minute)

1. Go to https://sheets.google.com
2. Click "Blank" to create new sheet
3. Name it whatever you want (e.g., "Minimal Group Results")
4. **Keep this tab open**

## Step 2: Add the Script (2 minutes)

1. In your sheet, click **Extensions** → **Apps Script**
2. Delete everything in the editor
3. Copy **ALL** the code from `GoogleAppsScript.gs` 
4. Paste it into the Apps Script editor
5. Click **Save** (disk icon)

## Step 3: Deploy (1 minute)

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to [your project name] (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** (looks like: https://script.google.com/macros/s/AKfycbxXXXXX/exec)

## Step 4: Update Your Code (30 seconds)

1. Open `sheetsService.ts`
2. Find line 5: `const SCRIPT_URL = "PASTE_YOUR_SCRIPT_URL_HERE";`
3. Replace `"PASTE_YOUR_SCRIPT_URL_HERE"` with your URL from Step 3
4. Save the file

## Step 5: Run (30 seconds)

```bash
npm install
npm run dev
```

Go to http://localhost:3000

Done.

---

## What Happens Now

- Every time someone completes the experiment → new row in your Google Sheet
- Go to http://localhost:3000/results → see aggregated charts
- Open your Google Sheet anytime → see all the raw data

---

## To Deploy (so others can access)

### Netlify (easiest):
1. Go to https://app.netlify.com
2. Drag your project folder
3. Done - they give you a URL

### Or just run locally:
```bash
npm run dev
```

Share your computer's URL with participants on the same network.

---

## Troubleshooting

**"SCRIPT_URL not defined"** → You didn't update sheetsService.ts with your script URL

**Nothing saves** → Check your Google Sheet permissions (Step 3, number 4)

**"Authorization required"** → Redo Step 3, numbers 6-9

---

## Security Note

Anyone with your script URL can write to your sheet. For a classroom experiment, this is fine. If you want more security later, you can add authentication to the Apps Script.
