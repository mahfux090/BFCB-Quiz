import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    // Get session details with user info
    const { data: session, error: sessionError } = await supabase
      .from("quiz_sessions")
      .select(`
        *,
        users(*)
      `)
      .eq("id", sessionId)
      .eq("status", "in_progress")
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 })
    }

    // Get already submitted responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select("question_id, answer, time_spent")
      .eq("session_id", sessionId)

    if (responsesError) {
      throw responsesError
    }

    return NextResponse.json({
      session,
      submittedResponses: responses || [],
    })
  } catch (error) {
    console.error("Error resuming session:", error)
    return NextResponse.json({ error: "Failed to resume session" }, { status: 500 })
  }
}
