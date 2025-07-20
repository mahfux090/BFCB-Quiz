import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { QuestionOption } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select(`
        *,
        question_options(id, option_text, is_correct)
      `) // Select options as well
      .eq("is_active", true)
      .order("id", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, timeLimit, imageUrl, type, options } = await request.json() // Added type and options

    const { data: newQuestion, error } = await supabase
      .from("questions")
      .insert([
        {
          question,
          time_limit: timeLimit,
          is_active: true,
          image_url: imageUrl,
          type: type || "text", // Default to 'text' if not provided
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath("/admin/dashboard")

    // If it's an MCQ question, insert options
    if (type === "mcq" && options && options.length > 0) {
      const optionsToInsert = options.map((opt: QuestionOption) => ({
        question_id: newQuestion.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
      }))

      const { error: optionsError } = await supabase.from("question_options").insert(optionsToInsert)

      if (optionsError) {
        // Consider rolling back the question creation if options fail
        console.error("Error inserting question options:", optionsError)
        await supabase.from("questions").delete().eq("id", newQuestion.id) // Rollback
        throw optionsError
      }

      revalidatePath("/admin/dashboard")
    }

    return NextResponse.json({ question: newQuestion })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
