"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getCityAddresses, deleteAddress } from "@/lib/data-service"
import { AddAddressDialog } from "@/components/add-address-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CityView({ city }: { city: string }) {
  const [addresses, setAddresses] = useState<string[]>([])
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadAddresses = () => {
      const addressesData = getCityAddresses(city)
      console.log("Loaded addresses:", addressesData) // Pour le débogage
      setAddresses(addressesData)
    }

    loadAddresses()
    window.addEventListener("storage", loadAddresses)

    return () => {
      window.removeEventListener("storage", loadAddresses)
    }
  }, [city])

  const handleAddressClick = (address: string) => {
    router.push(`/${encodeURIComponent(city)}/${encodeURIComponent(address)}`)
  }

  const handleDeleteAddress = (address: string) => {
    deleteAddress(city, address)
    toast({
      title: "Adresse supprimée",
      description: `L'adresse ${address} a été supprimée avec succès.`,
    })
    // Recharger la liste des adresses
    setAddresses(getCityAddresses(city))
    setAddressToDelete(null)
  }

  const navigateBack = () => {
    router.push("/")
  }

  return (
    <div className="container mx-auto py-6 bg-background text-foreground">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={navigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">{city}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Adresses ({addresses.length})</h2>
        <div className="flex gap-2">
          <ThemeToggle />
          <AddAddressDialog city={city} onAddressAdded={() => setAddresses(getCityAddresses(city))} />
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border dark:bg-[#0f0f10]">
          <p className="text-card-foreground mb-4">Aucune adresse n'a encore été ajoutée pour cette ville.</p>
          <AddAddressDialog city={city} onAddressAdded={() => setAddresses(getCityAddresses(city))} />
        </div>
      ) : (
        <div>
          {addresses.map((address) => (
            <div
              key={address}
              className="flex items-center justify-between p-4 bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg cursor-pointer mb-3 border border-border dark:bg-[#0f0f10]"
              onClick={() => handleAddressClick(address)}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-medium text-card-foreground">{address}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setAddressToDelete(address)
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/20 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addressToDelete !== null} onOpenChange={() => setAddressToDelete(null)}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer l'adresse {addressToDelete} ?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddressToDelete(null)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => addressToDelete && handleDeleteAddress(addressToDelete)}
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

