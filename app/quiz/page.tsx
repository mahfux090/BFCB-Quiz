"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Trophy, ArrowRight, Zap, CheckCircle2, AlertTriangle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Question } from "@/lib/supabase"

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const router = useRouter()

  // Prevent back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "আপনি যদি এই page ছেড়ে যান তাহলে আপনার quiz progress হারিয়ে যাবে!"
      return e.returnValue
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      // Push the current state back to prevent navigation
      window.history.pushState(null, "", window.location.href)
      alert("Quiz চলাকালীন back button ব্যবহার করা যাবে না! Quiz complete করুন।")
    }

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push initial state to prevent back navigation
    window.history.pushState(null, "", window.location.href)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s")
      ) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    // Get session info from localStorage
    const storedSession = localStorage.getItem("quizSession")
    if (!storedSession) {
      router.push("/")
      return
    }

    const session = JSON.parse(storedSession)
    setSessionInfo(session)

    // Fetch questions from API
    fetchQuestions(session)
  }, [router])

  const fetchQuestions = async (session: any) => {
    try {
      const response = await fetch("/api/questions")
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }
      const { questions } = await response.json()
      setQuestions(questions)

      // Initialize answers array
      const initialAnswers = new Array(questions.length).fill("")

      // If resuming, populate with existing answers
      if (session.isResumed && session.submittedResponses) {
        session.submittedResponses.forEach((response: any) => {
          const questionIndex = questions.findIndex((q: any) => q.id === response.question_id)
          if (questionIndex !== -1) {
            initialAnswers[questionIndex] = response.answer
          }
        })

        // Find the first unanswered question
        const firstUnanswered = initialAnswers.findIndex((answer) => !answer.trim())
        if (firstUnanswered !== -1) {
          setCurrentQuestion(firstUnanswered)
        }
      }

      setAnswers(initialAnswers)

      if (questions.length > 0) {
        const startQuestion = session.isResumed
          ? initialAnswers.findIndex((answer: string) => !answer.trim()) !== -1
            ? initialAnswers.findIndex((answer: string) => !answer.trim())
            : 0
          : 0

        setTimeLeft(questions[startQuestion].time_limit)
        setQuestionStartTime(Date.now())
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset timer when question changes
    if (questions[currentQuestion]) {
      setTimeLeft(questions[currentQuestion].time_limit)
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestion, questions])

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (questions.length > 0) {
      // Auto-advance when time runs out
      handleNext()
    }
  }, [timeLeft, questions.length])

  // Auto-save progress
  const saveProgress = useCallback(
    async (questionIndex: number, answer: string, timeSpent: number) => {
      if (!sessionInfo || !questions[questionIndex]) return

      try {
        await fetch("/api/quiz/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionInfo.sessionId,
            questionId: questions[questionIndex].id,
            answer,
            timeSpent,
          }),
        })
      } catch (error) {
        console.error("Error saving progress:", error)
      }
    },
    [sessionInfo, questions],
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
    setHasUnsavedChanges(true)

    // Auto-save after 2 seconds of no typing
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    setTimeout(() => {
      saveProgress(currentQuestion, value, timeSpent)
      setHasUnsavedChanges(false)
    }, 2000)
  }

  const handleNext = async () => {
    // Save current answer before moving
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    await saveProgress(currentQuestion, answers[currentQuestion] || "", timeSpent)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Calculate time spent for each question
      const responses = questions.map((q, index) => ({
        questionId: q.id,
        answer: answers[index] || "",
        timeSpent:
          index === currentQuestion
            ? Math.floor((Date.now() - questionStartTime) / 1000)
            : q.time_limit - (index === currentQuestion ? timeLeft : 0),
      }))

      const totalTimeSpent = responses.reduce((total, r) => total + r.timeSpent, 0)

      // Submit to API
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionInfo.sessionId,
          responses,
          totalTimeSpent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      // Clear the beforeunload handler before navigation
      window.removeEventListener("beforeunload", () => {})

      router.push("/thank-you")
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Quiz submit করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !sessionInfo || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Zap className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-gray-800 text-xl font-semibold mb-2">Loading Quiz Questions</h3>
          <p className="text-gray-600">Preparing your cricket challenge...</p>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]
  const isLowTime = timeLeft <= 30
  const isCriticalTime = timeLeft <= 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <div>
                <h1 className="text-2xl font-bold text-white">BFCB Quiz Challenge</h1>
                <p className="text-emerald-100 text-sm">Welcome, {sessionInfo.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Security Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100/20 rounded-full border border-green-200/30">
                <Shield className="h-4 w-4 text-green-200" />
                <span className="text-green-100 text-sm font-medium">Secure Mode</span>
              </div>

              {/* Timer */}
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isCriticalTime
                    ? "bg-red-100/30 border-2 border-red-300 animate-pulse"
                    : isLowTime
                      ? "bg-orange-100/30 border-2 border-orange-300"
                      : "bg-white/30 border-2 border-white/40"
                }`}
              >
                <Clock
                  className={`h-5 w-5 ${isCriticalTime ? "text-red-200" : isLowTime ? "text-orange-200" : "text-white"}`}
                />
                <span
                  className={`font-mono font-bold text-lg ${
                    isCriticalTime ? "text-red-100" : isLowTime ? "text-orange-100" : "text-white"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-gray-800 font-semibold">{Math.round(progress)}% Complete</div>
              <div className="text-gray-600 text-sm">Keep going!</div>
            </div>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-gray-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-gray-200 shadow-2xl hover:bg-white/95 transition-all duration-500">
          <CardHeader className="pb-6">
            <CardTitle className="text-gray-800 text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                <span className="text-white font-bold">Q{currentQuestion + 1}</span>
              </div>
              Cricket Knowledge Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-200">
              <p className="text-gray-800 leading-relaxed text-lg font-medium">{currentQ.question}</p>
            </div>

            <div className="space-y-3">
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Your Expert Answer
              </label>
              <Textarea
                placeholder="Share your detailed cricket knowledge and insights here..."
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[150px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/50 text-base resize-none transition-all duration-300"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{answers[currentQuestion]?.length || 0} characters</span>
                <span className="text-gray-500">Time limit: {formatTime(currentQ.time_limit)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <div className="text-gray-600 text-sm">
                {currentQuestion > 0 && (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {currentQuestion} questions completed
                  </span>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting Quiz...
                  </div>
                ) : currentQuestion === questions.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Complete Quiz
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Next Question
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time Warning */}
        {isLowTime && (
          <div
            className={`mt-6 p-4 rounded-xl border-2 text-center transition-all duration-300 ${
              isCriticalTime
                ? "bg-red-50 border-red-300 animate-bounce"
                : "bg-orange-50 border-orange-300 animate-pulse"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className={`h-6 w-6 ${isCriticalTime ? "text-red-600" : "text-orange-600"}`} />
              <p className={`font-bold text-lg ${isCriticalTime ? "text-red-800" : "text-orange-800"}`}>
                {isCriticalTime
                  ? `🚨 CRITICAL: Only ${timeLeft} seconds left!`
                  : `⚠️ Hurry up! ${timeLeft} seconds remaining`}
              </p>
            </div>
          </div>
        )}

        {/* Anti-Cheating Notice */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-red-800 font-semibold text-sm">Security Notice</h4>
              <p className="text-red-700 text-xs">
                This quiz is monitored for fair play. Back navigation, page refresh, and developer tools are disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
