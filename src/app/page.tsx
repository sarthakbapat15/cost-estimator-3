'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Calculator } from 'lucide-react'

type KitchenType = 'Semi-Modular' | 'Full-Modular'
type ServiceType = 'Kitchen Only' | 'Full Home'
type Brand = 'Olive' | 'Blum' | 'Hettich'
type HandleType = 'TopH' | 'G Profile' | 'J Profile' | 'Regular Handle'
type CountertopMaterial = 'Granite' | 'Quartz'
type LoftType = 'Frame Loft' | 'Box Loft'
type FinishType = 'Acrylic' | 'Laminate' | 'UV' | 'PU'

interface ComponentState {
  height: string
  width: string
  quantity: string
  price: string
  brand?: string
  material?: string
  loftType?: LoftType
  finish?: FinishType
  handleType?: HandleType
  handlePrice?: string
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
    overheadLoft: ComponentState
    profileShutter: ComponentState
    handles: ComponentState
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
      dustbinBTD: { brand: '', height: '', width: '', quantity: '', price: '' },
      bottlePullout: { brand: '', height: '', width: '', quantity: '', price: '' },
      wickerBasket: { brand: '', height: '', width: '', quantity: '', price: '' },
      tallUnit: { height: '', width: '', quantity: '', price: '' },
      pantryUnit: { height: '', width: '', quantity: '', price: '' },
      overheadLoft: { height: '', width: '', quantity: '', loftType: '', finish: '', price: '' },
      profileShutter: { quantity: '', price: '350' },
      handles: { handleType: '', quantity: '', handlePrice: '' }
    }
  })

  const [exporting, setExporting] = useState(false)

  // Price constants
  const PRICES = {
    tandemDrawers: { Olive: 8000, Blum: 12000, Hettich: 12000 },
    dustbinBTD: { Olive: 7500, Blum: 7500, Hettich: 7500 },
    bottlePullout: { Olive: 8000, Blum: 8000, Hettich: 8000 },
    wickerBasket: { Olive: 7500, Hettich: 7500 },
    plyVerticals: 1500,
    overheadLoft: { 'Frame Loft': 1150, 'Box Loft': 1250 },
    overheadFinish: { Acrylic: 1850, Laminate: 1200, UV: 1400, PU: 1600 },
    profileShutter: 350
  }

  // Calculate sqft from height and width in mm
  const calculateSqft = (height: string, width: string): number => {
    const h = parseFloat(height) || 0
    const w = parseFloat(width) || 0
    return (h * w) / 92903
  }

  // Calculate individual component totals
  const calculateComponentTotal = (component: keyof KitchenEstimate['components']): number => {
    const comp = estimate.components[component]

    switch (component) {
      case 'component1':
        if (kitchenType === 'Semi-Modular') {
          const qty = parseFloat(comp.quantity) || 0
          return qty * PRICES.plyVerticals
        } else {
          const sqft = calculateSqft(comp.height, comp.width)
          const basePrice = comp.material === 'Quartz' ? 2000 : 1500
          return sqft * basePrice
        }

      case 'tandemDrawers':
        const brand = comp.brand as Brand
        if (brand && PRICES.tandemDrawers[brand]) {
          const qty = parseFloat(comp.quantity) || 0
          return qty * PRICES.tandemDrawers[brand]
        }
        return 0

      case 'dustbinBTD':
        const dustbinBrand = comp.brand as Brand
        if (dustbinBrand && PRICES.dustbinBTD[dustbinBrand]) {
          const sqft = calculateSqft(comp.height, comp.width)
          return sqft * PRICES.dustbinBTD[dustbinBrand]
        }
        return 0

      case 'bottlePullout':
        const bottleBrand = comp.brand as Brand
        if (bottleBrand && PRICES.bottlePullout[bottleBrand]) {
          const sqft = calculateSqft(comp.height, comp.width)
          const qty = parseFloat(comp.quantity) || 1
          return sqft * PRICES.bottlePullout[bottleBrand] * qty
        }
        return 0

      case 'wickerBasket':
        const wickerBrand = comp.brand as Brand
        if (wickerBrand && PRICES.wickerBasket[wickerBrand]) {
          const sqft = calculateSqft(comp.height, comp.width)
          const qty = parseFloat(comp.quantity) || 1
          return sqft * PRICES.wickerBasket[wickerBrand] * qty
        }
        return 0

      case 'tallUnit':
      case 'pantryUnit':
        const sqft = calculateSqft(comp.height, comp.width)
        const pricePerSqft = parseFloat(comp.price) || 0
        return sqft * pricePerSqft

      case 'overheadLoft':
        const loftSqft = calculateSqft(comp.height, comp.width)
        const loftType = comp.loftType as LoftType
        const finish = comp.finish as FinishType
        if (loftType && PRICES.overheadLoft[loftType]) {
          const basePrice = PRICES.overheadLoft[loftType]
          const finishPrice = finish ? PRICES.overheadFinish[finish] : 0
          return loftSqft * (basePrice + finishPrice)
        }
        return 0

      case 'profileShutter':
        const profileQty = parseFloat(comp.quantity) || 0
        return profileQty * PRICES.profileShutter

      case 'handles':
        const handleQty = parseFloat(comp.quantity) || 0
        const handlePrice = parseFloat(comp.handlePrice) || 0
        return handleQty * handlePrice

      default:
        return 0
    }
  }

  // Calculate total estimated cost
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
          totalCost: totalEstimatedCost,
          components: estimate.components
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
          totalCost: totalEstimatedCost,
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
      overheadLoft: 'Overhead Loft',
      profileShutter: 'Profile Shutter with Glass',
      handles: 'Handles'
    }
    return labels[component] || component
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Kitchen Estimator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Calculate your modular kitchen costs with precision
          </p>
        </div>

        {/* Client Information */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Client Information</CardTitle>
            <CardDescription>Enter client details for the estimate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Input
                  id="clientAddress"
                  placeholder="Enter client address"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientContact">Contact Number</Label>
                <Input
                  id="clientContact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={clientInfo.contact}
                  onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={clientInfo.serviceType}
                  onValueChange={(value: ServiceType) => setClientInfo({ ...clientInfo, serviceType: value })}
                >
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kitchen Only">Kitchen Only</SelectItem>
                    <SelectItem value="Full Home">Full Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Type Selection */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Kitchen Configuration</CardTitle>
            <CardDescription>Select your kitchen type to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-2">
              <Label htmlFor="kitchenType">Select Kitchen Type *</Label>
              <Select value={kitchenType} onValueChange={handleKitchenTypeChange}>
                <SelectTrigger id="kitchenType">
                  <SelectValue placeholder="Select kitchen type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semi-Modular">Semi-Modular</SelectItem>
                  <SelectItem value="Full-Modular">Full-Modular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Components */}
        {kitchenType && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Kitchen Components
              </CardTitle>
              <CardDescription>Enter dimensions and specifications for each component</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Component 1: Conditional based on Kitchen Type */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">
                  {kitchenType === 'Semi-Modular' ? 'Ply Verticals' : 'Structure / Countertop'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {kitchenType === 'Semi-Modular' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          value={estimate.components.component1.quantity}
                          onChange={(e) => updateComponent('component1', 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price per Unit</Label>
                        <Input value="₹1500" disabled />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select
                          value={estimate.components.component1.material}
                          onValueChange={(value) => updateComponent('component1', 'material', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Granite">Granite</SelectItem>
                            <SelectItem value="Quartz">Quartz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Height (mm)</Label>
                        <Input
                          type="number"
                          placeholder="Enter height"
                          value={estimate.components.component1.height}
                          onChange={(e) => updateComponent('component1', 'height', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Width (mm)</Label>
                        <Input
                          type="number"
                          placeholder="Enter width"
                          value={estimate.components.component1.width}
                          onChange={(e) => updateComponent('component1', 'width', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('component1').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Component 2: Tandem Drawers */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Tandem Drawers</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select
                      value={estimate.components.tandemDrawers.brand}
                      onValueChange={(value) => updateComponent('tandemDrawers', 'brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Olive">Olive (₹8,000)</SelectItem>
                        <SelectItem value="Blum">Blum (₹12,000)</SelectItem>
                        <SelectItem value="Hettich">Hettich (₹12,000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={estimate.components.tandemDrawers.quantity}
                      onChange={(e) => updateComponent('tandemDrawers', 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Unit</Label>
                    <Input
                      value={estimate.components.tandemDrawers.brand ? `₹${PRICES.tandemDrawers[estimate.components.tandemDrawers.brand as Brand]}` : ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('tandemDrawers').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 3: Dustbin + BTD */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Dustbin + BTD</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select
                      value={estimate.components.dustbinBTD.brand}
                      onValueChange={(value) => updateComponent('dustbinBTD', 'brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Olive">Olive</SelectItem>
                        <SelectItem value="Blum">Blum</SelectItem>
                        <SelectItem value="Hettich">Hettich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.dustbinBTD.height}
                      onChange={(e) => updateComponent('dustbinBTD', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.dustbinBTD.width}
                      onChange={(e) => updateComponent('dustbinBTD', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per sqft</Label>
                    <Input value="₹7,500" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('dustbinBTD').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 4: Bottle Pullout */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Bottle Pullout</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select
                      value={estimate.components.bottlePullout.brand}
                      onValueChange={(value) => updateComponent('bottlePullout', 'brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Olive">Olive</SelectItem>
                        <SelectItem value="Blum">Blum</SelectItem>
                        <SelectItem value="Hettich">Hettich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.bottlePullout.height}
                      onChange={(e) => updateComponent('bottlePullout', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.bottlePullout.width}
                      onChange={(e) => updateComponent('bottlePullout', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={estimate.components.bottlePullout.quantity}
                      onChange={(e) => updateComponent('bottlePullout', 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('bottlePullout').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 5: Wicker Basket */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Wicker Basket</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select
                      value={estimate.components.wickerBasket.brand}
                      onValueChange={(value) => updateComponent('wickerBasket', 'brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Olive">Olive</SelectItem>
                        <SelectItem value="Hettich">Hettich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.wickerBasket.height}
                      onChange={(e) => updateComponent('wickerBasket', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.wickerBasket.width}
                      onChange={(e) => updateComponent('wickerBasket', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={estimate.components.wickerBasket.quantity}
                      onChange={(e) => updateComponent('wickerBasket', 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('wickerBasket').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 6: Tall Unit */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Tall Unit</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.tallUnit.height}
                      onChange={(e) => updateComponent('tallUnit', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.tallUnit.width}
                      onChange={(e) => updateComponent('tallUnit', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per sqft</Label>
                    <Input
                      type="number"
                      placeholder="Enter price per sqft"
                      value={estimate.components.tallUnit.price}
                      onChange={(e) => updateComponent('tallUnit', 'price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('tallUnit').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 7: Pantry Unit */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Pantry Unit</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.pantryUnit.height}
                      onChange={(e) => updateComponent('pantryUnit', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.pantryUnit.width}
                      onChange={(e) => updateComponent('pantryUnit', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per sqft</Label>
                    <Input
                      type="number"
                      placeholder="Enter price per sqft"
                      value={estimate.components.pantryUnit.price}
                      onChange={(e) => updateComponent('pantryUnit', 'price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('pantryUnit').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Component 8: Overhead Loft */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Overhead Loft</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Loft Type</Label>
                    <Select
                      value={estimate.components.overheadLoft.loftType}
                      onValueChange={(value) => updateComponent('overheadLoft', 'loftType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select loft type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frame Loft">Frame Loft (₹1,150/sqft)</SelectItem>
                        <SelectItem value="Box Loft">Box Loft (₹1,250/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Finish</Label>
                    <Select
                      value={estimate.components.overheadLoft.finish}
                      onValueChange={(value) => updateComponent('overheadLoft', 'finish', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select finish" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Acrylic">Acrylic (₹1,850/sqft)</SelectItem>
                        <SelectItem value="Laminate">Laminate (₹1,200/sqft)</SelectItem>
                        <SelectItem value="UV">UV (₹1,400/sqft)</SelectItem>
                        <SelectItem value="PU">PU (₹1,600/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      value={estimate.components.overheadLoft.height}
                      onChange={(e) => updateComponent('overheadLoft', 'height', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      value={estimate.components.overheadLoft.width}
                      onChange={(e) => updateComponent('overheadLoft', 'width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('overheadLoft').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 9: Profile Shutter */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Profile Shutter with Glass</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={estimate.components.profileShutter.quantity}
                      onChange={(e) => updateComponent('profileShutter', 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per sqft</Label>
                    <Input value="₹350" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('profileShutter').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 10: Handles */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold mb-4">Handles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Handle Type</Label>
                    <Select
                      value={estimate.components.handles.handleType}
                      onValueChange={(value) => updateComponent('handles', 'handleType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select handle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TopH">TopH</SelectItem>
                        <SelectItem value="G Profile">G Profile</SelectItem>
                        <SelectItem value="J Profile">J Profile</SelectItem>
                        <SelectItem value="Regular Handle">Regular Handle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Running Feet</Label>
                    <Input
                      type="number"
                      placeholder={`Enter price for ${estimate.components.handles.handleType || 'handle'} in running feet`}
                      value={estimate.components.handles.handlePrice}
                      onChange={(e) => updateComponent('handles', 'handlePrice', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="font-semibold text-lg">
                      ₹{calculateComponentTotal('handles').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Table */}
              <Separator />
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(estimate.components).map((key) => {
                      const componentKey = key as keyof KitchenEstimate['components']
                      const total = calculateComponentTotal(componentKey)
                      if (total > 0) {
                        return (
                          <TableRow key={key}>
                            <TableCell>{getComponentLabel(componentKey)}</TableCell>
                            <TableCell className="text-right">
                              {total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </TableCell>
                          </TableRow>
                        )
                      }
                      return null
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Estimated Cost */}
        {kitchenType && (
          <Card className="mb-6 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-lg mb-2 opacity-90">Total Estimated Cost</p>
                <p className="text-5xl font-bold">
                  ₹{totalEstimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Buttons */}
        {kitchenType && totalEstimatedCost > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Download className="w-6 h-6" />
                Export Estimate
              </CardTitle>
              <CardDescription>Download your estimate in PDF or Excel format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-600 dark:text-slate-400">
          <p className="text-sm">
            Kitchen Estimator &copy; {new Date().getFullYear()}. All prices are in Indian Rupees (₹).
          </p>
        </footer>
      </div>
    </div>
  )
}
