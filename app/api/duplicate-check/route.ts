import { NextRequest, NextResponse } from "next/server"

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbwo7jBD01DP1-bppEObZH4tfUP6jta1WzesXyobzLyIM3MqiMH-6VUDts7XL59OINIAbQ/exec"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const params = new URLSearchParams({
    action: "checkDuplicate",
    question2: searchParams.get("question2") ?? "",
    question5: searchParams.get("question5") ?? "",
    question6: searchParams.get("question6") ?? "",
    question7: searchParams.get("question7") ?? "",
    servantName: searchParams.get("servantName") ?? "",
    servantPhone: searchParams.get("servantPhone") ?? "",
  })

  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?${params.toString()}`, {
      cache: "no-store",
    })
    const payload = await response.json()
    return NextResponse.json(payload, { status: response.ok ? 200 : 502 })
  } catch {
    return NextResponse.json(
      { success: false, duplicate: false, error: "Duplicate check unavailable" },
      { status: 502 },
    )
  }
}
