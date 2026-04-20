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
      runningFeet: z.string(),
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

const calculateComponentTotal = (component: string, data: any, kitchenType: string): { total: number; details: string; size: string; rate: number; sqft: number } => {
  switch (component) {
    case 'component1':
      if (kitchenType === 'Semi-Modular') {
        const qty = parseFloat(data.quantity) || 0
        return {
          total: qty * PRICES.plyVerticals,
          details: `${qty} units`,
          size: '',
          rate: PRICES.plyVerticals,
          sqft: 0
        }
      } else {
        const sqft = calculateSqft(data.height, data.width)
        const basePrice = data.material === 'Quartz' ? 2000 : 1500
        const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
        return {
          total: sqft * basePrice,
          details: `${sqft.toFixed(2)} sq.ft × ₹${basePrice}`,
          size,
          rate: basePrice,
          sqft
        }
      }

    case 'tandemDrawers':
      if (data.brand && PRICES.tandemDrawers[data.brand as keyof typeof PRICES.tandemDrawers]) {
        const qty = parseFloat(data.quantity) || 0
        const price = PRICES.tandemDrawers[data.brand as keyof typeof PRICES.tandemDrawers]
        return {
          total: qty * price,
          details: `${qty} units × ₹${price} (${data.brand})`,
          size: '',
          rate: price,
          sqft: 0
        }
      }
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }

    case 'dustbinBTD':
      if (data.brand && PRICES.dustbinBTD[data.brand as keyof typeof PRICES.dustbinBTD]) {
        const sqft = calculateSqft(data.height, data.width)
        const price = PRICES.dustbinBTD[data.brand as keyof typeof PRICES.dustbinBTD]
        const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
        return {
          total: sqft * price,
          details: `${sqft.toFixed(2)} sq.ft × ₹${price} (${data.brand})`,
          size,
          rate: price,
          sqft
        }
      }
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }

    case 'bottlePullout':
      if (data.brand && PRICES.bottlePullout[data.brand as keyof typeof PRICES.bottlePullout]) {
        const sqft = calculateSqft(data.height, data.width)
        const qty = parseFloat(data.quantity) || 1
        const price = PRICES.bottlePullout[data.brand as keyof typeof PRICES.bottlePullout]
        const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
        return {
          total: sqft * price * qty,
          details: `${sqft.toFixed(2)} sq.ft × ₹${price} × ${qty} (${data.brand})`,
          size,
          rate: price,
          sqft
        }
      }
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }

    case 'wickerBasket':
      if (data.brand && PRICES.wickerBasket[data.brand as keyof typeof PRICES.wickerBasket]) {
        const sqft = calculateSqft(data.height, data.width)
        const qty = parseFloat(data.quantity) || 1
        const price = PRICES.wickerBasket[data.brand as keyof typeof PRICES.wickerBasket]
        const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
        return {
          total: sqft * price * qty,
          details: `${sqft.toFixed(2)} sq.ft × ₹${price} × ${qty} (${data.brand})`,
          size,
          rate: price,
          sqft
        }
      }
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }

    case 'tallUnit':
    case 'pantryUnit':
      const sqft = calculateSqft(data.height, data.width)
      const pricePerSqft = parseFloat(data.price) || 0
      const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
      return {
        total: sqft * pricePerSqft,
        details: `${sqft.toFixed(2)} sq.ft × ₹${pricePerSqft}/sqft`,
        size,
        rate: pricePerSqft,
        sqft
      }

    case 'overheadLoft':
      const loftSqft = calculateSqft(data.height, data.width)
      if (data.loftType && PRICES.overheadLoft[data.loftType as keyof typeof PRICES.overheadLoft]) {
        const basePrice = PRICES.overheadLoft[data.loftType as keyof typeof PRICES.overheadLoft]
        const finishPrice = data.finish ? PRICES.overheadFinish[data.finish as keyof typeof PRICES.overheadFinish] : 0
        const size = data.height && data.width ? `${data.height}mmx${data.width}mm` : ''
        const totalRate = basePrice + finishPrice
        return {
          total: loftSqft * totalRate,
          details: `${loftSqft.toFixed(2)} sq.ft × (₹${basePrice} + ₹${finishPrice}) (${data.loftType}, ${data.finish})`,
          size,
          rate: totalRate,
          sqft: loftSqft
        }
      }
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }

    case 'profileShutter':
      const profileQty = parseFloat(data.quantity) || 0
      return {
        total: profileQty * PRICES.profileShutter,
        details: `${profileQty} units × ₹${PRICES.profileShutter}/sqft`,
        size: '',
        rate: PRICES.profileShutter,
        sqft: 0
      }

    case 'handles':
      const handleFeet = parseFloat(data.runningFeet) || 0
      const handlePrice = parseFloat(data.handlePrice) || 0
      return {
        total: handleFeet * handlePrice,
        details: `${handleFeet} running feet × ₹${handlePrice} (${data.handleType})`,
        size: '',
        rate: handlePrice,
        sqft: 0
      }

    default:
      return { total: 0, details: '-', size: '', rate: 0, sqft: 0 }
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

    let yPos = 15

    // Company Name
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('PIONEER ENTERPRISES', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // Company Address
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const address = 'GAT. NO.63, PLOT NO. 6/B, A/P SHINDEWADI, TAL. BHOR, DIST. PUNE-412205'
    const splitAddress = doc.splitTextToSize(address, pageWidth - 50)
    splitAddress.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' })
      yPos += 6
    })
    yPos += 10

    // Date
    doc.setFont('helvetica', 'bold')
    doc.text('DATE:', 40, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }), 70, yPos)
    yPos += 10

    // To
    doc.setFont('helvetica', 'bold')
    doc.text('To,', 40, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(validatedData.clientInfo.name || '', 55, yPos)
    yPos += 15

    // Subject
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const subject = 'SUB:- Tentative Budgetary Offer For Household Modular Furniture and Accessories at your Residence.'
    const splitSubject = doc.splitTextToSize(subject, pageWidth - 50)
    splitSubject.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' })
      yPos += 7
    })
    yPos += 10

    // Table Header
    doc.setFontSize(10)
    doc.setFillColor(211, 211, 211)
    doc.rect(20, yPos, pageWidth - 40, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.text('Sr.No.', 22, yPos + 5)
    doc.text('Particulars', 35, yPos + 5)
    doc.text('Qty.', 130, yPos + 5)
    doc.text('Amount', 160, yPos + 5)
    yPos += 8

    // Items
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

    let srNo = 1
    let totalAmount = 0

    Object.keys(componentLabels).forEach((key) => {
      const componentKey = key as keyof typeof validatedData.components
      const componentData = validatedData.components[componentKey]
      const { total, details, size, rate, sqft } = calculateComponentTotal(componentKey, componentData, validatedData.kitchenType)

      if (total > 0 || componentData.brand || componentData.quantity || componentData.height || componentData.width) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage()
          yPos = 20
        }

        // Sr.No.
        doc.setFont('helvetica', 'normal')
        doc.text(`${srNo})`, 22, yPos + 5)
        yPos += 8

        // Component Name
        doc.setFont('helvetica', 'bold')
        doc.text(componentLabels[key], 25, yPos)
        yPos += 7

        // Size
        if (size) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          const sizeText = `Size: ${size}`
          const splitSize = doc.splitTextToSize(sizeText, pageWidth - 100)
          splitSize.forEach((line: string) => {
            doc.text(line, 25, yPos)
            yPos += 5
          })
          doc.setFontSize(10)
        }

        // Qty
        const qtyText = sqft > 0 ? sqft.toFixed(2) : '1'
        doc.text(qtyText, 130, yPos)
        yPos += 7

        // Amount
        doc.text(formatCurrency(total), 160, yPos)
        totalAmount += total
        yPos += 7

        // Details
        if (details && details !== '-') {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          const splitDetails = doc.splitTextToSize(details, pageWidth - 100)
          splitDetails.forEach((line: string) => {
            if (yPos > pageHeight - 50) {
              doc.addPage()
              yPos = 20
            }
            doc.text(line, 25, yPos)
            yPos += 5
          })
          doc.setFontSize(10)
        }

        // Empty line between items
        yPos += 5
        srNo++
      }
    })

    // Sub Total
    if (yPos > pageHeight - 80) {
      doc.addPage()
      yPos = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('SUB TOTAL ', 80, yPos)
    doc.text(formatCurrency(totalAmount), 160, yPos)
    yPos += 12

    // Loading/Unloading
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Loading/Unloading/Transportation/Packaging', 80, yPos)
    doc.text('₹0', 160, yPos)
    yPos += 12

    // Total
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL', 80, yPos)
    doc.text(formatCurrency(totalAmount), 160, yPos)
    yPos += 12

    // GST 18%
    const gstAmount = totalAmount * 0.18
    doc.text('GST 18%', 80, yPos)
    doc.text(formatCurrency(gstAmount), 160, yPos)
    yPos += 12

    // Grand Total
    doc.setFillColor(212, 225, 87)
    doc.rect(80, yPos - 7, 80, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('GRAND TOTAL', 85, yPos)
    const grandTotal = totalAmount + gstAmount
    doc.text(formatCurrency(grandTotal), 160, yPos)
    doc.setTextColor(0, 0, 0)
    yPos += 20

    // Terms & Conditions
    if (yPos > pageHeight - 120) {
      doc.addPage()
      yPos = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TERMS & CONDITIONS:-', 20, yPos)
    yPos += 10

    const terms = [
      'Quotation is valid for One Month.',
      'Any changes in design will be charged extra.',
      'Any changes in design or material finishes might increase cost',
      'Payment Details',
      '50% Advance',
      '40% Pre-Dispatch Stage',
      '10% Post Handover',
      'Work will be commenced only after Advance Given.',
      'Delivery of Goods:- Ex-Factory.',
      'The charges for Labour Unions & Mathadi Kamgar for unloading upto Installation will be borne by client.',
      'Plumbing and Electrical fitting charges will be extra.',
      'Structural warranty - 10 years',
      'Hardware warranty - 5 years',
      'Time line- 45 to 50 working days after sign off',
      'Furniture Dimensions may vary as per final designs.'
    ]

    terms.forEach((term, index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const termIndex = index < 4 ? `${index + 1}] ` : ''
      doc.text(termIndex + term, 25, yPos)
      yPos += 7
    })

    // Regards
    yPos += 15
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Regards,', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('For Pioneer Enterprises', pageWidth / 2, yPos, { align: 'center' })

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
