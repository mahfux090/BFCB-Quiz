import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, responses, totalTimeSpent } = await request.json()

    // Process each response individually using upsert logic
    // This ensures that if a response was already saved via auto-save, it gets updated, not re-inserted.
    for (const response of responses) {
      const { questionId, answer, timeSpent } = response

      const { error: upsertError } = await supabase
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

      if (upsertError) {
        throw upsertError
      }
    }

    // Update quiz session as completed
    const { error: sessionError } = await supabase
      .from("quiz_sessions")
      .update({
        completed_at: new Date().toISOString(),
        total_time_spent: totalTimeSpent,
        status: "completed",
      })
      .eq("id", sessionId)

    if (sessionError) {
      throw sessionError
    }

    revalidatePath("/admin/dashboard") // Revalidate the admin dashboard page

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    // Provide more specific error message if possible, or a generic one
    let errorMessage = "Failed to submit quiz. Please try again."
    if (error instanceof Error) {
      errorMessage = `Failed to submit quiz: ${error.message}. Please try again.`
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
