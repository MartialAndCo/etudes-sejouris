"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { updateProfitabilityData } from "@/lib/data-service"

interface Platform {
  name: string
  nightlyRate: number
  occupancyRate: number
  monthlyRevenue: number
  profit: number
}

interface ProfitabilityData {
  monthlyRent: number
  platforms: Platform[]
}

export default function ProfitabilityCalculator({
  city,
  address,
  data,
}: {
  city: string
  address: string
  data: ProfitabilityData
}) {
  const [monthlyRent, setMonthlyRent] = useState(data?.monthlyRent || 0)
  const [platforms, setPlatforms] = useState<Platform[]>(
    data?.platforms || [
      { name: "AirDNA", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0, profit: 0 },
      { name: "Airbnb Homes", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0, profit: 0 },
      { name: "Airbnb Haute", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0, profit: 0 },
      { name: "Airbnb Basse", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0, profit: 0 },
    ],
  )

  useEffect(() => {
    const updatedPlatforms = platforms.map((platform) => {
      const daysPerMonth = (platform.occupancyRate / 100) * 30
      const monthlyRevenue = platform.nightlyRate * daysPerMonth
      const profit = monthlyRevenue - monthlyRent
      return { ...platform, monthlyRevenue, profit }
    })

    const revenuesChanged = updatedPlatforms.some(
      (platform, index) =>
        platform.monthlyRevenue !== platforms[index].monthlyRevenue || platform.profit !== platforms[index].profit,
    )

    if (revenuesChanged) {
      setPlatforms(updatedPlatforms)
    }
  }, [platforms, monthlyRent])

  useEffect(() => {
    updateProfitabilityData(city, address, {
      monthlyRent,
      platforms,
    })
  }, [city, address, monthlyRent, platforms])

  const handlePlatformChange = (index: number, field: keyof Platform, value: number) => {
    const updatedPlatforms = [...platforms]
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value }
    setPlatforms(updatedPlatforms)
  }

  const getBestPlatform = () => {
    if (platforms.length === 0) return null
    return platforms.reduce((best, current) => (current.monthlyRevenue > best.monthlyRevenue ? current : best))
  }

  const bestPlatform = getBestPlatform()
  const bestRevenue = bestPlatform?.monthlyRevenue || 0
  const profit = bestRevenue - monthlyRent
  const profitMargin = monthlyRent > 0 ? (profit / monthlyRent) * 100 : 0
  const isProfitable = profitMargin >= 50

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calcul de Rentabilité</CardTitle>
        <CardDescription>Analysez la rentabilité de votre bien en sous-location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Loyer Mensuel (€)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={monthlyRent || ""}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              placeholder="Entrez le loyer mensuel"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estimations par Plateforme</h3>

            <div className="grid grid-cols-5 gap-2 font-medium text-sm mb-2">
              <div>Plateforme</div>
              <div>Prix/Nuit (€)</div>
              <div>Taux d'occupation (%)</div>
              <div>Revenu Mensuel (€)</div>
              <div>Rentabilité (€)</div>
            </div>

            {platforms.map((platform, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-center">
                <div>{platform.name}</div>
                <Input
                  type="number"
                  value={platform.nightlyRate || ""}
                  onChange={(e) => handlePlatformChange(index, "nightlyRate", Number(e.target.value))}
                  placeholder="0"
                />
                <Input
                  type="number"
                  value={platform.occupancyRate || ""}
                  onChange={(e) => handlePlatformChange(index, "occupancyRate", Number(e.target.value))}
                  placeholder="0"
                />
                <div className="font-medium">
                  {(platform.monthlyRevenue || 0).toFixed(2)} €
                  <div className="text-xs text-muted-foreground">
                    {(((platform.occupancyRate || 0) / 100) * 30).toFixed(1)} jours/mois
                  </div>
                </div>
                <div
                  className={`font-medium ${(platform.profit || 0) >= monthlyRent / 2 ? "text-green-600" : "text-red-600"}`}
                >
                  {(platform.profit || 0).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-4 mt-6">
            <h3 className="text-lg font-medium">Résumé de Rentabilité</h3>

            {bestPlatform && (
              <div className="grid grid-cols-2 gap-2">
                <div>Meilleure plateforme:</div>
                <div className="font-medium">{bestPlatform.name}</div>

                <div>Revenu mensuel estimé:</div>
                <div className="font-medium">{(bestRevenue || 0).toFixed(2)} €</div>

                <div>Loyer mensuel:</div>
                <div className="font-medium">{(monthlyRent || 0).toFixed(2)} €</div>

                <div>Bénéfice mensuel:</div>
                <div className="font-medium">{(profit || 0).toFixed(2)} €</div>

                <div>Marge bénéficiaire:</div>
                <div className="font-medium">{(profitMargin || 0).toFixed(2)}%</div>

                <div>Statut:</div>
                <div>
                  {isProfitable ? (
                    <Badge className="bg-green-500">Rentable</Badge>
                  ) : (
                    <Badge variant="destructive">Non Rentable</Badge>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">Rentable si bénéfices ≥ 50% des charges</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

