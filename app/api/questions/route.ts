import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
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
    const { question, timeLimit } = await request.json()

    const { data: newQuestion, error } = await supabase
      .from("questions")
      .insert([
        {
          question,
          time_limit: timeLimit,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ question: newQuestion })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
