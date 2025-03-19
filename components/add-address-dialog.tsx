"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { addAddress } from "@/lib/data-service"

export function AddAddressDialog({ city, onAddressAdded }: { city: string; onAddressAdded: () => void }) {
  const [newAddress, setNewAddress] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleAd = useState(false)

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      addAddress(city, newAddress)
      setNewAddress("")
      setIsOpen(false)
      toast({
        title: "Adresse ajoutée",
        description: `L'adresse ${newAddress} a été ajoutée à ${city}.`,
      })

      // Déclencher un événement de stockage pour mettre à jour la liste des adresses
      window.dispatchEvent(new Event("storage"))

      // Appeler la fonction de rappel pour mettre à jour la liste des adresses dans le composant parent
      onAddressAdded()

      // Rediriger vers la nouvelle page d'adresse
      router.push(`/${encodeURIComponent(city)}/${encodeURIComponent(newAddress)}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Nouvelle Adresse</Button>
      </DialogTrigger>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle adresse à {city}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Adresse complète"
              className="bg-input text-input-foreground"
            />
          </div>
        </div>
        <Button onClick={handleAddAddress} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Ajouter
        </Button>
      </DialogContent>
    </Dialog>
  )
}

