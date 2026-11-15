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
const RESERVATION_PREFIX = "registration_reservation_"
const RESERVATION_TTL_MS = 30 * 60 * 1000

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

function normalizePhone(value) {
  return normalize(value).replace(/[^0-9]/g, "")
}

function getIdentity_(data) {
  const rawEvent = String(data.question1 || data.eventType || "").trim()
  const event = normalize(rawEvent)
  const servant = isServantEvent(rawEvent) || Boolean(data.servantName || data.servantPhone)
  const name = normalize(data.servantName || data.question2)

  if (!event || !name) return null

  if (servant) {
    const family = normalize(data.servantFamily || data.question3)
    const phone = normalizePhone(data.servantPhone || data.question4)
    if (!family || !phone) return null
    return {
      key: JSON.stringify(["servant", name, family, phone]),
      servant: true,
    }
  }

  const phone = [data.question6, data.question7]
    .map(normalizePhone)
    .find(function (value) { return value.length >= 7 }) || ""
  if (!phone) return null

  return {
    key: JSON.stringify(["regular", event, name, phone]),
    servant: false,
  }
}

function getIdentityFromRow_(row) {
  const event = row[1]
  if (isServantEvent(event)) {
    return getIdentity_({
      question1: event,
      question2: row[2],
      question3: row[3],
      question4: row[4],
    })
  }

  return getIdentity_({
    question1: event,
    question2: row[2],
    question5: row[5],
    question6: row[6],
    question7: row[7],
  })
}

function isDuplicate(data, rows) {
  const identity = getIdentity_(data)
  if (!identity) return false

  return rows.some(function (row) {
    const existingIdentity = getIdentityFromRow_(row)
    return existingIdentity && existingIdentity.key === identity.key
  })
}

function getReservationPropertyKey_(identity) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, identity.key)
  return RESERVATION_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, "")
}

function parseReservation_(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

function removeExpiredReservations_(properties, now) {
  const allProperties = properties.getProperties()
  Object.keys(allProperties).forEach(function (key) {
    if (key.indexOf(RESERVATION_PREFIX) !== 0) return
    const reservation = parseReservation_(allProperties[key])
    if (!reservation || Number(reservation.expiresAt) <= now) {
      properties.deleteProperty(key)
    }
  })
}

function reserveRegistration_(data, sheet) {
  const identity = getIdentity_(data)
  if (!identity) {
    return { success: false, error: "Required identifying fields are missing." }
  }

  if (isDuplicate(data, getExistingRows(sheet))) {
    return {
      success: false,
      duplicate: true,
      message: "This registration already exists. Payment is not available.",
    }
  }

  const properties = PropertiesService.getScriptProperties()
  const now = Date.now()
  removeExpiredReservations_(properties, now)
  const propertyKey = getReservationPropertyKey_(identity)
  const existing = parseReservation_(properties.getProperty(propertyKey))

  if (existing && Number(existing.expiresAt) > now) {
    if (
      (data.reservationToken && data.reservationToken === existing.token) ||
      (data.clientRequestId && data.clientRequestId === existing.clientRequestId)
    ) {
      return {
        success: true,
        duplicate: false,
        reservationToken: existing.token,
        expiresAt: existing.expiresAt,
      }
    }
    return {
      success: false,
      duplicate: true,
      inProgress: true,
      message: "This registration is already being completed. Payment is not available.",
    }
  }

  const reservation = {
    token: Utilities.getUuid(),
    clientRequestId: String(data.clientRequestId || ""),
    expiresAt: now + RESERVATION_TTL_MS,
  }
  properties.setProperty(propertyKey, JSON.stringify(reservation))
  return {
    success: true,
    duplicate: false,
    reservationToken: reservation.token,
    expiresAt: reservation.expiresAt,
  }
}

function releaseRegistrationReservation_(data) {
  const identity = getIdentity_(data)
  if (!identity || !data.reservationToken) {
    return { success: true, released: false }
  }

  const properties = PropertiesService.getScriptProperties()
  const propertyKey = getReservationPropertyKey_(identity)
  const reservation = parseReservation_(properties.getProperty(propertyKey))
  if (reservation && reservation.token === data.reservationToken) {
    properties.deleteProperty(propertyKey)
    return { success: true, released: true }
  }
  return { success: true, released: false }
}

function isReservedByAnother_(data) {
  const identity = getIdentity_(data)
  if (!identity) return false
  const properties = PropertiesService.getScriptProperties()
  const reservation = parseReservation_(properties.getProperty(getReservationPropertyKey_(identity)))
  return Boolean(
    reservation &&
    Number(reservation.expiresAt) > Date.now() &&
    reservation.token !== data.reservationToken
  )
}


function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  try {
    const data = e && e.parameter ? e.parameter : {}
    if (data.action === "reservationVersion") {
      return jsonResponse_({ success: true, reservationVersion: 1 })
    }
    if (data.action !== "checkDuplicate") {
      return ContentService.createTextOutput("Apps Script web app is working")
        .setMimeType(ContentService.MimeType.TEXT)
    }

    const event = data.question1 || data.eventType ||
      ((data.servantName || data.servantPhone) ? SERVANT_EVENT : "")
    const identityData = Object.assign({}, data, { question1: event })
    if (!getIdentity_(identityData)) {
      return jsonResponse_({
        success: false,
        duplicate: false,
        error: "Required identifying fields are missing for duplicate check.",
      })
    }

    const sheet = getSheet_()
    const rows = getExistingRows(sheet)
    const duplicate = isDuplicate(identityData, rows) || isReservedByAnother_(identityData)
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
    const action = data.action || "submit"

    if (action === "release") {
      return jsonResponse_(releaseRegistrationReservation_(data))
    }

    const sheet = getSheet_()
    if (action === "reserve") {
      return jsonResponse_(reserveRegistration_(data, sheet))
    }

    if (!data.question1 || !data.question2) {
      throw new Error("Required registration fields are missing.")
    }

    const identity = getIdentity_(data)
    if (!identity) {
      return jsonResponse_({
        success: false,
        error: "Required identifying fields are missing or incomplete.",
      })
    }

    const rows = getExistingRows(sheet)
    if (isDuplicate(data, rows)) {
      return jsonResponse_({
        success: false,
        duplicate: true,
        message: "This registration has already been submitted.",
      })
    }

    if (!data.reservationToken) {
      return jsonResponse_({
        success: false,
        reservationExpired: true,
        error: "The registration check is missing or expired. Check your details again before paying.",
      })
    }

    const properties = PropertiesService.getScriptProperties()
    const propertyKey = getReservationPropertyKey_(identity)
    const reservation = parseReservation_(properties.getProperty(propertyKey))
    if (
      !reservation ||
      reservation.token !== data.reservationToken ||
      Number(reservation.expiresAt) <= Date.now()
    ) {
      if (reservation && Number(reservation.expiresAt) <= Date.now()) {
        properties.deleteProperty(propertyKey)
      }
      return jsonResponse_({
        success: false,
        reservationExpired: true,
        error: "The registration check expired. Check your details again before paying.",
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
    properties.deleteProperty(propertyKey)
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
