import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, facebookName } = await request.json()

    // Check if user already has an active or completed session
    const { data: existingSessions, error } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["in_progress", "completed"])
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    if (existingSessions && existingSessions.length > 0) {
      const latestSession = existingSessions[0]

      if (latestSession.status === "completed") {
        return NextResponse.json({
          allowed: false,
          reason: "already_completed",
          message: "You have already completed the quiz. Multiple attempts are not allowed.",
        })
      }

      if (latestSession.status === "in_progress") {
        // Check if session is older than 2 hours (abandoned)
        const sessionTime = new Date(latestSession.started_at).getTime()
        const currentTime = new Date().getTime()
        const timeDiff = currentTime - sessionTime
        const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

        if (timeDiff > twoHours) {
          // Mark as abandoned and allow new session
          await supabase.from("quiz_sessions").update({ status: "abandoned" }).eq("id", latestSession.id)

          return NextResponse.json({ allowed: true })
        } else {
          return NextResponse.json({
            allowed: false,
            reason: "session_active",
            message: "You have an active quiz session. Please complete it first.",
            sessionId: latestSession.id,
          })
        }
      }
    }

    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ error: "Failed to check session" }, { status: 500 })
  }
}
