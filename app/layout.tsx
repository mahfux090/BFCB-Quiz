import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BFCB Quiz - Bangladesh Future Cricket Board",
  description: "Test your cricket knowledge and compete with fellow BFCB members in this challenging quiz platform.",
  keywords: "cricket, quiz, bangladesh, BFCB, sports, competition",
  authors: [{ name: "BFCB Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#10b981",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BFCB Quiz" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
