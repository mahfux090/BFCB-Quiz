import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total questions
    const { count: totalQuestions } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get total participants (unique users)
    const { data: sessions } = await supabase.from("quiz_sessions").select("user_id").eq("status", "completed")

    const uniqueParticipants = new Set(sessions?.map((s) => s.user_id) || []).size

    // Get pending reviews
    const { data: responses } = await supabase.from("responses").select(`
        id,
        evaluations(id)
      `)

    const pendingReviews = responses?.filter((r) => !r.evaluations || r.evaluations.length === 0).length || 0
    const completedReviews = responses?.filter((r) => r.evaluations && r.evaluations.length > 0).length || 0

    return NextResponse.json({
      stats: {
        totalQuestions: totalQuestions || 0,
        totalParticipants: uniqueParticipants,
        pendingReviews,
        completedReviews,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
