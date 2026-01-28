# Minimal Group Paradigm - Google Sheets Version

Data saves to Google Sheets. No database setup required.

## Quick Start

1. Create Google Sheet
2. Add Apps Script (from `GoogleAppsScript.gs`)
3. Deploy as Web App
4. Paste URL into `sheetsService.ts`
5. Run: `npm install && npm run dev`

See **START_HERE_SHEETS.md** for step-by-step.

## How It Works

- User completes experiment → saved to your Google Sheet (new row)
- View http://localhost:3000/results → see aggregated charts
- View your Google Sheet → see raw data

## Files

**New:**
- `sheetsService.ts` - Saves/loads from Google Sheets (30 lines)
- `GoogleAppsScript.gs` - The script that runs on Google's servers (60 lines)
- `ResultsPage.tsx` - Shows aggregated results
- `SETUP.md` - Full instructions

**Modified:**
- `App.tsx` - Saves results when user finishes (1 line added)
- `index.tsx` - Simple routing for /results (3 lines added)

## Why Google Sheets?

- **0 config** - Just paste one URL
- **0 setup** - No Firebase, no database
- **Easy to view** - Raw data in familiar spreadsheet
- **Free** - Google Sheets is free
- **Export** - Download as CSV/Excel anytime

## Data Collected

Each completion adds a row:
- Timestamp
- User Group (Over/Under)
- In-Group Avg Points
- Out-Group Avg Points
- In-Group Avg Rating
- Out-Group Avg Rating
- Bias Score

## Results Page

Shows:
- Total participants
- Average bias score
- Group distribution chart
- Points allocation chart
- Social ratings chart
- Individual bias distribution

## Deploy

Works anywhere:
- **Netlify**: Drag & drop
- **Vercel**: Connect repo
- **Local**: `npm run dev` and share your IP

## Limits

Google Sheets can handle 5 million cells. For this app, that's ~700,000 users. You'll be fine.
