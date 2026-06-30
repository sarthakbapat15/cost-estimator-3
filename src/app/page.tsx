'use client'

import { useState, Fragment } from 'react'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, RotateCcw, Calculator, FileDown, IndianRupee, BedDouble, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BedroomTypeCards, { createEmptyBedroom, DEFAULT_TALL_UNIT_FINISH_RATES, type BedroomData } from '@/components/bedroom-type-cards'
import RateSettingsDialog, { mergePrices } from '@/components/rate-settings-dialog'

const DEFAULT_PRICES = {
  tandemDrawers: { Olive: 8000, Blum: 12000, Hettich: 12000 },
  dustbinBTD: { Olive: 7500, Blum: 7500, Hettich: 7500 },
  bottlePullout: { Olive: 8000, Blum: 8000, Hettich: 8000 },
  wickerBasket: { Olive: 7500, Hettich: 7500 },
  plyVerticals: 1500,
  overheadLoft: { 'Frame Loft': 1150, 'Box Loft': 1250 },
  overheadFinish: { Acrylic: 1850, Laminate: 1200, UV: 1400, PU: 1600 },
  tallPantryFinish: { SF: 1450, HGL: 1550, Acrylic: 1850, 'Glass Acrylic': 2150 },
  pantryAccessories: { Pullout: 21000, 'Openable (6+6 basket)': 40000 },
  livingRoomFinish: { SF: 1250, HGL: 1350, Acrylic: 1550, 'Veneer with polish': 1750 },
  livingRoomTallUnitFinish: { SF: 1250, HGL: 1350, Acrylic: 1850, 'Veneer with polish': 1750 },
  backPanelFinish: { HGL: 650, SF: 550, Acrylic: 1175, Veneer: 950 },
  ledgeShelf: 350,
  flutedPanel: 900,
  sittingWithCushion: 1350,
  countertopMaterial: { Granite: 1500, Quartz: 2000 },
  baseCarcase: 1650,
  overheadCabinetFinish: { SF: 1350, HGL: 1475, Acrylic: 2050, 'Glass Acrylic': 2250 },
  bedroomWardrobeFinish: { SF: 1550, HGL: 1650, Acrylic: 2150 },
  bedroomWardrobeSlidingMechanism: 15000,
  bedroomLoftFinish: {
    Frame: { SF: 1150, HGL: 1250, Acrylic: 1850 },
    Box: { SF: 1250, HGL: 1350, Acrylic: 1950 },
  },
  bedroomTallUnitFinish: { ...DEFAULT_TALL_UNIT_FINISH_RATES },
  bedroomHeadBoardRates: { Laminated: 700, Cushioned: 850 },
  bedroomOpenBedPrice: 35000,
  bedroomHydraulicMechanismPrice: 25000,
}

type KitchenType = 'Semi-Modular' | 'Full-Modular'
type ServiceType = 'Kitchen Only' | 'Full Interior'
type Brand = 'Olive' | 'Blum' | 'Hettich'
type HandleType = 'TopEdge' | 'G Profile' | 'J Profile' | 'Regular Handle'
type CountertopMaterial = 'Granite' | 'Quartz'
type LoftType = 'Frame Loft' | 'Box Loft'
type FinishType = 'Acrylic' | 'Laminate' | 'UV' | 'PU'
type TallPantryFinishType = 'SF' | 'HGL' | 'Acrylic' | 'Glass Acrylic'
type AccessoriesType = 'Pullout' | 'Openable (6+6 basket)'
type LivingRoomFinishType = 'SF' | 'HGL' | 'Acrylic' | 'Veneer with polish'
type TallUnitFinishType = 'SF' | 'HGL' | 'Acrylic' | 'Veneer with polish'
type BackPanelFinishType = 'HGL' | 'SF' | 'Acrylic' | 'Veneer'
type OverheadCabinetFinishType = 'SF' | 'HGL' | 'Acrylic' | 'Glass Acrylic'

interface ComponentState {
  height: string
  width: string
  quantity: string
  price: string
  brand?: string
  material?: string
  loftType?: LoftType
  finish?: FinishType
  tallPantryFinish?: TallPantryFinishType
  accessories?: AccessoriesType
  handleType?: HandleType
  handlePrice?: string
  runningFeet?: string
  overheadCabinetFinish?: OverheadCabinetFinishType
}

interface KitchenEstimate {
  kitchenType: KitchenType
  components: {
    component1: ComponentState
    tandemDrawers: ComponentState
    dustbinBTD: ComponentState
    bottlePullout: ComponentState
    wickerBasket: ComponentState
    tallUnit: ComponentState
    pantryUnit: ComponentState
    baseCarcase: ComponentState
    overheadCabinet: ComponentState
    overheadLoft: ComponentState
    profileShutter: ComponentState
    handles: ComponentState
  }
}

interface LivingRoomEstimate {
  components: {
    chestOfDrawers: ComponentState
    baseCabinet: ComponentState
    livingRoomTallUnit: ComponentState
    backPanel: ComponentState
    ledgeShelf: ComponentState
    flutedPanel: ComponentState
    shoeRack: ComponentState
    sittingWithCushion: ComponentState
  }
}

