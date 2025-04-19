"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, BookOpen, LogOut } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()

  // Don't show navbar on comic view pages or when viewing a comic
  if (pathname.startsWith("/comics/") || pathname === "/") {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem("comic-auth")
    window.location.reload()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
        >
          Sargassum Comic Gen
        </Link>

        <div className="flex gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Home className="h-4 w-4 mr-2" />
              Create
            </Button>
          </Link>

          <Link href="/comics">
            <Button
              variant={pathname === "/comics" ? "secondary" : "ghost"}
              size="sm"
              className={
                pathname === "/comics"
                  ? "bg-white/10 border border-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/10 transition-all"
              }
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Comics
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
