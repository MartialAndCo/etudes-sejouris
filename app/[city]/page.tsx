"use client"

import CityView from "@/components/city-view"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CityPage({ params }: { params: { city: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Vérifiez que ce n'est pas la page des paramètres
    if (params.city === "settings") {
      router.push("/settings")
    }
  }, [params.city, router])

  if (params.city === "settings") {
    return null
  }

  return <CityView city={decodeURIComponent(params.city)} />
}

