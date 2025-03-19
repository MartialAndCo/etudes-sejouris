"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfitabilityCalculator from "@/components/profitability-calculator"
import AddressChecklist from "@/components/address-checklist"
import PhotoGallery from "@/components/photo-gallery"
import { getAddressData } from "@/lib/data-service"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AddressView({
  city,
  address,
}: {
  city: string
  address: string
}) {
  const [addressData, setAddressData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const data = getAddressData(city, address)
    setAddressData(data)
  }, [city, address])

  const navigateBack = () => {
    router.push(`/${encodeURIComponent(city)}`)
  }

  if (!addressData) {
    return <div className="container mx-auto py-6">Chargement...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={navigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à {city}
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{address}</h1>
          <p className="text-muted-foreground">{city}</p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="profitability" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profitability">Calcul de Rentabilité</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="gallery">Galerie Photos</TabsTrigger>
        </TabsList>
        <TabsContent value="profitability">
          <ProfitabilityCalculator city={city} address={address} data={addressData.profitability} />
        </TabsContent>
        <TabsContent value="checklist">
          <AddressChecklist city={city} address={address} data={addressData.checklist} />
        </TabsContent>
        <TabsContent value="gallery">
          <PhotoGallery city={city} address={address} photos={addressData.photos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

