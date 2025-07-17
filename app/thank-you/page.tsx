"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, CheckCircle, Users, Home, Sparkles, Award, Clock, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ThankYouPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("quizSession")
    if (!storedUser) {
      router.push("/")
      return
    }
    setUserInfo(JSON.parse(storedUser))

    // Trigger animation
    setTimeout(() => setIsVisible(true), 100)
  }, [router])

  const handleGoHome = () => {
    // Clear quiz data
    localStorage.removeItem("quizSession")
    localStorage.removeItem("quizSubmission")
    router.push("/")
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-800">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-500 opacity-70" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 shadow-2xl">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Trophy className="h-12 w-12 text-yellow-300 animate-bounce" />
                  <div className="absolute -inset-2 bg-yellow-300/20 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">BFCB Quiz</h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
              <p className="text-emerald-100 text-lg font-medium">Bangladesh Future Cricket Board</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div
          className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Success Card */}
          <Card className="bg-white/90 backdrop-blur-xl border-gray-200 shadow-2xl hover:bg-white/95 transition-all duration-500 mb-8">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 relative">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-4 bg-emerald-300/20 rounded-full animate-ping"></div>
              </div>
              <CardTitle className="text-gray-800 text-3xl font-bold mb-4">🎉 Quiz Completed Successfully!</CardTitle>
              <div className="text-center">
                <p className="text-gray-700 text-lg mb-2">Congratulations, {userInfo.fullName}!</p>
                <p className="text-gray-600">Your cricket knowledge has been submitted for evaluation</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1">Participant</h3>
                    <p className="text-emerald-700 text-sm">{userInfo.fullName}</p>
                    <p className="text-emerald-600 text-xs">@{userInfo.facebookName}</p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
                    <p className="text-blue-700 text-sm">{new Date().toLocaleDateString()}</p>
                    <p className="text-blue-600 text-xs">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-500">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="font-bold text-purple-800 mb-2">Admin Review</h3>
                <p className="text-purple-700 text-sm">Expert evaluation of your responses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-500">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-orange-700" />
                </div>
                <h3 className="font-bold text-orange-800 mb-2">Score Assignment</h3>
                <p className="text-orange-700 text-sm">Professional scoring based on accuracy</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-500">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-emerald-800 mb-2">Merit List</h3>
                <p className="text-emerald-700 text-sm">Final rankings and recognition</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleGoHome}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>

            <p className="text-gray-600 text-sm">Results will be announced in the BFCB Facebook group</p>
          </div>

          {/* Final Message */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mt-8">
            <CardContent className="p-6 text-center">
              <Trophy className="h-10 w-10 text-yellow-600 mx-auto mb-4 animate-bounce" />
              <h3 className="font-bold text-gray-800 text-xl mb-2">Stay Tuned for Results! 🏆</h3>
              <p className="text-yellow-800">
                Your performance will be evaluated by cricket experts. Top performers will be recognized in the BFCB
                community!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
