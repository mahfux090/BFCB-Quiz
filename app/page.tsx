"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Clock, Zap, Target, Award, ChevronRight, Sparkles, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function HomePage() {
  const [fullName, setFullName] = useState("")
  const [facebookName, setFacebookName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showWarning, setShowWarning] = useState(false)
  const [warningData, setWarningData] = useState<any>(null)
  const router = useRouter()

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !facebookName.trim()) return

    setIsLoading(true)
    setError("")

    try {
      // Create or get user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          facebookName: facebookName.trim(),
        }),
      })

      if (!userResponse.ok) {
        throw new Error("Failed to create user")
      }

      const { user } = await userResponse.json()

      // Check if user can start quiz (anti-cheating check)
      const sessionCheckResponse = await fetch("/api/quiz/check-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          facebookName: user.facebook_name,
        }),
      })

      const sessionCheck = await sessionCheckResponse.json()

      if (!sessionCheck.allowed) {
        if (sessionCheck.reason === "already_completed") {
          setError("আপনি ইতিমধ্যে quiz complete করেছেন। একাধিক attempt allowed নয়।")
          setIsLoading(false)
          return
        } else if (sessionCheck.reason === "session_active") {
          setWarningData({
            message: sessionCheck.message,
            sessionId: sessionCheck.sessionId,
            user,
          })
          setShowWarning(true)
          setIsLoading(false)
          return
        }
      }

      // Start new quiz session
      await startNewSession(user)
    } catch (error) {
      console.error("Error starting quiz:", error)
      setError("Failed to start quiz. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = async (user: any) => {
    const sessionResponse = await fetch("/api/quiz/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    })

    if (!sessionResponse.ok) {
      throw new Error("Failed to start quiz")
    }

    const { session } = await sessionResponse.json()

    // Store session info
    localStorage.setItem(
      "quizSession",
      JSON.stringify({
        sessionId: session.id,
        userId: user.id,
        fullName: user.full_name,
        facebookName: user.facebook_name,
        startTime: new Date().toISOString(),
        isResumed: false,
      }),
    )

    router.push("/quiz")
  }

  const handleResumeSession = async () => {
    try {
      const resumeResponse = await fetch("/api/quiz/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: warningData.sessionId,
        }),
      })

      if (!resumeResponse.ok) {
        throw new Error("Failed to resume session")
      }

      const { session, submittedResponses } = await resumeResponse.json()

      // Store session info for resume
      localStorage.setItem(
        "quizSession",
        JSON.stringify({
          sessionId: session.id,
          userId: session.user_id,
          fullName: session.users.full_name,
          facebookName: session.users.facebook_name,
          startTime: session.started_at,
          isResumed: true,
          submittedResponses: submittedResponses,
        }),
      )

      setShowWarning(false)
      router.push("/quiz")
    } catch (error) {
      console.error("Error resuming session:", error)
      setError("Failed to resume session. Please try again.")
      setShowWarning(false)
    }
  }

  const handleStartFresh = async () => {
    try {
      // This will abandon the old session and start fresh
      await startNewSession(warningData.user)
      setShowWarning(false)
    } catch (error) {
      console.error("Error starting fresh:", error)
      setError("Failed to start new session. Please try again.")
      setShowWarning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 shadow-2xl">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Trophy className="h-12 w-12 text-yellow-300 animate-bounce" />
                  <Sparkles className="h-6 w-6 text-yellow-200 absolute -top-1 -right-1 animate-spin" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">BFCB Quiz</h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
              <p className="text-emerald-100 text-lg font-medium">Bangladesh Future Cricket Board</p>
              <p className="text-white/90 text-sm mt-2">Test Your Cricket Knowledge & Compete with Champions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheating Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Active Quiz Session Found
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              আপনার একটি active quiz session রয়েছে। আপনি কি সেটি continue করতে চান নাকি নতুন করে শুরু করতে চান?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Important:</strong> নতুন session শুরু করলে আপনার আগের সব progress মুছে যাবে।
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResumeSession}
              className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
            >
              Continue Previous
            </Button>
            <Button
              onClick={handleStartFresh}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Start Fresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Test Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  {" "}
                  Cricket Knowledge?
                </span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join fellow cricket enthusiasts in this challenging quiz. Answer thought-provoking questions and climb
                the leaderboard!
              </p>
            </div>

            <Card className="bg-white/80 backdrop-blur-xl border-gray-200 shadow-2xl hover:bg-white/90 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-gray-800 text-2xl font-bold flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-emerald-600" />
                  Join the Competition
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Enter your details to begin your cricket journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartQuiz} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/50 h-12 text-base transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="facebookName"
                      className="text-gray-700 font-semibold text-sm uppercase tracking-wide"
                    >
                      Facebook Account Name
                    </Label>
                    <Input
                      id="facebookName"
                      type="text"
                      placeholder="Enter your Facebook name"
                      value={facebookName}
                      onChange={(e) => setFacebookName(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/50 h-12 text-base transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Anti-Cheating Notice */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-800 font-semibold text-sm mb-1">Anti-Cheating Policy</h4>
                        <p className="text-red-700 text-xs leading-relaxed">
                          • একবার quiz শুরু করলে back button দিয়ে বের হওয়া যাবে না
                          <br />• Multiple attempts allowed নয়
                          <br />• সব answers একসাথে submit করতে হবে
                          <br />• Cheating detect হলে disqualify হবেন
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                      <p className="text-red-800 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading || !fullName.trim() || !facebookName.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Starting Quiz...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Start Quiz Challenge
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            <div className="grid gap-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-200/50 rounded-xl group-hover:bg-emerald-300/50 transition-colors duration-300">
                      <Clock className="h-8 w-8 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800 text-lg">Timed Challenges</h3>
                      <p className="text-emerald-700 text-sm">Each question has a strategic time limit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-200/50 rounded-xl group-hover:bg-blue-300/50 transition-colors duration-300">
                      <Target className="h-8 w-8 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-800 text-lg">Expert Evaluation</h3>
                      <p className="text-blue-700 text-sm">Professional assessment of your answers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-200/50 rounded-xl group-hover:bg-purple-300/50 transition-colors duration-300">
                      <Award className="h-8 w-8 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-800 text-lg">Merit Ranking</h3>
                      <p className="text-purple-700 text-sm">Compete for top positions on leaderboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-200/50 rounded-xl group-hover:bg-orange-300/50 transition-colors duration-300">
                      <Zap className="h-8 w-8 text-orange-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-800 text-lg">Anti-Cheating</h3>
                      <p className="text-orange-700 text-sm">Advanced security to ensure fair play</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Admin Access */}
        <div className="text-center mt-16">
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 font-semibold transition-all duration-300 hover:scale-105"
          >
            <Users className="h-4 w-4 mr-2" />
            Admin Dashboard
          </Button>
        </div>

        {/* Developer Credit */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <span className="gradient-text font-bold text-base animate-heartbeat">Developed by Mahfuz Uddin with ❤️</span>
        </div>

        {/* Contact Link */}
        <div className="text-center mt-2">
          <a
            href="https://www.facebook.com/mahfux090"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1 transition-colors duration-200"
          >
            Contact with Mahfuz <Users className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
