// Types
interface City {
  name: string
  addresses: string[]
}

interface ProfitabilityData {
  monthlyRent: number
  platforms: {
    name: string
    nightlyRate: number
    occupancyRate: number
    monthlyRevenue: number
  }[]
}

interface ChecklistItem {
  id: string
  label: string
  completed?: boolean
}

interface ChecklistCategory {
  id: string
  name: string
  items: ChecklistItem[]
}

interface AddressData {
  profitability: ProfitabilityData
  checklist: {
    categories: ChecklistCategory[]
  }
  photos: {
    id: string
    url: string
    caption: string
  }[]
}

// Helper to safely access localStorage (for client-side only)
const storage = {
  get: (key: string) => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  },
  set: (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
}

// Initialize data if not exists
const initializeData = () => {
  if (!storage.get("cities")) {
    storage.set("cities", [])
  }
  if (!storage.get("globalChecklist")) {
    storage.set("globalChecklist", [
      {
        id: "category-1",
        name: "Préparation",
        items: [
          { id: "item-1", label: "Vérifier les équipements" },
          { id: "item-2", label: "Prendre des photos" },
        ],
      },
      {
        id: "category-2",
        name: "Administration",
        items: [
          { id: "item-3", label: "Créer les annonces" },
          { id: "item-4", label: "Vérifier le contrat de location" },
        ],
      },
      {
        id: "category-3",
        name: "Entretien",
        items: [{ id: "item-5", label: "Organiser le ménage" }],
      },
    ])
  }
  if (!storage.get("addressData")) {
    storage.set("addressData", {})
  }
}

// City operations
export const getCities = (): City[] => {
  initializeData()
  const cities = storage.get("cities")
  if (Array.isArray(cities)) {
    return cities
  } else {
    console.error("Invalid cities data in storage:", cities)
    return []
  }
}

export const addCity = (cityName: string) => {
  initializeData()
  const cities = getCities()
  if (!cities.some((city) => city.name === cityName)) {
    cities.push({
      name: cityName,
      addresses: [],
    })
    storage.set("cities", cities)
    // Déclencher un événement de stockage pour informer les autres composants
    window.dispatchEvent(new Event("storage"))
  }
}

export const getCityAddresses = (cityName: string): string[] => {
  const cities = getCities()
  const city = cities.find((c) => c.name === cityName)
  return city ? city.addresses : []
}

export const addAddress = (cityName: string, addressName: string) => {
  const cities = getCities()
  let cityIndex = cities.findIndex((city) => city.name === cityName)

  if (cityIndex === -1) {
    addCity(cityName)
    cities.push({ name: cityName, addresses: [] })
    cityIndex = cities.length - 1
  }

  if (!cities[cityIndex].addresses.includes(addressName)) {
    cities[cityIndex].addresses.push(addressName)
    storage.set("cities", cities)
  }

  initializeAddressData(cityName, addressName)
}

export const deleteCity = (cityName: string) => {
  let cities = getCities()
  cities = cities.filter((city) => city.name !== cityName)
  storage.set("cities", cities)

  // Supprimer toutes les données d'adresse associées à cette ville
  const addressData = storage.get("addressData") || {}
  Object.keys(addressData).forEach((key) => {
    if (key.startsWith(`${cityName}:`)) {
      delete addressData[key]
    }
  })
  storage.set("addressData", addressData)

  // Déclencher un événement de stockage pour informer les autres composants
  window.dispatchEvent(new Event("storage"))
}

export const deleteAddress = (cityName: string, addressName: string) => {
  const cities = getCities()
  const cityIndex = cities.findIndex((city) => city.name === cityName)
  if (cityIndex !== -1) {
    cities[cityIndex].addresses = cities[cityIndex].addresses.filter((address) => address !== addressName)
    storage.set("cities", cities)
  }

  // Supprimer les données d'adresse spécifiques
  const addressData = storage.get("addressData") || {}
  const key = `${cityName}:${addressName}`
  if (addressData[key]) {
    delete addressData[key]
    storage.set("addressData", addressData)
  }

  // Déclencher un événement de stockage pour informer les autres composants
  window.dispatchEvent(new Event("storage"))
}

// Address data operations
const initializeAddressData = (cityName: string, addressName: string) => {
  const addressData = storage.get("addressData") || {}
  const key = `${cityName}:${addressName}`

  if (!addressData[key]) {
    addressData[key] = {
      profitability: {
        monthlyRent: 0,
        platforms: [
          { name: "Airbnb", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Booking", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Abritel", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Autre", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
        ],
      },
      checklist: {
        categories: getGlobalChecklist().map((category) => ({
          ...category,
          items: category.items.map((item) => ({ ...item, completed: false })),
        })),
      },
      photos: [],
    }
    storage.set("addressData", addressData)
  }
}

export const getAddressData = (cityName: string, addressName: string): AddressData => {
  initializeData()
  const addressData = storage.get("addressData") || {}
  const key = `${cityName}:${addressName}`

  if (!addressData[key]) {
    const globalChecklist = getGlobalChecklist()
    addressData[key] = {
      profitability: {
        monthlyRent: 0,
        platforms: [
          { name: "AirDNA", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Airbnb Homes", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Airbnb Haute", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
          { name: "Airbnb Basse", nightlyRate: 0, occupancyRate: 0, monthlyRevenue: 0 },
        ],
      },
      checklist: {
        categories: globalChecklist.map((category) => ({
          ...category,
          items: category.items.map((item) => ({ ...item, completed: false })),
        })),
      },
      photos: [],
    }
    storage.set("addressData", addressData)
  }

  return addressData[key]
}

export const updateProfitabilityData = (cityName: string, addressName: string, data: ProfitabilityData) => {
  const addressData = storage.get("addressData") || {}

  const key = `${cityName}:${addressName}`

  if (addressData[key]) {
    addressData[key].profitability = data
    storage.set("addressData", addressData)
  }
}

export const updateChecklistData = (
  cityName: string,
  addressName: string,
  data: { categories: ChecklistCategory[] },
) => {
  const addressData = storage.get("addressData") || {}
  const key = `${cityName}:${addressName}`

  if (addressData[key]) {
    addressData[key].checklist = data
    storage.set("addressData", addressData)
  }
}

export const updatePhotoGallery = (cityName: string, addressName: string, photos: any[]) => {
  const addressData = storage.get("addressData") || {}
  const key = `${cityName}:${addressName}`

  if (addressData[key]) {
    addressData[key].photos = photos
    storage.set("addressData", addressData)
  }
}

// Global checklist operations
export const getGlobalChecklist = (): ChecklistCategory[] => {
  initializeData()
  return storage.get("globalChecklist") || []
}

export const updateGlobalChecklist = (categories: ChecklistCategory[]) => {
  storage.set("globalChecklist", categories)
  // Mettre à jour toutes les adresses existantes avec la nouvelle checklist globale
  const addressData = storage.get("addressData") || {}
  Object.keys(addressData).forEach((key) => {
    addressData[key].checklist = {
      categories: categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, completed: false })),
      })),
    }
  })
  storage.set("addressData", addressData)
  // Déclencher un événement de stockage pour informer les autres composants
  window.dispatchEvent(new Event("storage"))
}

