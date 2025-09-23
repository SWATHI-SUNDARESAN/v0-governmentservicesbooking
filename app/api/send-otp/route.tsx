import { NextResponse } from "next/server"
import { Resend } from "resend"

type SendOtpBody = {
  to?: string
  subject?: string
  text?: string
  otp?: string
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: Request) {
  try {
    let body: SendOtpBody | undefined
    try {
      body = await req.json()
    } catch (e) {
      return jsonError("Invalid JSON body", 400)
    }

    const to = (body?.to || "").trim()
    const subject = (body?.subject || "").trim()
    const text = (body?.text || "").trim()
    const otp = (body?.otp || "").trim()

    console.log("[v0] send-otp to:", to)

    if (!to) return jsonError("Missing 'to' email", 400)

    // Very basic email format check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)
    if (!emailOk) return jsonError("Invalid email format", 400)

    // Simulate success if RESEND_API_KEY is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set. Simulating email send.")
      return NextResponse.json({
        ok: true,
        simulated: true,
        message: "Email sending simulated. Add RESEND_API_KEY to enable real emails.",
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const finalSubject = subject || "Your Booking is Confirmed"
    const finalText =
      text ||
      `Your booking is confirmed.\n${otp ? `Your OTP is: ${otp}\n` : ""}Please keep this code safe and do not share it.`

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 8px">Your booking is confirmed</h2>
        ${otp ? `<p style="margin:0 0 12px">Your OTP: <strong style="font-size:18px">${otp}</strong></p>` : ""}
        <p style="margin:0 0 12px">Please keep this code safe and do not share it.</p>
      </div>
    `

    console.log("[v0] Attempting to send email via Resend")
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: finalSubject,
      text: finalText,
      html,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return jsonError("Email send failed: " + JSON.stringify(error), 500)
    }

    console.log("[v0] Email sent. ID:", data?.id)
    return NextResponse.json({ ok: true, id: data?.id ?? null })
  } catch (err) {
    const msg = (err as Error)?.message || String(err)
    console.error("[v0] send-otp route error:", msg)
    return jsonError("Unexpected error: " + msg, 500)
  }
}
