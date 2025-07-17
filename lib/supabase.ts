import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: number
  full_name: string
  facebook_name: string
  created_at: string
}

export interface Question {
  id: number
  question: string
  time_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuizSession {
  id: number
  user_id: number
  started_at: string
  completed_at?: string
  total_time_spent?: number
  status: "in_progress" | "completed" | "abandoned"
}

export interface Response {
  id: number
  session_id: number
  question_id: number
  answer: string
  time_spent: number
  submitted_at: string
}

export interface Evaluation {
  id: number
  response_id: number
  score: number
  status: "correct" | "incorrect" | "partial"
  admin_notes?: string
  evaluated_at: string
  evaluated_by: string
}

export interface AdminUser {
  id: number
  username: string
  password_hash: string
  created_at: string
  last_login?: string
}
