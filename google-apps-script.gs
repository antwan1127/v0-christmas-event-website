const SPREADSHEET_ID = "1bZn8yozeI8BNC7oFpWgi1V4CrEno3rOCZmc3J-K6MHE"
const SHEET_NAME = "Sheet1"

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
  "InstaPay Link",
]

const SERVANT_EVENT = "اجتماع الخدمه العام مارمرقرس م.الجديده"
const LEGACY_SERVANT_EVENTS = ["مارمرقس م.الجديده اجتماع"]
const SORT_NAME_COLUMN = 3
const FIT_EXTRA_WIDTH = 20

function normalize(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[\s\u200f\u200e]+/g, "")
    .replace(/[٠-٩]/g, function (digit) {
      return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    })
}


function isServantEvent(event) {
  const normalizedEvent = normalize(event)
  return [SERVANT_EVENT].concat(LEGACY_SERVANT_EVENTS).some(function (name) {
    return normalize(name) === normalizedEvent
  })
}

function getSheet_() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)
  if (!sheet) {
    throw new Error(SHEET_NAME + " was not found in the configured spreadsheet.")
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length)
  const currentHeaders = headerRange.getValues()[0]
  if (currentHeaders.every(function (value) { return value === "" })) {
    headerRange.setValues([HEADERS])
    headerRange.setFontWeight("bold")
  }
  return sheet
}

function getExistingRows(sheet) {
  const lastRow = sheet.getLastRow()
  return lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues()
    : []
}

function isDuplicate(data, rows) {
  const event = normalize(data.question1 || data.eventType)
  const servant = isServantEvent(event) || Boolean(data.servantName || data.servantPhone)
  const name = normalize(data.servantName || data.question2)
  const family = servant ? normalize(data.question3) : ""

  if (!event || !name || (servant && !family)) return false

  const eventMatches = function (existingEvent) {
    return servant
      ? isServantEvent(existingEvent)
      : normalize(existingEvent) === event
  }

  return rows.some(function (row) {
    return eventMatches(row[1]) &&
      normalize(row[2]) === name &&
      (!servant || normalize(row[3]) === family)
  })
}


function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  try {
    const data = e && e.parameter ? e.parameter : {}
    if (data.action !== "checkDuplicate") {
      return ContentService.createTextOutput("Apps Script web app is working")
        .setMimeType(ContentService.MimeType.TEXT)
    }

    const event = data.question1 || data.eventType ||
      ((data.servantName || data.servantPhone) ? SERVANT_EVENT : "")
    if (!event) {
      return jsonResponse_({
        success: false,
        duplicate: false,
        error: "Missing event type for duplicate check.",
      })
    }

    const sheet = getSheet_()
    const rows = getExistingRows(sheet)
    const duplicate = isDuplicate(Object.assign({}, data, { question1: event }), rows)
    return jsonResponse_({ success: true, duplicate: duplicate })
  } catch (error) {
    return jsonResponse_({ success: false, duplicate: false, error: String(error) })
  }
}

function nameSortKey_(value) {
  return String(value || "")
    .trim()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[\u200f\u200e]/g, "")
    .replace(/\s+/g, " ")
}

function sortByParticipantName_(sheet) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 3) return

  const range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length)
  const rows = range.getValues()
  const sorted = rows.slice().sort(function (a, b) {
    const nameA = nameSortKey_(a[SORT_NAME_COLUMN - 1])
    const nameB = nameSortKey_(b[SORT_NAME_COLUMN - 1])
    if (!nameA && nameB) return 1
    if (nameA && !nameB) return -1
    return nameA.localeCompare(nameB, "ar")
  })

  const changed = sorted.some(function (row, index) {
    return JSON.stringify(row) !== JSON.stringify(rows[index])
  })
  if (changed) range.setValues(sorted)
}

function fitColumnsAndRows_(sheet) {
  sheet.autoResizeColumns(1, HEADERS.length)
  for (let column = 1; column <= HEADERS.length; column++) {
    sheet.setColumnWidth(column, sheet.getColumnWidth(column) + FIT_EXTRA_WIDTH)
  }
  const lastRow = sheet.getLastRow()
  if (lastRow > 0) sheet.autoResizeRows(1, lastRow)
}

function sortSheetNow() {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)
  try {
    const sheet = getSheet_()
    sortByParticipantName_(sheet)
    fitColumnsAndRows_(sheet)
  } finally {
    lock.releaseLock()
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  let lockAcquired = false

  try {
    lock.waitLock(30000)
    lockAcquired = true

    const data = e && e.parameter ? e.parameter : {}
    if (!data.question1 || !data.question2) {
      throw new Error("Required registration fields are missing.")
    }
    if (isServantEvent(data.question1) && (!data.question3 || !data.question4)) {
      throw new Error("Servant family and phone number are required.")
    }

    const sheet = getSheet_()

    const rows = getExistingRows(sheet)
    if (isDuplicate(data, rows)) {
      return jsonResponse_({
        success: false,
        duplicate: true,
        message: "This registration has already been submitted.",
      })
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
      data.question13 || "",
    ]

    sheet.appendRow(rowData)
    try {
      sortByParticipantName_(sheet)
      fitColumnsAndRows_(sheet)
    } catch (sortError) {
      console.error("Registration was saved, but sorting/resizing failed: " + sortError)
    }

    return jsonResponse_({ success: true, message: "Registration saved successfully" })
  } catch (error) {
    console.error("Registration save failed: " + error)
    return jsonResponse_({ success: false, error: String(error) })
  } finally {
    if (lockAcquired) lock.releaseLock()
  }
}
