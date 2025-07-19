import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { QuestionOption } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { question, timeLimit, imageUrl, type, options } = await request.json() // Added type and options
    const questionId = params.id

    const { data: updatedQuestion, error } = await supabase
      .from("questions")
      .update({
        question,
        time_limit: timeLimit,
        updated_at: new Date().toISOString(),
        image_url: imageUrl,
        type: type || "text",
      })
      .eq("id", questionId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Handle options for MCQ questions
    if (type === "mcq") {
      // Delete existing options for this question
      const { error: deleteError } = await supabase.from("question_options").delete().eq("question_id", questionId)
      if (deleteError) {
        console.error("Error deleting old question options:", deleteError)
        throw deleteError
      }

      // Insert new options
      if (options && options.length > 0) {
        const optionsToInsert = options.map((opt: QuestionOption) => ({
          question_id: questionId,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        }))

        const { error: insertError } = await supabase.from("question_options").insert(optionsToInsert)
        if (insertError) {
          console.error("Error inserting new question options:", insertError)
          throw insertError
        }
      }
    } else {
      // If type changes from MCQ to Text, delete all associated options
      const { error: deleteOptionsError } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", questionId)
      if (deleteOptionsError) {
        console.error("Error deleting options for non-MCQ question:", deleteOptionsError)
        throw deleteOptionsError
      }
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

    // Deleting a question will automatically cascade delete its options due to ON DELETE CASCADE
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
