import { NextResponse } from "next/server"

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbyVeMq_vH4SkFTdLuleYqQIFmFkwJjb4SCU55FHCZEZTyStTAeWQFo7Zv8h4MJGHgnXcQ/exec"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing form submission data." },
        { status: 400 },
      )
    }

    const upstream = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
      cache: "no-store",
      redirect: "follow",
    })

    const responseText = await upstream.text()
    let result: { success?: boolean; duplicate?: boolean; message?: string; error?: string }

    try {
      result = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "The sheet script returned an unreadable response. Check its deployment and access settings.",
        },
        { status: 502 },
      )
    }

    if (result.duplicate) {
      return NextResponse.json(result, { status: 409 })
    }

    if (!upstream.ok || result.success !== true) {
      return NextResponse.json(
        { success: false, error: result.error || result.message || "The sheet did not save this registration." },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, message: result.message || "Registration saved." })
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not reach the Google Sheet. Please try again." },
      { status: 502 },
    )
  }
}
