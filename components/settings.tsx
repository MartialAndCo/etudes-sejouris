"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getGlobalChecklist, updateGlobalChecklist } from "@/lib/data-service"
import { ThemeToggle } from "@/components/theme-toggle"

interface ChecklistItem {
  id: string
  label: string
}

interface ChecklistCategory {
  id: string
  name: string
  items: ChecklistItem[]
}

export default function Settings() {
  const [categories, setCategories] = useState<ChecklistCategory[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newItem, setNewItem] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checklist = getGlobalChecklist()
    setCategories(checklist)
    if (checklist.length > 0) {
      setSelectedCategory(checklist[0].id)
      setExpandedCategories([checklist[0].id])
    }
  }, [])

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCategoryObj: ChecklistCategory = {
        id: `category-${Date.now()}`,
        name: newCategory.trim(),
        items: [],
      }
      setCategories((prevCategories) => {
        const updatedCategories = [...prevCategories, newCategoryObj]
        updateGlobalChecklist(updatedCategories)
        return updatedCategories
      })
      setNewCategory("")
      setSelectedCategory(newCategoryObj.id)
      setExpandedCategories((prev) => [...prev, newCategoryObj.id])
      toast({
        title: "Catégorie ajoutée",
        description: `La catégorie "${newCategory}" a été ajoutée.`,
      })
    }
  }

  const handleAddItem = () => {
    if (newItem.trim() && selectedCategory) {
      const newItemObj: ChecklistItem = {
        id: `item-${Date.now()}`,
        label: newItem.trim(),
      }
      setCategories((prevCategories) => {
        const updatedCategories = prevCategories.map((category) =>
          category.id === selectedCategory ? { ...category, items: [...category.items, newItemObj] } : category,
        )
        updateGlobalChecklist(updatedCategories)
        return updatedCategories
      })
      setNewItem("")
      toast({
        title: "Élément ajouté",
        description: `L'élément "${newItem}" a été ajouté à la checklist.`,
      })
    }
  }

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.map((category) =>
        category.id === categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category,
      )
      updateGlobalChecklist(updatedCategories)
      return updatedCategories
    })
    toast({
      title: "Élément supprimé",
      description: "L'élément a été supprimé de la checklist.",
    })
  }

  const handleRemoveCategory = (categoryId: string) => {
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.filter((category) => category.id !== categoryId)
      updateGlobalChecklist(updatedCategories)
      return updatedCategories
    })
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.filter((category) => category.id !== categoryId)
      updateGlobalChecklist(updatedCategories)
      if (selectedCategory === categoryId) {
        setSelectedCategory(updatedCategories.length > 0 ? updatedCategories[0].id : null)
      }
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId))
      return updatedCategories
    })
    toast({
      title: "Catégorie supprimée",
      description: "La catégorie a été supprimée de la checklist.",
    })
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const navigateBack = () => {
    router.push("/")
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={navigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-primary flex-1">Paramètres</h1>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-2xl mx-auto bg-background text-foreground">
        <CardHeader>
          <CardTitle>Checklist Globale</CardTitle>
          <CardDescription>
            Configurez les catégories et les éléments qui apparaîtront dans la checklist de chaque adresse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nouvelle catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory()
                  }
                }}
                className="flex-grow"
              />
              <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter Catégorie
              </Button>
            </div>

            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => toggleCategoryExpansion(category.id)}>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedCategories.includes(category.id) && (
                  <div>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="Nouvel élément"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddItem()
                          }
                        }}
                        className="flex-grow"
                      />
                      <Button
                        onClick={handleAddItem}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-card text-card-foreground rounded-md"
                        >
                          <span>{item.label}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(category.id, item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {category.items.length === 0 && (
                        <div className="text-center py-2 text-muted-foreground">Aucun élément dans cette catégorie</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">Aucune catégorie dans la checklist globale</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

