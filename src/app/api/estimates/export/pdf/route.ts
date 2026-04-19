import { NextRequest, NextResponse } from 'next/server'
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

// Function to format Indian Rupee
const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EstimateSchema.parse(body)

    // Dynamic import of jsPDF
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    let yPos = 20

    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('KITCHEN ESTIMATE', pageWidth / 2, yPos, { align: 'center' })
    yPos += 20

    // Line separator
    doc.setDrawColor(200)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, pageWidth - 20, yPos)
    yPos += 15

    // Client Information Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Client Information', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const clientInfo = [
      ['Client Name:', validatedData.clientInfo.name || '-'],
      ['Client Address:', validatedData.clientInfo.address || '-'],
      ['Contact Number:', validatedData.clientInfo.contact || '-'],
      ['Service Type:', validatedData.clientInfo.serviceType || '-'],
      ['Kitchen Type:', validatedData.kitchenType || '-'],
      ['Date:', new Date().toLocaleDateString('en-IN')]
    ]

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 60, yPos)
      yPos += 7
    })

    yPos += 10

    // Components Table
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Components Breakdown', 20, yPos)
    yPos += 10

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

    const tableData: any[] = []
    let serialNo = 1

    Object.keys(componentLabels).forEach((key) => {
      const componentKey = key as keyof typeof validatedData.components
      const componentData = validatedData.components[componentKey]
      const { total, details } = calculateComponentTotal(componentKey, componentData, validatedData.kitchenType)

      if (total > 0 || componentData.brand || componentData.quantity || componentData.height || componentData.width) {
        let specs = []
        if (componentData.height) specs.push(`H: ${componentData.height}mm`)
        if (componentData.width) specs.push(`W: ${componentData.width}mm`)
        if (componentData.quantity) specs.push(`Qty: ${componentData.quantity}`)
        if (componentData.brand) specs.push(`Brand: ${componentData.brand}`)
        if (componentData.material) specs.push(`Mat: ${componentData.material}`)
        if (componentData.loftType) specs.push(`Type: ${componentData.loftType}`)
        if (componentData.finish) specs.push(`Finish: ${componentData.finish}`)
        if (componentData.handleType) specs.push(`Type: ${componentData.handleType}`)
        if (componentData.price && !['tandemDrawers', 'dustbinBTD', 'bottlePullout', 'wickerBasket'].includes(key)) {
          specs.push(`Price: ₹${componentData.price}`)
        }

        tableData.push([
          serialNo,
          componentLabels[key],
          specs.join(', '),
          details,
          formatCurrency(total)
        ])
        serialNo++
      }
    })

    // Add table
    autoTable(doc, {
      startY: yPos,
      head: [['S.No', 'Component', 'Specifications', 'Calculation', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 55 },
        4: { cellWidth: 30, halign: 'right' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    })

    // Get final Y position after table
    yPos = (doc as any).lastAutoTable.finalY + 15

    // Total Section
    doc.setFillColor(16, 185, 129)
    doc.rect(20, yPos - 7, pageWidth - 40, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL ESTIMATED COST', 25, yPos)
    doc.text(formatCurrency(validatedData.totalCost), pageWidth - 25, yPos, { align: 'right' })

    // Reset text color for footer
    doc.setTextColor(0, 0, 0)
    yPos += 20

    // Footer
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text(
      'This is a computer-generated estimate. Please verify all details before proceeding.',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    )

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="kitchen_estimate_${validatedData.clientInfo.name || 'client'}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF file' },
      { status: 500 }
    )
  }
}
