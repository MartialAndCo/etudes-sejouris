"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Trash2, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getCities, addCity, deleteCity } from "@/lib/data-service"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Dashboard() {
  const [cities, setCities] = useState<{ name: string; addresses: string[] }[]>([])
  const [newCity, setNewCity] = useState("")
  const [isAddCityOpen, setIsAddCityOpen] = useState(false)
  const [cityToDelete, setCityToDelete] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadCities = () => {
      const citiesData = getCities()
      if (Array.isArray(citiesData)) {
        setCities(citiesData)
      } else {
        console.error("getCities did not return an array:", citiesData)
        setCities([])
      }
    }

    loadCities()
    window.addEventListener("storage", loadCities)

    return () => {
      window.removeEventListener("storage", loadCities)
    }
  }, [])

  const handleAddCity = () => {
    if (newCity.trim()) {
      addCity(newCity)
      setNewCity("")
      setIsAddCityOpen(false)
      toast({
        title: "Ville ajoutée",
        description: `La ville ${newCity} a été ajoutée avec succès.`,
      })
      setCities(getCities())
    }
  }

  const handleDeleteCity = (cityName: string) => {
    deleteCity(cityName)
    toast({
      title: "Ville supprimée",
      description: `La ville ${cityName} a été supprimée avec succès.`,
    })
    setCities(getCities())
    setCityToDelete(null)
  }

  const navigateToCity = (city: string) => {
    router.push(`/${encodeURIComponent(city)}`)
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Gestion de Sous-Location</h1>
        <div className="flex gap-2">
          <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Ville
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle ville</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cityName">Nom de la ville</Label>
                  <Input
                    id="cityName"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Nom de la ville"
                    className="bg-input text-input-foreground"
                  />
                </div>
              </div>
              <Button onClick={handleAddCity} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Ajouter
              </Button>
            </DialogContent>
          </Dialog>

          <ThemeToggle />

          <Button
            variant="outline"
            onClick={() => router.push("/settings")}
            aria-label="Gérer la checklist de base"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {cities.map((city, index) => (
          <motion.div
            key={city.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-card text-card-foreground shadow-lg rounded-lg mb-4 overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-border dark:bg-[#0f0f10]"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => navigateToCity(city.name)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-3 rounded-full">
                  <Home className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{city.name}</h2>
                  <p className="text-sm text-muted-foreground">{city.addresses.length} adresse(s)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setCityToDelete(city.name)
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/20 transition-colors duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {cities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 bg-card rounded-lg mt-6 border border-border dark:bg-[#0f0f10]"
        >
          <p className="text-card-foreground mb-4">Aucune ville n'a encore été ajoutée.</p>
          <Button
            onClick={() => setIsAddCityOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une ville
          </Button>
        </motion.div>
      )}

      <Dialog open={cityToDelete !== null} onOpenChange={() => setCityToDelete(null)}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer la ville {cityToDelete} ?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCityToDelete(null)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => cityToDelete && handleDeleteCity(cityToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

