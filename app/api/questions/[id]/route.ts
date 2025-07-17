import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { question, timeLimit } = await request.json()
    const questionId = params.id

    const { data: updatedQuestion, error } = await supabase
      .from("questions")
      .update({
        question,
        time_limit: timeLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", questionId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questionId = params.id

    const { error } = await supabase.from("questions").delete().eq("id", questionId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