export default function Home() {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    contact: '',
    serviceType: '' as ServiceType
  })

  const [kitchenType, setKitchenType] = useState<KitchenType | ''>('')
  const [estimate, setEstimate] = useState<KitchenEstimate>({
    kitchenType: '' as KitchenType,
    components: {
      component1: { height: '', width: '', quantity: '', price: '' },
      tandemDrawers: { brand: '', quantity: '', price: '' },
      dustbinBTD: { brand: '', quantity: '', price: '' },
      bottlePullout: { brand: '', quantity: '', price: '' },
      wickerBasket: { brand: '', quantity: '', price: '' },
      tallUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' },
      pantryUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '', accessories: '' },
      baseCarcase: { height: '', width: '', quantity: '', price: '1650' },
      overheadCabinet: { height: '', width: '', quantity: '', price: '', overheadCabinetFinish: '' },
      overheadLoft: { height: '', width: '', quantity: '', loftType: '', finish: '', price: '' },
      profileShutter: { quantity: '', price: '' },
      handles: { handleType: '', runningFeet: '', handlePrice: '' }
    }
  })

  const [livingRoomEstimate, setLivingRoomEstimate] = useState<LivingRoomEstimate>({
    components: {
      chestOfDrawers: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
      baseCabinet: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
      livingRoomTallUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as TallUnitFinishType },
      backPanel: { height: '', width: '', quantity: '', price: '', loftType: '' as BackPanelFinishType },
      ledgeShelf: { height: '', width: '', quantity: '', price: '350' },
      flutedPanel: { quantity: '', price: '900' },
      shoeRack: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
      sittingWithCushion: { height: '', width: '', quantity: '', price: '1350' }
    }
  })

  type BedroomCategory = 'master' | 'guest' | 'kids'
  interface BedroomsEstimate {
    master: BedroomData
    guest: BedroomData
    kids: BedroomData
  }

  const [bedroomsEstimate, setBedroomsEstimate] = useState<BedroomsEstimate>({
    master: createEmptyBedroom(),
    guest: createEmptyBedroom(),
    kids: createEmptyBedroom(),
  })

  const [exporting, setExporting] = useState(false)
  const [logoSettings, setLogoSettings] = useState({
    width: 350,
    height: 140,
    position: 'center' as 'left' | 'center' | 'right',
  })

  const [prices, setPrices] = useState<typeof DEFAULT_PRICES>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rateOverrides')
        if (saved) return mergePrices(DEFAULT_PRICES, JSON.parse(saved))
      } catch { /* ignore */ }
    }
    return { ...DEFAULT_PRICES }
  })

  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleSaveRates = (updated: Record<string, any>) => {
    const merged = mergePrices(DEFAULT_PRICES, updated)
    setPrices(merged)
    localStorage.setItem('rateOverrides', JSON.stringify(updated))
  }

  const handleResetRates = () => {
    setPrices({ ...DEFAULT_PRICES })
    localStorage.removeItem('rateOverrides')
  }

  const calculateSqft = (height: string, width: string): number => {
    const h = parseFloat(height) || 0
    const w = parseFloat(width) || 0
    return (h * w) / 92903
  }

  const calculateComponentTotal = (component: keyof KitchenEstimate['components']): number => {
    const comp = estimate.components[component]

    switch (component) {
      case 'component1':
        if (kitchenType === 'Semi-Modular') {
          const qty = parseFloat(comp.quantity) || 0
          return qty * prices.plyVerticals
        } else {
          const sqft = calculateSqft(comp.height, comp.width)
          const basePrice = comp.material && prices.countertopMaterial[comp.material as keyof typeof prices.countertopMaterial] ? prices.countertopMaterial[comp.material as keyof typeof prices.countertopMaterial] : prices.countertopMaterial.Granite
          return sqft * basePrice
        }

      case 'tandemDrawers': {
        const brand = comp.brand as Brand
        if (brand && prices.tandemDrawers[brand]) {
          const qty = parseFloat(comp.quantity) || 0
          return qty * prices.tandemDrawers[brand]
        }
        return 0
      }

      case 'dustbinBTD': {
        const dustbinBrand = comp.brand as Brand
        if (dustbinBrand && prices.dustbinBTD[dustbinBrand]) {
          const qty = parseFloat(comp.quantity) || 0
          return qty * prices.dustbinBTD[dustbinBrand]
        }
        return 0
      }

      case 'bottlePullout': {
        const bottleBrand = comp.brand as Brand
        if (bottleBrand && prices.bottlePullout[bottleBrand]) {
          const qty = parseFloat(comp.quantity) || 0
          return qty * prices.bottlePullout[bottleBrand]
        }
        return 0
      }

      case 'wickerBasket': {
        const wickerBrand = comp.brand as Brand
        if (wickerBrand && prices.wickerBasket[wickerBrand]) {
          const qty = parseFloat(comp.quantity) || 0
          return qty * prices.wickerBasket[wickerBrand]
        }
        return 0
      }

      case 'tallUnit': {
        const tallSqft = calculateSqft(comp.height, comp.width)
        const tallFinish = comp.tallPantryFinish as TallPantryFinishType
        if (tallFinish && prices.tallPantryFinish[tallFinish]) {
          return tallSqft * prices.tallPantryFinish[tallFinish]
        }
        return 0
      }

      case 'pantryUnit': {
        const pantrySqft = calculateSqft(comp.height, comp.width)
        const pantryFinish = comp.tallPantryFinish as TallPantryFinishType
        let pantryTotal = 0
        if (pantryFinish && prices.tallPantryFinish[pantryFinish]) {
          pantryTotal = pantrySqft * prices.tallPantryFinish[pantryFinish]
        }
        const accessories = comp.accessories as AccessoriesType
        if (accessories && prices.pantryAccessories[accessories]) {
          pantryTotal += prices.pantryAccessories[accessories]
        }
        return pantryTotal
      }

      case 'baseCarcase': {
        const baseCarcaseSqft = calculateSqft(comp.height, comp.width)
        return baseCarcaseSqft * prices.baseCarcase
      }

      case 'overheadCabinet': {
        const overheadCabinetSqft = calculateSqft(comp.height, comp.width)
        const ohcFinish = comp.overheadCabinetFinish as OverheadCabinetFinishType
        if (ohcFinish && prices.overheadCabinetFinish[ohcFinish]) {
          return overheadCabinetSqft * prices.overheadCabinetFinish[ohcFinish]
        }
        return 0
      }

      case 'overheadLoft': {
        const loftSqft = calculateSqft(comp.height, comp.width)
        const loftType = comp.loftType as LoftType
        const finish = comp.finish as FinishType
        if (loftType && prices.overheadLoft[loftType]) {
          const basePrice = prices.overheadLoft[loftType]
          const finishPrice = finish ? prices.overheadFinish[finish] : 0
          return loftSqft * (basePrice + finishPrice)
        }
        return 0
      }

      case 'profileShutter': {
        const profileQty = parseFloat(comp.quantity) || 0
        const profilePrice = parseFloat(comp.price) || 0
        return profileQty * profilePrice
      }

      case 'handles': {
        const handleFeet = parseFloat(comp.runningFeet) || 0
        const handlePrice = parseFloat(comp.handlePrice) || 0
        return handleFeet * handlePrice
      }

      default:
        return 0
    }
  }

  const totalEstimatedCost = Object.keys(estimate.components).reduce((total, key) => {
    return total + calculateComponentTotal(key as keyof KitchenEstimate['components'])
  }, 0)

  const updateComponent = (component: keyof KitchenEstimate['components'], field: string, value: string) => {
    setEstimate(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: { ...prev.components[component], [field]: value }
      }
    }))
  }

  const updateLivingRoomComponent = (component: keyof LivingRoomEstimate['components'], field: string, value: string) => {
    setLivingRoomEstimate(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: { ...prev.components[component], [field]: value }
      }
    }))
  }

  const calculateLivingRoomComponentTotal = (component: keyof LivingRoomEstimate['components']): number => {
    const comp = livingRoomEstimate.components[component]

    switch (component) {
      case 'chestOfDrawers':
      case 'baseCabinet':
      case 'shoeRack': {
        const sqft = calculateSqft(comp.height, comp.width)
        const finish = comp.tallPantryFinish as LivingRoomFinishType
        if (finish && prices.livingRoomFinish[finish]) {
          return sqft * prices.livingRoomFinish[finish]
        }
        return 0
      }

      case 'livingRoomTallUnit': {
        const sqft = calculateSqft(comp.height, comp.width)
        const finish = comp.tallPantryFinish as TallUnitFinishType
        if (finish && prices.livingRoomTallUnitFinish[finish]) {
          return sqft * prices.livingRoomTallUnitFinish[finish]
        }
        return 0
      }

      case 'backPanel': {
        const sqft = calculateSqft(comp.height, comp.width)
        const finish = comp.loftType as BackPanelFinishType
        if (finish && prices.backPanelFinish[finish]) {
          return sqft * prices.backPanelFinish[finish]
        }
        return 0
      }

      case 'ledgeShelf': {
        const sqft = calculateSqft(comp.height, comp.width)
        const qty = parseFloat(comp.quantity) || 1
        return sqft * prices.ledgeShelf * qty
      }

      case 'flutedPanel': {
        const qty = parseFloat(comp.quantity) || 0
        return qty * prices.flutedPanel
      }

      case 'sittingWithCushion': {
        const sqft = calculateSqft(comp.height, comp.width)
        return sqft * prices.sittingWithCushion
      }

      default:
        return 0
    }
  }

  const totalLivingRoomCost = Object.keys(livingRoomEstimate.components).reduce((total, key) => {
    return total + calculateLivingRoomComponentTotal(key as keyof LivingRoomEstimate['components'])
  }, 0)

  // ── Bedroom Calculation Functions ──

  const calcBRSqft = (h: string, w: string) => {
    const height = parseFloat(h) || 0
    const width = parseFloat(w) || 0
    return (height * width) / 92903
  }

  const calculateWardrobeTotal = (br: BedroomData): number => {
    const sqft = calcBRSqft(br.wardrobe.height, br.wardrobe.width)
    const rate = prices.bedroomWardrobeFinish[br.wardrobe.finish] || 0
    let total = sqft * rate
    if (br.wardrobe.slidingMechanism) total += prices.bedroomWardrobeSlidingMechanism
    return total
  }

  const calculateBedroomLoftTotal = (br: BedroomData): number => {
    const sqft = calcBRSqft(br.loft.height, br.loft.width)
    const rate = br.loft.loftType && br.loft.finish
      ? (prices.bedroomLoftFinish[br.loft.loftType]?.[br.loft.finish] || 0)
      : 0
    return sqft * rate
  }

  const calculateWindowSeatTotal = (br: BedroomData): number => {
    const sqft = calcBRSqft(br.windowSeat.height, br.windowSeat.width)
    return sqft * (prices.bedroomTallUnitFinish[br.windowSeat.finish as keyof typeof prices.bedroomTallUnitFinish] || 0)
  }

  const calculateStudyTableTotal = (br: BedroomData): number => {
    const baseSqft = calcBRSqft(br.studyTable.base.height, br.studyTable.base.width)
    const ohSqft = calcBRSqft(br.studyTable.overhead.height, br.studyTable.overhead.width)
    return (baseSqft + ohSqft) * (prices.bedroomTallUnitFinish[br.studyTable.finish as keyof typeof prices.bedroomTallUnitFinish] || 0)
  }

  const calculateDresserUnitTotal = (br: BedroomData): number => {
    const baseSqft = calcBRSqft(br.dresserUnit.baseDrawers.height, br.dresserUnit.baseDrawers.width)
    const msSqft = calcBRSqft(br.dresserUnit.mirrorWithStorage.height, br.dresserUnit.mirrorWithStorage.width)
    const mbpSqft = calcBRSqft(br.dresserUnit.mirrorOnBackPanel.height, br.dresserUnit.mirrorOnBackPanel.width)
    return (baseSqft + msSqft + mbpSqft) * (prices.bedroomTallUnitFinish[br.dresserUnit.finish as keyof typeof prices.bedroomTallUnitFinish] || 0)
  }

  const calculateBedTotal = (br: BedroomData): number => {
    if (br.bed.typeOfBed === 'Open Bed with Legs') return prices.bedroomOpenBedPrice
    const sqft = calcBRSqft(br.bed.height, br.bed.width)
    const rate = prices.bedroomTallUnitFinish[br.bed.finish as keyof typeof prices.bedroomTallUnitFinish] || 0
    let total = sqft * rate
    if (br.bed.typeOfBed === 'Hydraulic (Automatic)' || br.bed.typeOfBed === 'Pullout Trolly Bed') {
      total += prices.bedroomHydraulicMechanismPrice
    }
    return total
  }

  const calculateHeadBoardTotal = (br: BedroomData): number => {
    const sqft = calcBRSqft(br.headBoard.length, br.headBoard.width)
    return sqft * (prices.bedroomHeadBoardRates[br.headBoard.headBoardType] || 0)
  }

  const calculateSingleBedroomTotal = (br: BedroomData): number => {
    return calculateWardrobeTotal(br) + calculateBedroomLoftTotal(br) + calculateWindowSeatTotal(br)
      + calculateStudyTableTotal(br) + calculateDresserUnitTotal(br) + calculateBedTotal(br) + calculateHeadBoardTotal(br)
  }

  const totalBedroomCost = calculateSingleBedroomTotal(bedroomsEstimate.master)
    + calculateSingleBedroomTotal(bedroomsEstimate.guest)
    + calculateSingleBedroomTotal(bedroomsEstimate.kids)

  // ── Bedroom Update Handlers ──
  const updateBedroom = (category: BedroomCategory, component: string, field: string, value: string | boolean) => {
    setBedroomsEstimate(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [component]: { ...((prev[category] as Record<string, any>)[component]), [field]: value }
      }
    }))
  }

  const updateBedroomNested = (category: BedroomCategory, component: string, sub: string, field: string, value: string) => {
    setBedroomsEstimate(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [component]: {
          ...((prev[category] as Record<string, any>)[component]),
          [sub]: { ...((prev[category] as Record<string, any>)[component] as Record<string, any>)[sub], [field]: value }
        }
      }
    }))
  }

  const handleBedroomWardrobeTypeChange = (category: BedroomCategory, value: string) => {
    setBedroomsEstimate(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        wardrobe: { ...prev[category].wardrobe, wardrobeType: value, finish: '', slidingMechanism: false }
      }
    }))
  }

  const handleBedroomLoftTypeChange = (category: BedroomCategory, value: string) => {
    setBedroomsEstimate(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        loft: { ...prev[category].loft, loftType: value, finish: '' }
      }
    }))
  }

  const handleBedTypeChange = (category: BedroomCategory, value: string) => {
    setBedroomsEstimate(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        bed: { typeOfBed: value, height: '', width: '', finish: '' }
      }
    }))
  }

  const bedroomPrices = {
    wardrobeFinish: prices.bedroomWardrobeFinish,
    wardrobeSlidingMechanism: prices.bedroomWardrobeSlidingMechanism,
    bedroomLoftFinish: prices.bedroomLoftFinish,
    headBoardRates: prices.bedroomHeadBoardRates,
    openBedPrice: prices.bedroomOpenBedPrice,
    hydraulicMechanismPrice: prices.bedroomHydraulicMechanismPrice,
    tallUnitFinish: prices.bedroomTallUnitFinish,
  }

  const bedroomCategoryLabels: Record<BedroomCategory, string> = { master: 'Master Bedroom', guest: 'Guest Bedroom', kids: 'Kids Bedroom' }

  const getBedroomCardsProps = (category: BedroomCategory) => {
    const bedroom = bedroomsEstimate[category]
    return {
      bedroom,
      category,
      wardrobeTotal: calculateWardrobeTotal(bedroom),
      loftTotal: calculateBedroomLoftTotal(bedroom),
      windowSeatTotal: calculateWindowSeatTotal(bedroom),
      studyTableTotal: calculateStudyTableTotal(bedroom),
      dresserUnitTotal: calculateDresserUnitTotal(bedroom),
      bedTotal: calculateBedTotal(bedroom),
      headBoardTotal: calculateHeadBoardTotal(bedroom),
      prices: bedroomPrices,
      formatINR,
      tallUnitFinishRates: prices.bedroomTallUnitFinish,
      onUpdateWardrobe: (field: string, value: string | boolean) => updateBedroom(category, 'wardrobe', field, value),
      onWardrobeTypeChange: (value: string) => handleBedroomWardrobeTypeChange(category, value),
      onUpdateLoft: (field: string, value: string) => updateBedroom(category, 'loft', field, value),
      onLoftTypeChange: (value: string) => handleBedroomLoftTypeChange(category, value),
      onUpdateWindowSeat: (field: string, value: string) => updateBedroom(category, 'windowSeat', field, value),
      onUpdateStudyTableBase: (field: string, value: string) => updateBedroomNested(category, 'studyTable', 'base', field, value),
      onUpdateStudyTableOverhead: (field: string, value: string) => updateBedroomNested(category, 'studyTable', 'overhead', field, value),
      onStudyTableFinishChange: (value: string) => updateBedroom(category, 'studyTable', 'finish', value),
      onUpdateDresserBaseDrawers: (field: string, value: string) => updateBedroomNested(category, 'dresserUnit', 'baseDrawers', field, value),
      onUpdateDresserMirrorStorage: (field: string, value: string) => updateBedroomNested(category, 'dresserUnit', 'mirrorWithStorage', field, value),
      onUpdateDresserMirrorBackPanel: (field: string, value: string) => updateBedroomNested(category, 'dresserUnit', 'mirrorOnBackPanel', field, value),
      onDresserUnitFinishChange: (value: string) => updateBedroom(category, 'dresserUnit', 'finish', value),
      onBedTypeChange: (value: string) => handleBedTypeChange(category, value),
      onUpdateBed: (field: string, value: string) => updateBedroom(category, 'bed', field, value),
      onUpdateHeadBoard: (field: string, value: string) => updateBedroom(category, 'headBoard', field, value),
    }
  }

  const resetBedrooms = () => {
    setBedroomsEstimate({
      master: createEmptyBedroom(),
      guest: createEmptyBedroom(),
      kids: createEmptyBedroom(),
    })
  }

  const grandTotal = (clientInfo.serviceType === 'Full Interior' ? totalLivingRoomCost + totalBedroomCost : totalBedroomCost) + totalEstimatedCost

  const handleKitchenTypeChange = (value: KitchenType) => {
    setKitchenType(value)
    setEstimate(prev => ({
      ...prev,
      kitchenType: value,
      components: {
        ...prev.components,
        component1: { height: '', width: '', quantity: '', price: '', material: '' }
      }
    }))
  }

  const resetKitchenComponents = () => {
    setEstimate(prev => ({
      ...prev,
      components: {
        component1: { height: '', width: '', quantity: '', price: '', material: '' },
        tandemDrawers: { brand: '', quantity: '', price: '' },
        dustbinBTD: { brand: '', quantity: '', price: '' },
        bottlePullout: { brand: '', quantity: '', price: '' },
        wickerBasket: { brand: '', quantity: '', price: '' },
        tallUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' },
        pantryUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '', accessories: '' },
        baseCarcase: { height: '', width: '', quantity: '', price: '1650' },
        overheadCabinet: { height: '', width: '', quantity: '', price: '', overheadCabinetFinish: '' },
        overheadLoft: { height: '', width: '', quantity: '', loftType: '', finish: '', price: '' },
        profileShutter: { quantity: '', price: '' },
        handles: { handleType: '', runningFeet: '', handlePrice: '' }
      }
    }))
  }

  const resetLivingRoomComponents = () => {
    setLivingRoomEstimate({
      components: {
        chestOfDrawers: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
        baseCabinet: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
        livingRoomTallUnit: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as TallUnitFinishType },
        backPanel: { height: '', width: '', quantity: '', price: '', loftType: '' as BackPanelFinishType },
        ledgeShelf: { height: '', width: '', quantity: '', price: '350' },
        flutedPanel: { quantity: '', price: '900' },
        shoeRack: { height: '', width: '', quantity: '', price: '', tallPantryFinish: '' as LivingRoomFinishType },
        sittingWithCushion: { height: '', width: '', quantity: '', price: '1350' }
      }
    })
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/estimates/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientInfo,
          kitchenType,
          estimate,
          livingRoomEstimate,
          bedroomsEstimate,
          totalCost: grandTotal,
          kitchenCost: totalEstimatedCost,
          livingRoomCost: totalLivingRoomCost,
          bedroomCost: totalBedroomCost,
          components: estimate.components,
          logoSettings,
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kitchen_estimate_${clientInfo.name || 'client'}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export Excel')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/estimates/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientInfo,
          kitchenType,
          estimate,
          livingRoomEstimate,
          bedroomsEstimate,
          totalCost: grandTotal,
          kitchenCost: totalEstimatedCost,
          livingRoomCost: totalLivingRoomCost,
          bedroomCost: totalBedroomCost,
          components: estimate.components
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kitchen_estimate_${clientInfo.name || 'client'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  const getComponentLabel = (component: keyof KitchenEstimate['components']): string => {
    const labels: Record<string, string> = {
      component1: kitchenType === 'Semi-Modular' ? 'Ply Verticals' : 'Structure / Countertop',
      tandemDrawers: 'Tandem Drawers',
      dustbinBTD: 'Dustbin + BTD',
      bottlePullout: 'Bottle Pullout',
      wickerBasket: 'Wicker Basket',
      tallUnit: 'Tall Unit',
      pantryUnit: 'Pantry Unit',
      baseCarcase: 'Base Carcase',
      overheadCabinet: 'Overhead Cabinet',
      overheadLoft: 'Overhead Loft',
      profileShutter: 'Profile Shutter with Glass',
      handles: 'Handles'
    }
    return labels[component] || component
  }

  const getLivingRoomComponentLabel = (component: keyof LivingRoomEstimate['components']): string => {
    const labels: Record<string, string> = {
      chestOfDrawers: 'Chest of Drawers',
      baseCabinet: 'Base Cabinet with shutters',
      livingRoomTallUnit: 'Tall Unit',
      backPanel: 'Back Panel',
      ledgeShelf: 'Ledge/Shelf',
      flutedPanel: 'Fluted Panel',
      shoeRack: 'Shoe Rack',
      sittingWithCushion: 'Sitting with Cushion'
    }
    return labels[component] || component
  }

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-600 text-white shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Interior Cost Estimator</h1>
                <p className="text-emerald-100 text-sm">Calculate your kitchen & living room costs</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-5 h-5" />
              </Button>
            {grandTotal > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
                <IndianRupee className="w-4 h-4" />
                <span className="text-lg font-bold">{formatINR(grandTotal)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Client Information */}
        <Card>
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800">Client Information</CardTitle>
            <CardDescription>Enter client details for the estimate</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  placeholder="Full name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Street / Area"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  type="tel"
                  placeholder="Mobile number"
                  value={clientInfo.contact}
                  onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select
                  value={clientInfo.serviceType}
                  onValueChange={(value: ServiceType) => setClientInfo({ ...clientInfo, serviceType: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kitchen Only">Kitchen Only</SelectItem>
                    <SelectItem value="Full Interior">Full Interior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Type Selection */}
        {clientInfo.serviceType && (
          <Card>
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Kitchen Configuration</CardTitle>
              <CardDescription>Select the kitchen modular type</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-sm space-y-2">
                <Label>Kitchen Type *</Label>
                <Select value={kitchenType} onValueChange={handleKitchenTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semi-Modular">Semi-Modular</SelectItem>
                    <SelectItem value="Full-Modular">Full-Modular</SelectItem>
                  </SelectContent>
                </Select>
                {kitchenType && (
                  <p className="text-sm text-muted-foreground">
                    Configured for <span className="font-semibold text-foreground">{kitchenType}</span> kitchen
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kitchen Components */}
        {(clientInfo.serviceType === 'Kitchen Only' || clientInfo.serviceType === 'Full Interior') && kitchenType && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Kitchen Components</h2>
                <span className="text-sm text-muted-foreground">Define dimensions, finishes, and quantities</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={resetKitchenComponents}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Component 1: Structure / Countertop or Ply Verticals */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-800 text-base">
                      {kitchenType === 'Semi-Modular' ? 'Ply Verticals' : 'Structure / Countertop'}
                    </CardTitle>
                    <span className="text-sm font-semibold text-amber-700">
                      ₹{calculateComponentTotal('component1').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {kitchenType === 'Semi-Modular' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Quantity</Label>
                        <Input type="number" placeholder="0" value={estimate.components.component1.quantity} onChange={(e) => updateComponent('component1', 'quantity', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Rate / Unit</Label>
                        <Input value="₹1,500" disabled className="bg-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Material</Label>
                        <Select value={estimate.components.component1.material} onValueChange={(value) => updateComponent('component1', 'material', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Granite">Granite</SelectItem>
                            <SelectItem value="Quartz">Quartz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Height (mm)</Label>
                        <Input type="number" placeholder="0" value={estimate.components.component1.height} onChange={(e) => updateComponent('component1', 'height', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Width (mm)</Label>
                        <Input type="number" placeholder="0" value={estimate.components.component1.width} onChange={(e) => updateComponent('component1', 'width', e.target.value)} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tandem Drawers */}
              <Card className="bg-sky-50 border-sky-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sky-800 text-base">Tandem Drawers</CardTitle>
                    <span className="text-sm font-semibold text-sky-700">
                      ₹{calculateComponentTotal('tandemDrawers').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Brand</Label>
                      <Select value={estimate.components.tandemDrawers.brand} onValueChange={(value) => updateComponent('tandemDrawers', 'brand', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Olive">Olive (₹8,000)</SelectItem>
                          <SelectItem value="Blum">Blum (₹12,000)</SelectItem>
                          <SelectItem value="Hettich">Hettich (₹12,000)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={estimate.components.tandemDrawers.quantity} onChange={(e) => updateComponent('tandemDrawers', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / Unit</Label>
                      <Input value={estimate.components.tandemDrawers.brand ? formatINR(prices.tandemDrawers[estimate.components.tandemDrawers.brand as Brand]) : ''} disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dustbin + BTD */}
              <Card className="bg-rose-50 border-rose-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-rose-800 text-base">Dustbin + BTD</CardTitle>
                    <span className="text-sm font-semibold text-rose-700">
                      ₹{calculateComponentTotal('dustbinBTD').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Brand</Label>
                      <Select value={estimate.components.dustbinBTD.brand} onValueChange={(value) => updateComponent('dustbinBTD', 'brand', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Olive">Olive (₹7,500)</SelectItem>
                          <SelectItem value="Blum">Blum (₹7,500)</SelectItem>
                          <SelectItem value="Hettich">Hettich (₹7,500)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={estimate.components.dustbinBTD.quantity} onChange={(e) => updateComponent('dustbinBTD', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / Unit</Label>
                      <Input value={estimate.components.dustbinBTD.brand ? formatINR(prices.dustbinBTD[estimate.components.dustbinBTD.brand as Brand]) : ''} disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottle Pullout */}
              <Card className="bg-violet-50 border-violet-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-violet-800 text-base">Bottle Pullout</CardTitle>
                    <span className="text-sm font-semibold text-violet-700">
                      ₹{calculateComponentTotal('bottlePullout').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Brand</Label>
                      <Select value={estimate.components.bottlePullout.brand} onValueChange={(value) => updateComponent('bottlePullout', 'brand', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Olive">Olive (₹8,000)</SelectItem>
                          <SelectItem value="Blum">Blum (₹8,000)</SelectItem>
                          <SelectItem value="Hettich">Hettich (₹8,000)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={estimate.components.bottlePullout.quantity} onChange={(e) => updateComponent('bottlePullout', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / Unit</Label>
                      <Input value={estimate.components.bottlePullout.brand ? formatINR(prices.bottlePullout[estimate.components.bottlePullout.brand as Brand]) : ''} disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wicker Basket */}
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-orange-800 text-base">Wicker Basket</CardTitle>
                    <span className="text-sm font-semibold text-orange-700">
                      ₹{calculateComponentTotal('wickerBasket').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Brand</Label>
                      <Select value={estimate.components.wickerBasket.brand} onValueChange={(value) => updateComponent('wickerBasket', 'brand', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Olive">Olive (₹7,500)</SelectItem>
                          <SelectItem value="Hettich">Hettich (₹7,500)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={estimate.components.wickerBasket.quantity} onChange={(e) => updateComponent('wickerBasket', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / Unit</Label>
                      <Input value={estimate.components.wickerBasket.brand ? formatINR(prices.wickerBasket[estimate.components.wickerBasket.brand as Brand]) : ''} disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tall Unit */}
              <Card className="bg-teal-50 border-teal-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-teal-800 text-base">Tall Unit</CardTitle>
                    <span className="text-sm font-semibold text-teal-700">
                      ₹{calculateComponentTotal('tallUnit').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.tallUnit.height} onChange={(e) => updateComponent('tallUnit', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.tallUnit.width} onChange={(e) => updateComponent('tallUnit', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Finish</Label>
                      <Select value={estimate.components.tallUnit.tallPantryFinish} onValueChange={(value) => updateComponent('tallUnit', 'tallPantryFinish', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SF">SF (₹1,450/sqft)</SelectItem>
                          <SelectItem value="HGL">HGL (₹1,550/sqft)</SelectItem>
                          <SelectItem value="Acrylic">Acrylic (₹1,850/sqft)</SelectItem>
                          <SelectItem value="Glass Acrylic">Glass Acrylic (₹2,150/sqft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={estimate.components.tallUnit.quantity} onChange={(e) => updateComponent('tallUnit', 'quantity', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pantry Unit */}
              <Card className="bg-cyan-50 border-cyan-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-800 text-base">Pantry Unit</CardTitle>
                    <span className="text-sm font-semibold text-cyan-700">
                      ₹{calculateComponentTotal('pantryUnit').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.pantryUnit.height} onChange={(e) => updateComponent('pantryUnit', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.pantryUnit.width} onChange={(e) => updateComponent('pantryUnit', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Finish</Label>
                      <Select value={estimate.components.pantryUnit.tallPantryFinish} onValueChange={(value) => updateComponent('pantryUnit', 'tallPantryFinish', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SF">SF (₹1,450/sqft)</SelectItem>
                          <SelectItem value="HGL">HGL (₹1,550/sqft)</SelectItem>
                          <SelectItem value="Acrylic">Acrylic (₹1,850/sqft)</SelectItem>
                          <SelectItem value="Glass Acrylic">Glass Acrylic (₹2,150/sqft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Accessories</Label>
                      <Select value={estimate.components.pantryUnit.accessories} onValueChange={(value) => updateComponent('pantryUnit', 'accessories', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pullout">Pullout (₹21,000)</SelectItem>
                          <SelectItem value="Openable (6+6 basket)">Openable 6+6 (₹40,000)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Base Carcase */}
              <Card className="bg-stone-50 border-stone-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-stone-800 text-base">Base Carcase</CardTitle>
                    <span className="text-sm font-semibold text-stone-700">
                      ₹{calculateComponentTotal('baseCarcase').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.baseCarcase.height} onChange={(e) => updateComponent('baseCarcase', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.baseCarcase.width} onChange={(e) => updateComponent('baseCarcase', 'width', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / sqft</Label>
                      <Input value="₹1,650" disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overhead Cabinet */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-800 text-base">Overhead Cabinet</CardTitle>
                    <span className="text-sm font-semibold text-green-700">
                      ₹{calculateComponentTotal('overheadCabinet').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.overheadCabinet.height} onChange={(e) => updateComponent('overheadCabinet', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.overheadCabinet.width} onChange={(e) => updateComponent('overheadCabinet', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Finish</Label>
                      <Select value={estimate.components.overheadCabinet.overheadCabinetFinish} onValueChange={(value) => updateComponent('overheadCabinet', 'overheadCabinetFinish', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SF">SF (₹1,350/sqft)</SelectItem>
                          <SelectItem value="HGL">HGL (₹1,475/sqft)</SelectItem>
                          <SelectItem value="Acrylic">Acrylic (₹2,050/sqft)</SelectItem>
                          <SelectItem value="Glass Acrylic">Glass Acrylic (₹2,250/sqft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / sqft</Label>
                      <Input
                        value={estimate.components.overheadCabinet.overheadCabinetFinish ? formatINR(prices.overheadCabinetFinish[estimate.components.overheadCabinet.overheadCabinetFinish as OverheadCabinetFinishType]) : ''}
                        disabled
                        className="bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overhead Loft */}
              <Card className="bg-indigo-50 border-indigo-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-indigo-800 text-base">Overhead Loft</CardTitle>
                    <span className="text-sm font-semibold text-indigo-700">
                      ₹{calculateComponentTotal('overheadLoft').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Loft Type</Label>
                      <Select value={estimate.components.overheadLoft.loftType} onValueChange={(value) => updateComponent('overheadLoft', 'loftType', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Frame Loft">Frame Loft (₹1,150)</SelectItem>
                          <SelectItem value="Box Loft">Box Loft (₹1,250)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Finish</Label>
                      <Select value={estimate.components.overheadLoft.finish} onValueChange={(value) => updateComponent('overheadLoft', 'finish', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Acrylic">Acrylic (₹1,850)</SelectItem>
                          <SelectItem value="Laminate">Laminate (₹1,200)</SelectItem>
                          <SelectItem value="UV">UV (₹1,400)</SelectItem>
                          <SelectItem value="PU">PU (₹1,600)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.overheadLoft.height} onChange={(e) => updateComponent('overheadLoft', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.overheadLoft.width} onChange={(e) => updateComponent('overheadLoft', 'width', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Shutter with Glass */}
              <Card className="bg-fuchsia-50 border-fuchsia-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-fuchsia-800 text-base">Profile Shutter with Glass</CardTitle>
                    <span className="text-sm font-semibold text-fuchsia-700">
                      ₹{calculateComponentTotal('profileShutter').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity (nos)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.profileShutter.quantity} onChange={(e) => updateComponent('profileShutter', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Price / sqft (₹)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.profileShutter.price} onChange={(e) => updateComponent('profileShutter', 'price', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Handles */}
              <Card className="bg-lime-50 border-lime-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lime-800 text-base">Handles</CardTitle>
                    <span className="text-sm font-semibold text-lime-700">
                      ₹{calculateComponentTotal('handles').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Handle Type</Label>
                      <Select value={estimate.components.handles.handleType} onValueChange={(value) => updateComponent('handles', 'handleType', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TopEdge">TopEdge</SelectItem>
                          <SelectItem value="G Profile">G Profile</SelectItem>
                          <SelectItem value="J Profile">J Profile</SelectItem>
                          <SelectItem value="Regular Handle">Regular Handle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Running Ft</Label>
                      <Input type="number" placeholder="0" value={estimate.components.handles.runningFeet} onChange={(e) => updateComponent('handles', 'runningFeet', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Price / Rft (₹)</Label>
                      <Input type="number" placeholder="0" value={estimate.components.handles.handlePrice} onChange={(e) => updateComponent('handles', 'handlePrice', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kitchen Summary */}
            <Card>
              <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="text-emerald-800">Kitchen Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Component</TableHead>
                      <TableHead className="text-right font-semibold">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(estimate.components).map((key) => {
                      const componentKey = key as keyof KitchenEstimate['components']
                      const total = calculateComponentTotal(componentKey)
                      if (total > 0) {
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{getComponentLabel(componentKey)}</TableCell>
                            <TableCell className="text-right font-semibold">{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                          </TableRow>
                        )
                      }
                      return null
                    })}
                    <TableRow className="bg-emerald-50 hover:bg-emerald-50 font-bold">
                      <TableCell className="font-bold text-emerald-900">Kitchen Total</TableCell>
                      <TableCell className="text-right font-bold text-emerald-900">{totalEstimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Living Room Components */}
        {clientInfo.serviceType === 'Full Interior' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Living Room — TV Unit</h2>
                <span className="text-sm text-muted-foreground">Define living room module specifications</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={resetLivingRoomComponents}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Chest of Drawers */}
              <Card className="bg-pink-50 border-pink-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-pink-800 text-base">Chest of Drawers</CardTitle>
                    <span className="text-sm font-semibold text-pink-700">
                      ₹{calculateLivingRoomComponentTotal('chestOfDrawers').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.chestOfDrawers.height} onChange={(e) => updateLivingRoomComponent('chestOfDrawers', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.chestOfDrawers.width} onChange={(e) => updateLivingRoomComponent('chestOfDrawers', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Finish</Label>
                    <Select value={livingRoomEstimate.components.chestOfDrawers.tallPantryFinish} onValueChange={(value) => updateLivingRoomComponent('chestOfDrawers', 'tallPantryFinish', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SF">SF (₹1,250/sqft)</SelectItem>
                        <SelectItem value="HGL">HGL (₹1,350/sqft)</SelectItem>
                        <SelectItem value="Acrylic">Acrylic (₹1,550/sqft)</SelectItem>
                        <SelectItem value="Veneer with polish">Veneer (₹1,750/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Base Cabinet with shutters */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-800 text-base">Base Cabinet with Shutters</CardTitle>
                    <span className="text-sm font-semibold text-purple-700">
                      ₹{calculateLivingRoomComponentTotal('baseCabinet').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.baseCabinet.height} onChange={(e) => updateLivingRoomComponent('baseCabinet', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.baseCabinet.width} onChange={(e) => updateLivingRoomComponent('baseCabinet', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Finish</Label>
                    <Select value={livingRoomEstimate.components.baseCabinet.tallPantryFinish} onValueChange={(value) => updateLivingRoomComponent('baseCabinet', 'tallPantryFinish', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SF">SF (₹1,250/sqft)</SelectItem>
                        <SelectItem value="HGL">HGL (₹1,350/sqft)</SelectItem>
                        <SelectItem value="Acrylic">Acrylic (₹1,550/sqft)</SelectItem>
                        <SelectItem value="Veneer with polish">Veneer (₹1,750/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Living Room Tall Unit */}
              <Card className="bg-sky-50 border-sky-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sky-800 text-base">Tall Unit</CardTitle>
                    <span className="text-sm font-semibold text-sky-700">
                      ₹{calculateLivingRoomComponentTotal('livingRoomTallUnit').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.livingRoomTallUnit.height} onChange={(e) => updateLivingRoomComponent('livingRoomTallUnit', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.livingRoomTallUnit.width} onChange={(e) => updateLivingRoomComponent('livingRoomTallUnit', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Finish</Label>
                    <Select value={livingRoomEstimate.components.livingRoomTallUnit.tallPantryFinish} onValueChange={(value) => updateLivingRoomComponent('livingRoomTallUnit', 'tallPantryFinish', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SF">SF (₹1,250/sqft)</SelectItem>
                        <SelectItem value="HGL">HGL (₹1,350/sqft)</SelectItem>
                        <SelectItem value="Acrylic">Acrylic (₹1,850/sqft)</SelectItem>
                        <SelectItem value="Veneer with polish">Veneer (₹1,750/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Back Panel */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-800 text-base">Back Panel</CardTitle>
                    <span className="text-sm font-semibold text-amber-700">
                      ₹{calculateLivingRoomComponentTotal('backPanel').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.backPanel.height} onChange={(e) => updateLivingRoomComponent('backPanel', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.backPanel.width} onChange={(e) => updateLivingRoomComponent('backPanel', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Finish</Label>
                    <Select value={livingRoomEstimate.components.backPanel.loftType} onValueChange={(value) => updateLivingRoomComponent('backPanel', 'loftType', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HGL">HGL (₹650/sqft)</SelectItem>
                        <SelectItem value="SF">SF (₹550/sqft)</SelectItem>
                        <SelectItem value="Acrylic">Acrylic (₹1,175/sqft)</SelectItem>
                        <SelectItem value="Veneer">Veneer (₹950/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Ledge/Shelf */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-800 text-base">Ledge / Shelf</CardTitle>
                    <span className="text-sm font-semibold text-green-700">
                      ₹{calculateLivingRoomComponentTotal('ledgeShelf').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.ledgeShelf.height} onChange={(e) => updateLivingRoomComponent('ledgeShelf', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.ledgeShelf.width} onChange={(e) => updateLivingRoomComponent('ledgeShelf', 'width', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.ledgeShelf.quantity} onChange={(e) => updateLivingRoomComponent('ledgeShelf', 'quantity', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fluted Panel */}
              <Card className="bg-teal-50 border-teal-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-teal-800 text-base">Fluted Panel</CardTitle>
                    <span className="text-sm font-semibold text-teal-700">
                      ₹{calculateLivingRoomComponentTotal('flutedPanel').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity (pieces)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.flutedPanel.quantity} onChange={(e) => updateLivingRoomComponent('flutedPanel', 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / Piece</Label>
                      <Input value="₹900" disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shoe Rack */}
              <Card className="bg-rose-50 border-rose-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-rose-800 text-base">Shoe Rack</CardTitle>
                    <span className="text-sm font-semibold text-rose-700">
                      ₹{calculateLivingRoomComponentTotal('shoeRack').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.shoeRack.height} onChange={(e) => updateLivingRoomComponent('shoeRack', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.shoeRack.width} onChange={(e) => updateLivingRoomComponent('shoeRack', 'width', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Finish</Label>
                    <Select value={livingRoomEstimate.components.shoeRack.tallPantryFinish} onValueChange={(value) => updateLivingRoomComponent('shoeRack', 'tallPantryFinish', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SF">SF (₹1,250/sqft)</SelectItem>
                        <SelectItem value="HGL">HGL (₹1,350/sqft)</SelectItem>
                        <SelectItem value="Acrylic">Acrylic (₹1,550/sqft)</SelectItem>
                        <SelectItem value="Veneer with polish">Veneer (₹1,750/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Sitting with Cushion */}
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-orange-800 text-base">Sitting with Cushion</CardTitle>
                    <span className="text-sm font-semibold text-orange-700">
                      ₹{calculateLivingRoomComponentTotal('sittingWithCushion').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.sittingWithCushion.height} onChange={(e) => updateLivingRoomComponent('sittingWithCushion', 'height', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (mm)</Label>
                      <Input type="number" placeholder="0" value={livingRoomEstimate.components.sittingWithCushion.width} onChange={(e) => updateLivingRoomComponent('sittingWithCushion', 'width', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rate / sqft</Label>
                      <Input value="₹1,350" disabled className="bg-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Living Room Summary */}
            <Card>
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle className="text-purple-800">Living Room Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Component</TableHead>
                      <TableHead className="text-right font-semibold">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(livingRoomEstimate.components).map((key) => {
                      const componentKey = key as keyof LivingRoomEstimate['components']
                      const total = calculateLivingRoomComponentTotal(componentKey)
                      if (total > 0) {
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{getLivingRoomComponentLabel(componentKey)}</TableCell>
                            <TableCell className="text-right font-semibold">{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                          </TableRow>
                        )
                      }
                      return null
                    })}
                    <TableRow className="bg-purple-50 hover:bg-purple-50 font-bold">
                      <TableCell className="font-bold text-purple-900">Living Room Total</TableCell>
                      <TableCell className="text-right font-bold text-purple-900">{totalLivingRoomCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bedroom Section */}
        {clientInfo.serviceType === 'Full Interior' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-semibold text-foreground">Bedroom Components</h2>
                <span className="text-sm text-muted-foreground">Configure each bedroom type independently</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={resetBedrooms}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Bedrooms
              </Button>
            </div>

            <Tabs defaultValue="master" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {(Object.keys(bedroomCategoryLabels) as BedroomCategory[]).map((cat) => {
                  const catTotal = calculateSingleBedroomTotal(bedroomsEstimate[cat])
                  return (
                    <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                      {bedroomCategoryLabels[cat]}
                      {catTotal > 0 && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {formatINR(catTotal)}
                        </span>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {(Object.keys(bedroomCategoryLabels) as BedroomCategory[]).map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-4">
                  <BedroomTypeCards {...getBedroomCardsProps(cat)} />
                </TabsContent>
              ))}
            </Tabs>

            {/* Bedroom Cost Breakdown */}
            <Card>
              <CardHeader className="bg-pink-50 border-b border-pink-100">
                <CardTitle className="text-pink-800">Bedroom Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Bedroom Type</TableHead>
                      <TableHead className="font-semibold">Component</TableHead>
                      <TableHead className="text-right font-semibold">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.keys(bedroomCategoryLabels) as BedroomCategory[]).map((cat) => {
                      const br = bedroomsEstimate[cat]
                      const catTotal = calculateSingleBedroomTotal(br)
                      if (catTotal <= 0) return null
                      const components: { name: string; total: number }[] = [
                        { name: 'Wardrobe', total: calculateWardrobeTotal(br) },
                        { name: 'Loft', total: calculateBedroomLoftTotal(br) },
                        { name: 'Window Seat with Storage', total: calculateWindowSeatTotal(br) },
                        { name: 'Study Table', total: calculateStudyTableTotal(br) },
                        { name: 'Dresser Unit', total: calculateDresserUnitTotal(br) },
                        { name: 'Bed', total: calculateBedTotal(br) },
                        { name: 'Head Board', total: calculateHeadBoardTotal(br) },
                      ].filter(c => c.total > 0)
                      return (
                        <Fragment key={cat}>
                          <TableRow className="bg-pink-50/50 hover:bg-pink-50/50 font-semibold">
                            <TableCell colSpan={2} className="text-pink-900">{bedroomCategoryLabels[cat]}</TableCell>
                            <TableCell className="text-right font-semibold text-pink-900">{catTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                          </TableRow>
                          {components.map(c => (
                            <TableRow key={c.name}>
                              <TableCell />
                              <TableCell className="text-muted-foreground">{c.name}</TableCell>
                              <TableCell className="text-right">{c.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            </TableRow>
                          ))}
                        </Fragment>
                      )
                    })}
                    {totalBedroomCost > 0 && (
                      <TableRow className="bg-pink-100 hover:bg-pink-100 font-bold">
                        <TableCell colSpan={2} className="font-bold text-pink-900">Bedroom Total</TableCell>
                        <TableCell className="text-right font-bold text-pink-900">{totalBedroomCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estimate Summary & Export */}
        {((clientInfo.serviceType === 'Kitchen Only' && kitchenType) || (clientInfo.serviceType === 'Full Interior' && (kitchenType || totalLivingRoomCost > 0 || totalBedroomCost > 0))) && grandTotal > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-foreground">Estimate Summary & Export</h2>
            </div>

            {/* Logo Settings for Export */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Export Logo Settings
                      </CardTitle>
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </div>
                    <CardDescription>Adjust logo size and position in exported Excel</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-5">
                    {/* Width */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Logo Width</Label>
                        <span className="text-sm font-medium text-muted-foreground">{logoSettings.width}px</span>
                      </div>
                      <Slider
                        value={[logoSettings.width]}
                        min={100}
                        max={600}
                        step={10}
                        onValueChange={([v]) => setLogoSettings(s => ({ ...s, width: v }))}
                      />
                    </div>
                    {/* Height */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Logo Height</Label>
                        <span className="text-sm font-medium text-muted-foreground">{logoSettings.height}px</span>
                      </div>
                      <Slider
                        value={[logoSettings.height]}
                        min={40}
                        max={300}
                        step={10}
                        onValueChange={([v]) => setLogoSettings(s => ({ ...s, height: v }))}
                      />
                    </div>
                    {/* Position */}
                    <div className="space-y-2">
                      <Label className="text-sm">Logo Position</Label>
                      <Select
                        value={logoSettings.position}
                        onValueChange={(v) => setLogoSettings(s => ({ ...s, position: v as 'left' | 'center' | 'right' }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Grand Total Banner */}
            <Card className="bg-emerald-600 border-emerald-600">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-emerald-100 text-sm">Total Estimated Cost</p>
                    <p className="text-3xl font-bold text-white">{formatINR(grandTotal)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleExportPDF} disabled={exporting} variant="secondary" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button onClick={handleExportExcel} disabled={exporting} className="gap-2 bg-amber-500 hover:bg-amber-400 text-black">
                      <Download className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consolidated Table */}
            <Card>
              <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="text-emerald-800">Consolidated Estimate</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Section</TableHead>
                      <TableHead className="text-right font-semibold">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totalEstimatedCost > 0 && (
                      <TableRow>
                        <TableCell className="font-medium">Kitchen — {kitchenType}</TableCell>
                        <TableCell className="text-right font-semibold">{totalEstimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      </TableRow>
                    )}
                    {clientInfo.serviceType === 'Full Interior' && totalLivingRoomCost > 0 && (
                      <TableRow>
                        <TableCell className="font-medium">Living Room — TV Unit</TableCell>
                        <TableCell className="text-right font-semibold">{totalLivingRoomCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      </TableRow>
                    )}
                    {clientInfo.serviceType === 'Full Interior' && totalBedroomCost > 0 && (
                      <Fragment>
                        {(Object.keys(bedroomCategoryLabels) as BedroomCategory[]).map((cat) => {
                          const catTotal = calculateSingleBedroomTotal(bedroomsEstimate[cat])
                          if (catTotal <= 0) return null
                          return (
                            <TableRow key={cat}>
                              <TableCell className="font-medium">{bedroomCategoryLabels[cat]}</TableCell>
                              <TableCell className="text-right font-semibold">{catTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            </TableRow>
                          )
                        })}
                      </Fragment>
                    )}
                    <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                      <TableCell className="font-bold text-emerald-900">Grand Total</TableCell>
                      <TableCell className="text-right font-bold text-emerald-900 text-lg">{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>Interior Cost Estimator &copy; {new Date().getFullYear()}</p>
          <p>All prices in INR (₹)</p>
        </div>
      </footer>

      <RateSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultPrices={DEFAULT_PRICES}
        currentPrices={prices}
        onSave={handleSaveRates}
        onReset={handleResetRates}
      />
    </div>
  )
}