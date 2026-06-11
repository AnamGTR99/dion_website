import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "By Dion Camilleri — Portfolio",
  description:
    "Portfolio of Dion Camilleri — videography, photography, animation, clothing design, and creative direction.",
  openGraph: {
    title: "By Dion Camilleri — Portfolio",
    description:
      "Portfolio of Dion Camilleri — videography, photography, animation, clothing design, and creative direction.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ps2-black text-ps2-text font-[var(--font-ps2)] overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
