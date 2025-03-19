"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { updateChecklistData, getGlobalChecklist, getAddressData } from "@/lib/data-service"

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

interface ChecklistCategory {
  id: string
  name: string
  items: ChecklistItem[]
}

export default function AddressChecklist({
  city,
  address,
}: {
  city: string
  address: string
}) {
  const [categories, setCategories] = useState<ChecklistCategory[]>([])

  useEffect(() => {
    const loadChecklist = () => {
      const addressData = getAddressData(city, address)
      if (addressData && addressData.checklist && addressData.checklist.categories) {
        setCategories(addressData.checklist.categories)
      } else {
        // Si aucune donnée n'existe pour cette adresse, utilisez la checklist globale
        const globalChecklist = getGlobalChecklist()
        setCategories(
          globalChecklist.map((category) => ({
            ...category,
            items: category.items.map((item) => ({ ...item, completed: false })),
          })),
        )
      }
    }

    loadChecklist()
    window.addEventListener("storage", loadChecklist)

    return () => {
      window.removeEventListener("storage", loadChecklist)
    }
  }, [city, address])

  const toggleItem = (categoryId: string, itemId: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
          }
        : category,
    )
    setCategories(updatedCategories)
    updateChecklistData(city, address, { categories: updatedCategories })
  }

  const completedCount = categories.reduce(
    (total, category) => total + category.items.filter((item) => item.completed).length,
    0,
  )
  const totalCount = categories.reduce((total, category) => total + category.items.length, 0)
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Checklist</CardTitle>
        <CardDescription>
          Progression: {completedCount}/{totalCount} ({progress.toFixed(0)}%)
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(category.id, item.id)}
                  />
                  <Label htmlFor={item.id} className={`${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              Aucun élément dans la checklist. Ajoutez des éléments dans les paramètres.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

