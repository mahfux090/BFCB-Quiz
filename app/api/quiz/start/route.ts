import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Create new quiz session
    const { data: session, error } = await supabase
      .from("quiz_sessions")
      .insert([
        {
          user_id: userId,
          status: "in_progress",
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error starting quiz:", error)
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 })
  }
}
