"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [storedTheme, setStoredTheme] = useState<string | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    setStoredTheme(savedTheme)
  }, [])

  useEffect(() => {
    if (storedTheme) {
      localStorage.setItem("theme", storedTheme)
      setTheme(storedTheme)
    }
  }, [storedTheme, setTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-center">
          <Switch
            checked={storedTheme !== "light"}
            onCheckedChange={() => setStoredTheme(storedTheme === "light" ? "dark" : "light")}
            className="bg-slate-200 dark:bg-slate-800 relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            <span className="sr-only">Toggle theme</span>
            <span
              aria-hidden="true"
              className={`${storedTheme !== "light" ? "translate-x-5" : "translate-x-0"}
        pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            >
              <Sun className="h-[20px] w-[20px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[20px] w-[20px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
          </Switch>
          <div className="flex justify-between w-[44px] mt-1">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}

