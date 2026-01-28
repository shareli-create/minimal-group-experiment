// Google Apps Script - This runs on Google's servers
// Copy this entire file and paste it into Google Apps Script

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // If first time, add headers
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'User Group',
      'In-Group Avg Points',
      'Out-Group Avg Points', 
      'In-Group Avg Rating',
      'Out-Group Avg Rating',
      'Bias Score'
    ]);
  }
  
  // Add the data
  sheet.appendRow([
    data.timestamp,
    data.userGroup,
    data.inGroupAvgPoints,
    data.outGroupAvgPoints,
    data.inGroupAvgRating,
    data.outGroupAvgRating,
    data.biasScore
  ]);
  
  return ContentService.createTextOutput('Success');
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const headers = data[0];
  const rows = data.slice(1);
  
  // Convert to JSON
  const results = rows.map(row => ({
    timestamp: row[0],
    userGroup: row[1],
    inGroupAvgPoints: Number(row[2]),
    outGroupAvgPoints: Number(row[3]),
    inGroupAvgRating: Number(row[4]),
    outGroupAvgRating: Number(row[5]),
    biasScore: Number(row[6])
  }));
  
  return ContentService
    .createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}
