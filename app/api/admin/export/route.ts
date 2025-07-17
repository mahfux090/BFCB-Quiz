import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: meritList, error } = await supabase.rpc("get_merit_list")

    if (error) {
      throw error
    }

    // Convert to CSV format
    const csvHeaders = ["Rank", "Name", "Facebook", "Total Score", "Time Spent", "Status"]
    const csvRows = meritList.map((item: any, index: number) => [
      index + 1,
      item.full_name,
      item.facebook_name,
      item.total_score,
      formatTime(item.total_time_spent || 0),
      item.evaluation_status,
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=bfcb-merit-list.csv",
      },
    })
  } catch (error) {
    console.error("Error exporting merit list:", error)
    return NextResponse.json({ error: "Failed to export merit list" }, { status: 500 })
  }
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
