export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: meritList, error } = await supabase.rpc("get_merit_list")

    if (error) {
      throw error
    }

    return NextResponse.json({ meritList })
  } catch (error) {
    console.error("Error fetching merit list:", error)
    return NextResponse.json({ error: "Failed to fetch merit list" }, { status: 500 })
  }
}
