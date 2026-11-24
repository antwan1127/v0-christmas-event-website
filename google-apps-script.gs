const SPREADSHEET_ID = "1bZn8yozeI8BNC7oFpWgi1V4CrEno3rOCZmc3J-K6MHE";
const SHEET_NAME = "Sheet1";

const HEADERS = [
  "Timestamp",
  "Question 1",
  "Question 2: Participant Name",
  "Question 3",
  "Question 4",
  "Question 5: Father Name",
  "Question 6: Mother Name",
  "Question 7: Parent Phone",
  "Question 8",
  "Question 9",
  "Payment Info",
  "Total Amount",
  "InstaPay Reference",
  "InstaPay Link"
];

function doGet(e) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Registration script is running"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    lock.waitLock(30000);
    lockAcquired = true;

    const isJson = e && e.postData && /application\/json/i.test(e.postData.type || "");
    const data = isJson
      ? JSON.parse(e.postData.contents || "{}")
      : e && e.parameter ? e.parameter : {};
    if (!data.question1 || !data.question2) {
      throw new Error("Event and participant name are required.");
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet1 was not found");
    }

    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    const currentHeaders = headerRange.getValues()[0];
    if (currentHeaders.every(function (value) { return value === ""; })) {
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight("bold");
    }

    const rowData = [
      new Date(),
      data.question1 || "",
      data.question2 || "",
      data.question3 || "",
      data.question4 || "",
      data.question5 || "",
      data.question6 || "",
      data.question7 || "",
      data.question8 || "",
      data.question9 || "",
      data.question10 || "",
      data.question11 || "",
      data.question12 || "",
      data.question13 || ""
    ];

    sheet.appendRow(rowData);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Registration saved successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}
