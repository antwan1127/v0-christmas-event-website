import { NextRequest, NextResponse } from "next/server"

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbyVeMq_vH4SkFTdLuleYqQIFmFkwJjb4SCU55FHCZEZTyStTAeWQFo7Zv8h4MJGHgnXcQ/exec"

const IDENTITY_FIELDS = [
  "question1",
  "question2",
  "question3",
  "question4",
  "question5",
  "question6",
  "question7",
] as const

type AppsScriptResult = {
  success?: boolean
  duplicate?: boolean
  message?: string
  error?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const params = new URLSearchParams({ action: "checkDuplicate" })

  for (const field of IDENTITY_FIELDS) {
    const value = searchParams.get(field)
    if (value) params.set(field, value)
  }

  const eventType = searchParams.get("eventType")
  if (!params.get("question1") && eventType) params.set("question1", eventType)

  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?${params.toString()}`, {
      cache: "no-store",
      redirect: "follow",
    })
    const responseText = await response.text()
    let result: AppsScriptResult

    try {
      result = JSON.parse(responseText) as AppsScriptResult
    } catch {
      return NextResponse.json(
        { success: false, duplicate: false, error: "Duplicate check returned an unreadable response." },
        { status: 502 },
      )
    }

    if (result.duplicate) {
      return NextResponse.json(result, { status: 409 })
    }

    if (!response.ok || result.success !== true) {
      return NextResponse.json(
        { success: false, duplicate: false, error: result.error || result.message || "Duplicate check failed." },
        { status: 502 },
      )
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, duplicate: false, error: "Duplicate check unavailable." },
      { status: 502 },
    )
  }
}
