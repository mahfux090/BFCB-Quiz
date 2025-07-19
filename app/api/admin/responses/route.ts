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
      console.error("Supabase query error:", error) // Supabase-এর নির্দিষ্ট ত্রুটি লগ করুন
      throw error
    }

    console.log("Data fetched from Supabase in API route (server):", responses) // সার্ভার থেকে আসা raw ডেটা লগ করুন
    console.log("Number of responses fetched (server):", responses?.length) // আইটেমের সংখ্যা লগ করুন

    return NextResponse.json({ responses })
  } catch (error) {
    console.error("Error fetching responses in API route:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}
