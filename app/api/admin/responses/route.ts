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
      console.error("Supabase query error:", error) // Log Supabase specific error details
      throw error
    }

    console.log("Data fetched from Supabase in API route:", responses) // Log the raw data array
    console.log("Number of responses fetched:", responses?.length) // Log the count of items

    return NextResponse.json({ responses })
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}
