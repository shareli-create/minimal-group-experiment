import { UserStats, Group } from "./types";

// This will be the Google Apps Script Web App URL
// You'll get this AFTER deploying the script (see SETUP.md)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0BpDb8riIZi3B9UpYdQ3V0YHbNKvb9ef-A7y2bJUoBTkyg8SReTdD9HzEWnsobDJBGg/exec";

export async function saveUserResults(stats: UserStats, userGroup: Group): Promise<void> {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...stats,
        userGroup,
        timestamp: new Date().toISOString()
      })
    });
    console.log('Results saved to Google Sheets');
  } catch (error) {
    console.error('Error saving results:', error);
  }
}

export async function getAllResults(): Promise<Array<UserStats & { userGroup: Group; timestamp: string }>> {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
}
