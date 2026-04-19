import { NextRequest, NextResponse } from 'next/server'
import { Workbook } from 'exceljs'
import { z } from 'zod'

const EstimateSchema = z.object({
  clientInfo: z.object({
    name: z.string(),
    address: z.string(),
    contact: z.string(),
    serviceType: z.string()
  }),
  kitchenType: z.string(),
  totalCost: z.number(),
  components: z.object({
    component1: z.object({
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string(),
      material: z.string()
    }),
    tandemDrawers: z.object({
      brand: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    dustbinBTD: z.object({
      brand: z.string(),
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    bottlePullout: z.object({
      brand: z.string(),
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    wickerBasket: z.object({
      brand: z.string(),
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    tallUnit: z.object({
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    pantryUnit: z.object({
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      price: z.string()
    }),
    overheadLoft: z.object({
      height: z.string(),
      width: z.string(),
      quantity: z.string(),
      loftType: z.string(),
      finish: z.string(),
      price: z.string()
    }),
    profileShutter: z.object({
      quantity: z.string(),
      price: z.string()
    }),
    handles: z.object({
      handleType: z.string(),
      quantity: z.string(),
      handlePrice: z.string()
    })
  })
})

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

const calculateSqft = (height: string, width: string): number => {
  const h = parseFloat(height) || 0
  const w = parseFloat(width) || 0
  return (h * w) / 92903
}

const calculateComponentTotal = (component: string, data: any, kitchenType: string): { total: number; details: string } => {
  switch (component) {
    case 'component1':
      if (kitchenType === 'Semi-Modular') {
        const qty = parseFloat(data.quantity) || 0
        return {
          total: qty * PRICES.plyVerticals,
          details: `${qty} units × ₹${PRICES.plyVerticals}`
        }
      } else {
        const sqft = calculateSqft(data.height, data.width)
        const basePrice = data.material === 'Quartz' ? 2000 : 1500
        return {
          total: sqft * basePrice,
          details: `${sqft.toFixed(2)} sqft × ₹${basePrice}`
        }
      }

    case 'tandemDrawers':
      if (data.brand && PRICES.tandemDrawers[data.brand as keyof typeof PRICES.tandemDrawers]) {
        const qty = parseFloat(data.quantity) || 0
        const price = PRICES.tandemDrawers[data.brand as keyof typeof PRICES.tandemDrawers]
        return {
          total: qty * price,
          details: `${qty} units × ₹${price} (${data.brand})`
        }
      }
      return { total: 0, details: '-' }

    case 'dustbinBTD':
      if (data.brand && PRICES.dustbinBTD[data.brand as keyof typeof PRICES.dustbinBTD]) {
        const sqft = calculateSqft(data.height, data.width)
        const price = PRICES.dustbinBTD[data.brand as keyof typeof PRICES.dustbinBTD]
        return {
          total: sqft * price,
          details: `${sqft.toFixed(2)} sqft × ₹${price} (${data.brand})`
        }
      }
      return { total: 0, details: '-' }

    case 'bottlePullout':
      if (data.brand && PRICES.bottlePullout[data.brand as keyof typeof PRICES.bottlePullout]) {
        const sqft = calculateSqft(data.height, data.width)
        const qty = parseFloat(data.quantity) || 1
        const price = PRICES.bottlePullout[data.brand as keyof typeof PRICES.bottlePullout]
        return {
          total: sqft * price * qty,
          details: `${sqft.toFixed(2)} sqft × ₹${price} × ${qty} (${data.brand})`
        }
      }
      return { total: 0, details: '-' }

    case 'wickerBasket':
      if (data.brand && PRICES.wickerBasket[data.brand as keyof typeof PRICES.wickerBasket]) {
        const sqft = calculateSqft(data.height, data.width)
        const qty = parseFloat(data.quantity) || 1
        const price = PRICES.wickerBasket[data.brand as keyof typeof PRICES.wickerBasket]
        return {
          total: sqft * price * qty,
          details: `${sqft.toFixed(2)} sqft × ₹${price} × ${qty} (${data.brand})`
        }
      }
      return { total: 0, details: '-' }

    case 'tallUnit':
    case 'pantryUnit':
      const sqft = calculateSqft(data.height, data.width)
      const pricePerSqft = parseFloat(data.price) || 0
      return {
        total: sqft * pricePerSqft,
        details: `${sqft.toFixed(2)} sqft × ₹${pricePerSqft}/sqft`
      }

    case 'overheadLoft':
      const loftSqft = calculateSqft(data.height, data.width)
      if (data.loftType && PRICES.overheadLoft[data.loftType as keyof typeof PRICES.overheadLoft]) {
        const basePrice = PRICES.overheadLoft[data.loftType as keyof typeof PRICES.overheadLoft]
        const finishPrice = data.finish ? PRICES.overheadFinish[data.finish as keyof typeof PRICES.overheadFinish] : 0
        return {
          total: loftSqft * (basePrice + finishPrice),
          details: `${loftSqft.toFixed(2)} sqft × (₹${basePrice} + ₹${finishPrice}) (${data.loftType}, ${data.finish})`
        }
      }
      return { total: 0, details: '-' }

    case 'profileShutter':
      const profileQty = parseFloat(data.quantity) || 0
      return {
        total: profileQty * PRICES.profileShutter,
        details: `${profileQty} units × ₹${PRICES.profileShutter}/sqft`
      }

    case 'handles':
      const handleQty = parseFloat(data.quantity) || 0
      const handlePrice = parseFloat(data.handlePrice) || 0
      return {
        total: handleQty * handlePrice,
        details: `${handleQty} running feet × ₹${handlePrice} (${data.handleType})`
      }

    default:
      return { total: 0, details: '-' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EstimateSchema.parse(body)

    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Kitchen Estimate')

    // Header styling
    worksheet.getRow(1).font = { size: 14, bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7F3FF' }
    }

    // Title
    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'KITCHEN ESTIMATE'
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(1).height = 30

    // Client Information Section
    const clientRow = 3
    worksheet.getCell(`A${clientRow}`).value = 'Client Information'
    worksheet.getCell(`A${clientRow}`).font = { bold: true, size: 12 }
    worksheet.mergeCells(`A${clientRow}:E${clientRow}`)

    const clientData = [
      ['Client Name:', validatedData.clientInfo.name],
      ['Client Address:', validatedData.clientInfo.address],
      ['Contact Number:', validatedData.clientInfo.contact],
      ['Service Type:', validatedData.clientInfo.serviceType],
      ['Kitchen Type:', validatedData.kitchenType],
      ['Date:', new Date().toLocaleDateString('en-IN')]
    ]

    clientData.forEach((row, index) => {
      const rowNum = clientRow + 1 + index
      worksheet.getCell(`A${rowNum}`).value = row[0]
      worksheet.getCell(`A${rowNum}`).font = { bold: true }
      worksheet.getCell(`B${rowNum}`).value = row[1]
      worksheet.mergeCells(`B${rowNum}:E${rowNum}`)
    })

    // Components Section Header
    const componentsHeader = clientRow + 8
    worksheet.getRow(componentsHeader).font = { bold: true, size: 12 }
    worksheet.getRow(componentsHeader).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    }

    const headers = ['S.No', 'Component Name', 'Specifications', 'Calculation', 'Amount (₹)']
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}${componentsHeader}`)
      cell.value = header
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Components Data
    const componentLabels: Record<string, string> = {
      component1: validatedData.kitchenType === 'Semi-Modular' ? 'Ply Verticals' : 'Structure / Countertop',
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

    let rowNum = componentsHeader + 1
    let serialNo = 1

    Object.keys(componentLabels).forEach((key) => {
      const componentKey = key as keyof typeof validatedData.components
      const componentData = validatedData.components[componentKey]
      const { total, details } = calculateComponentTotal(componentKey, componentData, validatedData.kitchenType)

      if (total > 0 || componentData.brand || componentData.quantity || componentData.height || componentData.width) {
        // Serial Number
        const cellSno = worksheet.getCell(`A${rowNum}`)
        cellSno.value = serialNo
        cellSno.alignment = { horizontal: 'center' }
        cellSno.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // Component Name
        const cellName = worksheet.getCell(`B${rowNum}`)
        cellName.value = componentLabels[key]
        cellName.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // Specifications
        let specs = ''
        if (componentData.height) specs += `Height: ${componentData.height}mm\n`
        if (componentData.width) specs += `Width: ${componentData.width}mm\n`
        if (componentData.quantity) specs += `Quantity: ${componentData.quantity}\n`
        if (componentData.brand) specs += `Brand: ${componentData.brand}\n`
        if (componentData.material) specs += `Material: ${componentData.material}\n`
        if (componentData.loftType) specs += `Type: ${componentData.loftType}\n`
        if (componentData.finish) specs += `Finish: ${componentData.finish}\n`
        if (componentData.handleType) specs += `Type: ${componentData.handleType}\n`
        if (componentData.price && !['tandemDrawers', 'dustbinBTD', 'bottlePullout', 'wickerBasket'].includes(key)) {
          specs += `Price: ₹${componentData.price}\n`
        }

        const cellSpecs = worksheet.getCell(`C${rowNum}`)
        cellSpecs.value = specs.trim()
        cellSpecs.alignment = { vertical: 'top', wrapText: true }
        cellSpecs.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // Calculation
        const cellCalc = worksheet.getCell(`D${rowNum}`)
        cellCalc.value = details
        cellCalc.alignment = { vertical: 'top', wrapText: true }
        cellCalc.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // Amount
        const cellAmount = worksheet.getCell(`E${rowNum}`)
        cellAmount.value = total
        cellAmount.numFmt = '"₹"#,##0'
        cellAmount.alignment = { horizontal: 'right' }
        cellAmount.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        serialNo++
        rowNum++
      }
    })

    // Total Row
    const totalRow = rowNum + 1
    worksheet.mergeCells(`A${totalRow}:D${totalRow}`)
    worksheet.getCell(`A${totalRow}`).value = 'TOTAL ESTIMATED COST'
    worksheet.getCell(`A${totalRow}`).font = { bold: true, size: 14 }
    worksheet.getCell(`A${totalRow}`).alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell(`A${totalRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    }
    worksheet.getCell(`A${totalRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    const cellTotal = worksheet.getCell(`E${totalRow}`)
    cellTotal.value = validatedData.totalCost
    cellTotal.numFmt = '"₹"#,##0'
    cellTotal.font = { bold: true, size: 14 }
    cellTotal.alignment = { horizontal: 'right', vertical: 'middle' }
    cellTotal.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    }
    cellTotal.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    // Column Widths
    worksheet.getColumn('A').width = 8
    worksheet.getColumn('B').width = 25
    worksheet.getColumn('C').width = 30
    worksheet.getColumn('D').width = 40
    worksheet.getColumn('E').width = 18

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="kitchen_estimate_${validatedData.clientInfo.name || 'client'}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    )
  }
}
