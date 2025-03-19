"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updatePhotoGallery } from "@/lib/data-service"
import { useToast } from "@/components/ui/use-toast"

interface Photo {
  id: string
  url: string
  caption: string
}

export default function PhotoGallery({
  city,
  address,
  photos: initialPhotos = [],
}: {
  city: string
  address: string
  photos: Photo[]
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("city", city)
      formData.append("address", address)

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const responseText = await response.text()
        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", responseText)
          throw new Error(`Invalid response: ${responseText.substring(0, 100)}...`)
        }

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}\n${JSON.stringify(result)}`)
        }

        if (!result.url) {
          throw new Error("Upload response is missing URL")
        }

        return {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: result.url,
          caption: file.name,
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload de la photo.",
          variant: "destructive",
        })
        return null
      }
    })

    const newPhotos = (await Promise.all(uploadPromises)).filter((photo): photo is Photo => photo !== null)

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)
      updatePhotoGallery(city, address, updatedPhotos)
      toast({
        title: "Photos ajoutées",
        description: `${newPhotos.length} photo(s) ont été ajoutées avec succès.`,
      })
    }
  }

  const handleRemovePhoto = (id: string) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== id)
    setPhotos(updatedPhotos)
    updatePhotoGallery(city, address, updatedPhotos)
    toast({
      title: "Photo supprimée",
      description: "La photo a été supprimée avec succès.",
    })
  }

  const openPhotoViewer = (photo: Photo) => {
    setSelectedPhoto(photo)
    setViewerOpen(true)
  }

  const navigatePhoto = (direction: "next" | "prev") => {
    if (!selectedPhoto) return

    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % photos.length
    } else {
      newIndex = (currentIndex - 1 + photos.length) % photos.length
    }

    setSelectedPhoto(photos[newIndex])
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Galerie Photos</CardTitle>
        <CardDescription>{photos.length} photo(s) pour cette adresse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAddPhoto}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter des photos
          </Button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aucune photo ajoutée</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.caption}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer"
                  onClick={() => openPhotoViewer(photo)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePhoto(photo.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm mt-1 truncate">{photo.caption}</p>
              </div>
            ))}
          </div>
        )}

        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto?.caption}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              {selectedPhoto && (
                <img
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.caption}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => navigatePhoto("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => navigatePhoto("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

