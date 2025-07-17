import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, answer, timeSpent } = await request.json()

    // Use upsert to insert or update the response atomically
    const { data, error } = await supabase
      .from("responses")
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          answer,
          time_spent: timeSpent,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "session_id,question_id" }, // Specify the unique constraint for conflict resolution
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving progress:", error)
    let errorMessage = "Failed to save progress."
    if (error instanceof Error) {
      errorMessage = `Failed to save progress: ${error.message}`
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
