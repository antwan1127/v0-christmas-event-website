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

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\u200f\u200e]+/g, "")
    .replace(/[٠-٩]/g, function (digit) {
      return "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
    });
}

function getExistingRows(sheet) {
  const lastRow = sheet.getLastRow();
  return lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues()
    : [];
}

function normalizePhone(value) {
  return normalize(value).replace(/[^0-9]/g, "");
}

function getIdentity(data) {
  const name = normalize(data.question2);
  const phone = [data.question7, data.question4, data.question6]
    .map(normalizePhone)
    .find(function (value) { return value.length >= 7; }) || "";

  return name && phone ? JSON.stringify([name, phone]) : "";
}

function getIdentityFromRow(row) {
  return getIdentity({
    question2: row[2],
    question4: row[4],
    question6: row[6],
    question7: row[7]
  });
}

function isDuplicate(data, rows) {
  const identity = getIdentity(data);
  if (!identity) return false;

  return rows.some(function (row) {
    return getIdentityFromRow(row) === identity;
  });
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";

    if (action !== "checkDuplicate") {
      return ContentService
        .createTextOutput("Apps Script web app is working")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet1 was not found");
    }

    const duplicate = isDuplicate(e.parameter, getExistingRows(sheet));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        duplicate: duplicate
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        duplicate: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    const data = e && e.parameter ? e.parameter : {};
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

    if (isDuplicate(data, getExistingRows(sheet))) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          duplicate: true,
          message: "This registration has already been submitted."
        }))
        .setMimeType(ContentService.MimeType.JSON);
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
    lock.releaseLock();
  }
}
