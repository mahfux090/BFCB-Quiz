"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Users,
  FileText,
  Trophy,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Download,
  Clock,
  Save,
  Target,
  Award,
  TrendingUp,
  XCircle,
  CheckCircle,
  CircleDot,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Question, QuestionOption } from "@/lib/supabase" // Import Question and QuestionOption types

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [questions, setQuestions] = useState<Question[]>([]) // Use Question type
  const [responses, setResponses] = useState([])
  const [meritList, setMeritList] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalParticipants: 0,
    pendingReviews: 0,
    completedReviews: 0,
  })

  // Question management states
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null) // Use Question type
  const [newQuestion, setNewQuestion] = useState<{
    question: string
    time_limit: number
    image_url: string
    type: "text" | "mcq"
    options: QuestionOption[]
  }>({ question: "", time_limit: 180, image_url: "", type: "text", options: [] }) // Added type and options
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Response evaluation states
  const [evaluatingResponse, setEvaluatingResponse] = useState(null)
  const [evaluationData, setEvaluationData] = useState({ score: 5, status: "correct", admin_notes: "" })

  // Add new state variables for editing, viewing, and deleting questions
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [isViewingQuestion, setIsViewingQuestion] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (!auth) {
      router.push("/admin")
      return
    }
    setIsAuthenticated(true)
    fetchAllData()
  }, [router])

  const fetchAllData = async () => {
    try {
      await fetchQuestions() // Fetch questions first
      await Promise.all([fetchResponses(), fetchMeritList()]) // Then fetch others
      await fetchStats() // Then calculate stats
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions")
      if (response.ok) {
        const { questions } = await response.json()
        setQuestions(questions)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const fetchResponses = async () => {
    try {
      const response = await fetch("/api/admin/responses")
      if (response.ok) {
        const { responses } = await response.json()
        console.log("Fetched responses from API:", responses)
        setResponses(responses)
      }
    } catch (error) {
      console.error("Error fetching responses:", error)
    }
  }

  const fetchMeritList = async () => {
    try {
      const response = await fetch("/api/admin/merit-list")
      if (response.ok) {
        const { meritList } = await response.json()
        setMeritList(meritList)
      }
    } catch (error) {
      console.error("Error fetching merit list:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const { stats } = await response.json()
        setStats(stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    } else {
      setImageFile(null)
      setImagePreviewUrl(null)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    const formData = new FormData()
    formData.append("file", imageFile)

    try {
      const response = await fetch(`/api/upload-image?filename=${imageFile.name}`, {
        method: "POST",
        body: imageFile, // Send the file directly as body
        headers: {
          "Content-Type": imageFile.type, // Set content type for blob upload
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to upload image: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      return data.url // This is the public URL from Vercel Blob
    } catch (error) {
      console.error("Error uploading image:", error)
      alert(`Image upload failed: ${error.message}`)
      return null
    }
  }

  const handleAddQuestion = async () => {
    let uploadedImageUrl = newQuestion.image_url // Start with existing URL if any

    if (imageFile) {
      uploadedImageUrl = await uploadImage()
      if (!uploadedImageUrl) return // Stop if upload failed
    }

    // Validate MCQ options
    if (newQuestion.type === "mcq") {
      if (newQuestion.options.length < 2) {
        alert("MCQ questions must have at least two options.")
        return
      }
      const hasCorrectOption = newQuestion.options.some((opt) => opt.is_correct)
      if (!hasCorrectOption) {
        alert("MCQ questions must have at least one correct option.")
        return
      }
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.question,
          timeLimit: newQuestion.time_limit,
          imageUrl: uploadedImageUrl,
          type: newQuestion.type,
          options: newQuestion.options,
        }),
      })

      if (response.ok) {
        await fetchQuestions()
        setIsAddingQuestion(false)
        setNewQuestion({ question: "", time_limit: 180, image_url: "", type: "text", options: [] })
        setImageFile(null)
        setImagePreviewUrl(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to add question: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error adding question:", error)
      alert(`Error adding question: ${error.message}`)
    }
  }

  const handleEvaluateResponse = async (responseId) => {
    try {
      const response = await fetch("/api/admin/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          score: evaluationData.score,
          status: evaluationData.status,
          adminNotes: evaluationData.admin_notes,
        }),
      })

      if (response.ok) {
        await fetchResponses()
        await fetchMeritList()
        setEvaluatingResponse(null)
        setEvaluationData({ score: 5, status: "correct", admin_notes: "" })
      }
    } catch (error) {
      console.error("Error evaluating response:", error)
    }
  }

  const exportMeritList = () => {
    const csvContent = [
      ["Rank", "Name", "Facebook", "Total Score", "Time Spent", "Status"],
      ...meritList.map((item, index) => [
        index + 1,
        item.full_name,
        item.facebook_name,
        item.total_score,
        formatTime(item.total_time_spent || 0),
        item.evaluation_status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bfcb-merit-list.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "correct":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Correct</Badge>
      case "incorrect":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Incorrect</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Partial</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Pending</Badge>
    }
  }

  const handleEditQuestionClick = (question: Question) => {
    setEditingQuestion(question)
    setNewQuestion({
      question: question.question,
      time_limit: question.time_limit,
      image_url: question.image_url || "",
      type: question.type || "text",
      options: question.question_options || [],
    })
    setImageFile(null) // Clear any selected file
    setImagePreviewUrl(question.image_url || null) // Set preview to existing image
    setIsEditingQuestion(true)
  }

  const handleUpdateQuestion = async () => {
    let uploadedImageUrl = newQuestion.image_url // Start with existing URL from state

    if (imageFile) {
      uploadedImageUrl = await uploadImage()
      if (!uploadedImageUrl) return // Stop if upload failed
    } else if (imagePreviewUrl === null && editingQuestion?.image_url) {
      // If image was removed by clearing preview and there was an old image
      uploadedImageUrl = null
    }

    // Validate MCQ options
    if (newQuestion.type === "mcq") {
      if (newQuestion.options.length < 2) {
        alert("MCQ questions must have at least two options.")
        return
      }
      const hasCorrectOption = newQuestion.options.some((opt) => opt.is_correct)
      if (!hasCorrectOption) {
        alert("MCQ questions must have at least one correct option.")
        return
      }
    }

    try {
      const response = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.question,
          timeLimit: newQuestion.time_limit,
          imageUrl: uploadedImageUrl,
          type: newQuestion.type,
          options: newQuestion.options,
        }),
      })

      if (response.ok) {
        await fetchQuestions()
        setIsEditingQuestion(false)
        setEditingQuestion(null)
        setNewQuestion({ question: "", time_limit: 180, image_url: "", type: "text", options: [] })
        setImageFile(null)
        setImagePreviewUrl(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to update question: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error updating question:", error)
      alert(`Error updating question: ${error.message}`)
    }
  }

  const handleDeleteQuestionClick = (questionId) => {
    setQuestionToDelete(questionId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${questionToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchQuestions()
        setShowDeleteConfirm(false)
        setQuestionToDelete(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete question: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert(`Error deleting question: ${error.message}`)
    }
  }

  const handleViewQuestionClick = (question: Question) => {
    setEditingQuestion(question) // Reusing editingQuestion state for display
    setIsViewingQuestion(true)
  }

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { id: Date.now(), option_text: "", is_correct: false, question_id: 0 }], // id is temporary
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index].option_text = value
    setNewQuestion((prev) => ({ ...prev, options: updatedOptions }))
  }

  const handleCorrectOptionChange = (index: number) => {
    const updatedOptions = newQuestion.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index, // Only one correct option for now
    }))
    setNewQuestion((prev) => ({ ...prev, options: updatedOptions }))
  }

  const handleRemoveOption = (index: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-red-100 text-sm">BFCB Quiz Management System</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/40 text-white hover:bg-white/20 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/80 border-gray-200">
            {" "}
            {/* Adjusted for responsiveness */}
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
            >
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
            >
              Responses
            </TabsTrigger>
            <TabsTrigger
              value="merit-list"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
            >
              Merit List
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <FileText className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-800 text-lg">Total Questions</h3>
                  <p className="text-3xl font-bold text-blue-700">{stats.totalQuestions}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold text-green-800 text-lg">Participants</h3>
                  <p className="text-3xl font-bold text-green-700">{stats.totalParticipants}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Clock className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold text-yellow-800 text-lg">Pending Reviews</h3>
                  <p className="text-3xl font-bold text-yellow-700">{stats.pendingReviews}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-bold text-purple-800 text-lg">Completed</h3>
                  <p className="text-3xl font-bold text-purple-700">{stats.completedReviews}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.slice(0, 5).map((response, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {response.quiz_sessions?.users?.full_name || "Unknown User"}
                        </p>
                        <p className="text-gray-600 text-sm">Submitted a response</p>
                      </div>
                      <div className="text-right">{getStatusBadge(response.evaluations?.[0]?.status || "pending")}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Manage Questions</h2>
              <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Create a new cricket-related question for the quiz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value: "text" | "mcq") =>
                          setNewQuestion((prev) => ({ ...prev, type: value, options: [] }))
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50 border-gray-200">
                          <SelectItem value="text">Text Answer</SelectItem>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your cricket question..."
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    {newQuestion.type === "mcq" && (
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option.option_text}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 bg-gray-50 border-gray-200 text-gray-900"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCorrectOptionChange(index)}
                              className={option.is_correct ? "bg-green-100 text-green-600 border-green-300" : ""}
                              title="Mark as correct"
                            >
                              {option.is_correct ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <CircleDot className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveOption(index)}
                              title="Remove option"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" onClick={handleAddOption} className="w-full bg-transparent">
                          <Plus className="h-4 w-4 mr-2" /> Add Option
                        </Button>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={newQuestion.time_limit}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, time_limit: Number.parseInt(e.target.value) })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUpload">Question Image (Optional)</Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      {imagePreviewUrl && (
                        <div className="mt-2 relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={imagePreviewUrl || "/placeholder.svg"}
                            alt="Image Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 bg-white/70 hover:bg-white"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreviewUrl(null)
                              setNewQuestion((prev) => ({ ...prev, image_url: "" })) // Clear image_url from state
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingQuestion(false)
                        setNewQuestion({ question: "", time_limit: 180, image_url: "", type: "text", options: [] })
                        setImageFile(null)
                        setImagePreviewUrl(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Question
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="bg-white/90 border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-gray-800 text-lg">
                          Question {question.id} ({question.type === "mcq" ? "Multiple Choice" : "Text Answer"})
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                          Time Limit: {formatTime(question.time_limit)} | Created:{" "}
                          {new Date(question.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                          onClick={() => handleViewQuestionClick(question)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                          onClick={() => handleEditQuestionClick(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeleteQuestionClick(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.image_url && (
                      <div className="mb-4">
                        <img
                          src={question.image_url || "/placeholder.svg"}
                          alt="Question Image"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-gray-800 leading-relaxed">{question.question}</p>
                    </div>
                    {question.type === "mcq" && question.question_options && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-700">Options:</h4>
                        {question.question_options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-2 p-2 rounded-md ${
                              option.is_correct
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            {option.is_correct ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <CircleDot className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-gray-800">{option.option_text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">User Responses</h2>
              <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>

            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id} className="bg-white/90 border-gray-200">
                  {console.log("Rendering response ID:", response.id, "Evaluations:", response.evaluations)}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-800 text-lg">
                          {response.quiz_sessions?.users?.full_name || "Unknown User"}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Facebook: {response.quiz_sessions?.users?.facebook_name || "N/A"} | Time Spent:{" "}
                          {formatTime(response.time_spent)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(response.evaluations?.[0]?.status || "pending")}
                        {response.evaluations?.[0]?.score && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            Score: {response.evaluations[0].score}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Question:</h4>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-800 text-sm">{response.questions?.question || "Question not found"}</p>
                        {response.questions?.image_url && (
                          <img
                            src={response.questions.image_url || "/placeholder.svg"}
                            alt="Question Image"
                            className="mt-2 max-w-full h-auto rounded-lg"
                          />
                        )}
                        {response.questions?.type === "mcq" && response.questions?.question_options && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-medium text-gray-700">Options:</h4>
                            {response.questions.question_options.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center gap-2 p-2 rounded-md ${
                                  option.is_correct
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-gray-50 border border-gray-200"
                                }`}
                              >
                                {option.is_correct ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <CircleDot className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="text-gray-800">{option.option_text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Answer:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-800 text-sm">{response.answer}</p>
                      </div>
                    </div>

                    {/* Always show evaluate button, pre-fill if already evaluated */}
                    <Dialog
                      open={evaluatingResponse === response.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEvaluatingResponse(null)
                          setEvaluationData({ score: 2, status: "correct", admin_notes: "" }) // Reset form on close
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEvaluatingResponse(response.id)
                            // Pre-fill if already evaluated
                            if (response.evaluations && response.evaluations.length > 0) {
                              setEvaluationData({
                                score: response.evaluations[0].score,
                                status: response.evaluations[0].status,
                                admin_notes: response.evaluations[0].admin_notes || "",
                              })
                            } else {
                              setEvaluationData({ score: 2, status: "correct", admin_notes: "" }) // Default for new evaluation
                            }
                          }}
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          {response.evaluations && response.evaluations.length > 0
                            ? "Edit Evaluation"
                            : "Evaluate Response"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-gray-200 text-gray-900">
                        <DialogHeader>
                          <DialogTitle>Evaluate Response</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Provide a score and feedback for this answer.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="score">Score (0-10)</Label>
                            <Input
                              id="score"
                              type="number"
                              min="0"
                              max="5"
                              value={evaluationData.score}
                              onChange={(e) =>
                                setEvaluationData({ ...evaluationData, score: Number.parseInt(e.target.value) })
                              }
                              className="bg-gray-50 border-gray-200 text-gray-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={evaluationData.status}
                              onValueChange={(value) => setEvaluationData({ ...evaluationData, status: value })}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-50 border-gray-200">
                                <SelectItem value="correct">Correct</SelectItem>
                                <SelectItem value="incorrect">Incorrect</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="notes">Admin Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Optional feedback..."
                              value={evaluationData.admin_notes}
                              onChange={(e) => setEvaluationData({ ...evaluationData, admin_notes: e.target.value })}
                              className="bg-gray-50 border-gray-200 text-gray-900"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEvaluatingResponse(null)}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleEvaluateResponse(response.id)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Evaluation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Merit List Tab */}
          <TabsContent value="merit-list" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Merit List</h2>
              <Button
                onClick={exportMeritList}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Merit List
              </Button>
            </div>

            <Card className="bg-white/80 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Final Rankings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ranked by total score (descending), then by total time (ascending)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meritList.map((participant, index) => (
                    <div
                      key={participant.user_id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                          : index === 1
                            ? "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300"
                            : index === 2
                              ? "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300"
                              : "bg-white border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-600 to-orange-600"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-500 to-gray-600"
                              : index === 2
                                ? "bg-gradient-to-r from-orange-700 to-orange-800"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{participant.full_name}</h3>
                        <p className="text-sm text-gray-600">{participant.facebook_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">Score: {participant.total_score}/10</p>
                        <p className="text-sm text-gray-600">Time: {formatTime(participant.total_time_spent || 0)}</p>
                        <Badge
                          className={`mt-1 ${
                            participant.evaluation_status === "completed"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }`}
                        >
                          {participant.evaluation_status}
                        </Badge>
                      </div>
                      {index < 3 && (
                        <div className="ml-2">
                          {index === 0 && <Trophy className="h-6 w-6 text-yellow-600" />}
                          {index === 1 && <Award className="h-6 w-6 text-gray-600" />}
                          {index === 2 && <Award className="h-6 w-6 text-orange-700" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription className="text-gray-600">Update the question text and time limit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value: "text" | "mcq") =>
                  setNewQuestion((prev) => ({ ...prev, type: value, options: [] }))
                }
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 border-gray-200">
                  <SelectItem value="text">Text Answer</SelectItem>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editQuestion">Question</Label>
              <Textarea
                id="editQuestion"
                placeholder="Enter your cricket question..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            {newQuestion.type === "mcq" && (
              <div className="space-y-3">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={option.id || index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 bg-gray-50 border-gray-200 text-gray-900"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCorrectOptionChange(index)}
                      className={option.is_correct ? "bg-green-100 text-green-600 border-green-300" : ""}
                      title="Mark as correct"
                    >
                      {option.is_correct ? <CheckCircle className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      title="Remove option"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddOption} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="editTimeLimit">Time Limit (seconds)</Label>
              <Input
                id="editTimeLimit"
                type="number"
                value={newQuestion.time_limit}
                onChange={(e) => setNewQuestion({ ...newQuestion, time_limit: Number.parseInt(e.target.value) })}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="editImageUpload">Question Image (Optional)</Label>
              <Input
                id="editImageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
              {(imagePreviewUrl || newQuestion.image_url) && (
                <div className="mt-2 relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={imagePreviewUrl || newQuestion.image_url}
                    alt="Image Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 bg-white/70 hover:bg-white"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreviewUrl(null)
                      setNewQuestion((prev) => ({ ...prev, image_url: "" })) // Clear image_url from state
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingQuestion(false)
                setEditingQuestion(null)
                setNewQuestion({ question: "", time_limit: 180, image_url: "", type: "text", options: [] })
                setImageFile(null)
                setImagePreviewUrl(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} disabled={!newQuestion.question.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Update Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Question Dialog */}
      <Dialog open={isViewingQuestion} onOpenChange={setIsViewingQuestion}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Question</DialogTitle>
            <DialogDescription className="text-gray-600">Full text of the question.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingQuestion?.image_url && (
              <div className="mb-4">
                <img
                  src={editingQuestion.image_url || "/placeholder.svg"}
                  alt="Question Image"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            <div>
              <Label>Question</Label>
              <p className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-900">
                {editingQuestion?.question}
              </p>
            </div>
            {editingQuestion?.type === "mcq" && editingQuestion?.question_options && (
              <div className="space-y-3">
                <Label>Options</Label>
                {editingQuestion.question_options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-2 p-2 rounded-md ${
                      option.is_correct ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {option.is_correct ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <CircleDot className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-gray-800">{option.option_text}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <Label>Time Limit (seconds)</Label>
              <p className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-900">
                {editingQuestion?.time_limit} seconds
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingQuestion(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteQuestion} className="bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
