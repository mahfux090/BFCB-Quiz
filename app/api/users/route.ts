import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { fullName, facebookName } = await request.json()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("facebook_name", facebookName).single()

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          facebook_name: facebookName,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
