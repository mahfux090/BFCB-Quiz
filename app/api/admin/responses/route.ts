export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: responses, error } = await supabase
      .from("responses")
      .select(`
        *,
        quiz_sessions!inner(
          user_id,
          users!inner(
            full_name,
            facebook_name
          )
        ),
        questions!inner(
          question
        ),
        evaluations(
          score,
          status,
          admin_notes
        )
      `)
      .order("submitted_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ responses })
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}
