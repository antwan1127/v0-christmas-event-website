import { NextRequest, NextResponse } from "next/server"

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbzWg4UlZaXjlSb4auoSoAfjiRnrEPtvQqvUw2mSozMGXPsrgqQJSr-Z2UqAJED_eFjhdA/exec"

const IDENTITY_FIELDS = [
  "question1",
  "question2",
  "question3",
  "question4",
  "question5",
  "question6",
  "question7",
  "servantName",
  "servantFamily",
  "servantPhone",
  "reservationToken",
  "clientRequestId",
] as const

type AppsScriptResult = {
  success?: boolean
  duplicate?: boolean
  message?: string
  error?: string
  [key: string]: unknown
}

async function supportsReservationProtocol() {
  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=reservationVersion`, { cache: "no-store" })
    const result = await response.json() as { reservationVersion?: number }
    return response.ok && result.reservationVersion === 1
  } catch {
    return false
  }
}

async function forwardToAppsScript(params: URLSearchParams) {
  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: params,
    cache: "no-store",
    redirect: "follow",
  })
  const responseText = await response.text()
  let result: AppsScriptResult

  try {
    result = JSON.parse(responseText) as AppsScriptResult
  } catch {
    return NextResponse.json(
      { success: false, error: "Duplicate check returned an unreadable response." },
      { status: 502 },
    )
  }

  const status = result.duplicate ? 409 : result.success ? 200 : 502
  return NextResponse.json(result, { status: response.ok ? status : 502 })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const params = new URLSearchParams({ action: "checkDuplicate" })
  for (const field of IDENTITY_FIELDS) {
    const value = searchParams.get(field)
    if (value) params.set(field, value)
  }
  const event = searchParams.get("eventType")
  if (!params.get("question1") && event) params.set("question1", event)

  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?${params.toString()}`, { cache: "no-store" })
    const result = await response.json() as AppsScriptResult
    return NextResponse.json(result, { status: response.ok ? (result.duplicate ? 409 : 200) : 502 })
  } catch {
    return NextResponse.json(
      { success: false, duplicate: false, error: "Duplicate check unavailable" },
      { status: 502 },
    )
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 })
  }

  const action = body.action
  if (action !== "reserve" && action !== "release") {
    return NextResponse.json({ success: false, error: "Unsupported duplicate-check action." }, { status: 400 })
  }

  const params = new URLSearchParams({ action })
  for (const field of IDENTITY_FIELDS) {
    const value = body[field]
    if (typeof value === "string" && value) params.set(field, value)
  }

  try {
    if (!(await supportsReservationProtocol())) {
      return NextResponse.json(
        { success: false, duplicate: false, error: "Duplicate protection is not active yet. Payment remains locked." },
        { status: 503 },
      )
    }
    return await forwardToAppsScript(params)
  } catch {
    return NextResponse.json(
      { success: false, duplicate: false, error: "Duplicate check unavailable. Payment remains locked." },
      { status: 502 },
    )
  }
}
