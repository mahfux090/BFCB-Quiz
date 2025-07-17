import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { responseId, score, status, adminNotes } = await request.json()

    // Check if evaluation already exists
    const { data: existingEvaluation } = await supabase
      .from("evaluations")
      .select("*")
      .eq("response_id", responseId)
      .single()

    if (existingEvaluation) {
      // Update existing evaluation
      const { error } = await supabase
        .from("evaluations")
        .update({
          score,
          status,
          admin_notes: adminNotes,
          evaluated_at: new Date().toISOString(),
          evaluated_by: "admin",
        })
        .eq("response_id", responseId)

      if (error) throw error
    } else {
      // Create new evaluation
      const { error } = await supabase.from("evaluations").insert([
        {
          response_id: responseId,
          score,
          status,
          admin_notes: adminNotes,
          evaluated_by: "admin",
        },
      ])

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error evaluating response:", error)
    return NextResponse.json({ error: "Failed to evaluate response" }, { status: 500 })
  }
}
