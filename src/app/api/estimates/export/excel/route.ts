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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EstimateSchema.parse(body)

    const workbook = new Workbook()

    // Create Quotation Sheet (following Pioneer Template format)
    const quotationSheet = workbook.addWorksheet('Quotation')

    // Company Header
    quotationSheet.mergeCells('B3:H3')
    const cellB3 = quotationSheet.getCell('B3')
    cellB3.value = 'PIONEER ENTERPRISES'
    cellB3.font = { size: 16, bold: true }
    cellB3.alignment = { horizontal: 'center' }

    quotationSheet.mergeCells('B4:H4')
    const cellB4 = quotationSheet.getCell('B4')
    cellB4.value = 'GAT. NO.63, PLOT NO. 6/B, A/P SHINDEWADI, TAL. BHOR, DIST. PUNE-412205'
    cellB4.alignment = { horizontal: 'center' }

    // Date and Client Info
    quotationSheet.getCell('D9').value = 'DATE:'
    quotationSheet.getCell('D9').font = { bold: true }
    quotationSheet.getCell('F9').value = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

    quotationSheet.getCell('B10').value = 'To,'
    quotationSheet.getCell('B10').font = { bold: true }
    quotationSheet.getCell('D10').value = validatedData.clientInfo.name || ''

    // Subject
    quotationSheet.mergeCells('B14:H14')
    const cellB14 = quotationSheet.getCell('B14')
    cellB14.value = 'SUB:- Tentative Budgetary Offer For Household Modular Furniture and Accessories at your Residence.'
    cellB14.font = { bold: true, size: 11 }

    // Table Header
    quotationSheet.getRow(16).font = { bold: true }
    quotationSheet.getCell('B16').value = 'Sr.No.'
    quotationSheet.getCell('C16').value = 'Particulars'
    quotationSheet.getCell('D16').value = 'Qty.'
    quotationSheet.getCell('E16').value = 'Amount'
    quotationSheet.getRow(16).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }

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

    let rowNum = 17
    let srNo = 1
    let totalAmount = 0

    Object.keys(componentLabels).forEach((key) => {
      const componentKey = key as keyof typeof validatedData.components
      const componentData = validatedData.components[componentKey]
      const { total, details, size, rate, sqft } = calculateComponentTotal(componentKey, componentData, validatedData.kitchenType)

      if (total > 0 || componentData.brand || componentData.quantity || componentData.height || componentData.width) {
        // Sr.No.
        const cellSr = quotationSheet.getCell(`B${rowNum}`)
        cellSr.value = `${srNo})`
        cellSr.alignment = { horizontal: 'center' }

        // Particulars - First row with component name and size
        const cellPart1 = quotationSheet.getCell(`C${rowNum}`)
        cellPart1.value = componentLabels[key]
        cellPart1.font = { bold: true }

        // Qty (for sq.ft items)
        const cellQty = quotationSheet.getCell(`D${rowNum}`)
        cellQty.value = sqft > 0 ? sqft.toFixed(2) : '1'
        cellQty.alignment = { horizontal: 'center' }

        // Amount
        const cellAmt = quotationSheet.getCell(`E${rowNum}`)
        cellAmt.value = total
        cellAmt.numFmt = '"₹"#,##0'
        cellAmt.alignment = { horizontal: 'right' }

        totalAmount += total
        rowNum++
        srNo++

        // Additional row for size/details if exists
        if (size) {
          quotationSheet.mergeCells(`C${rowNum}:D${rowNum}`)
          const cellSize = quotationSheet.getCell(`C${rowNum}`)
          cellSize.value = `Size: ${size}`
          cellSize.alignment = { indent: 1 }
          rowNum++
        }

        // Additional row for details
        if (details && details !== '-') {
          quotationSheet.mergeCells(`C${rowNum}:D${rowNum}`)
          const cellDetails = quotationSheet.getCell(`C${rowNum}`)
          cellDetails.value = details
          cellDetails.alignment = { indent: 1, wrapText: true }
          rowNum++
        }

        // Empty row between items
        if (key !== 'handles') {
          rowNum++
        }
      }
    })

    // Sub Total
    const subTotalRow = rowNum
    quotationSheet.mergeCells(`C${subTotalRow}:D${subTotalRow}`)
    const cellSubTotal = quotationSheet.getCell(`C${subTotalRow}`)
    cellSubTotal.value = 'SUB TOTAL '
    cellSubTotal.font = { bold: true, size: 12 }
    quotationSheet.getCell(`E${subTotalRow}`).value = totalAmount
    quotationSheet.getCell(`E${subTotalRow}`).numFmt = '"₹"#,##0'
    quotationSheet.getCell(`E${subTotalRow}`).font = { bold: true, size: 12 }
    quotationSheet.getCell(`E${subTotalRow}`).alignment = { horizontal: 'right' }

    // Loading/Unloading/Transportation
    const loadingRow = subTotalRow + 1
    quotationSheet.mergeCells(`C${loadingRow}:D${loadingRow}`)
    const cellLoading = quotationSheet.getCell(`C${loadingRow}`)
    cellLoading.value = 'Loading/Unloading/Transportation/Packaging'
    quotationSheet.getCell(`E${loadingRow}`).value = 0
    quotationSheet.getCell(`E${loadingRow}`).numFmt = '"₹"#,##0'

    // Total
    const totalRow = loadingRow + 1
    quotationSheet.mergeCells(`C${totalRow}:D${totalRow}`)
    const cellTotalLabel = quotationSheet.getCell(`C${totalRow}`)
    cellTotalLabel.value = 'TOTAL'
    cellTotalLabel.font = { bold: true, size: 12 }
    quotationSheet.getCell(`E${totalRow}`).value = totalAmount
    quotationSheet.getCell(`E${totalRow}`).numFmt = '"₹"#,##0'
    quotationSheet.getCell(`E${totalRow}`).font = { bold: true, size: 12 }
    quotationSheet.getCell(`E${totalRow}`).alignment = { horizontal: 'right' }

    // GST 18%
    const gstRow = totalRow + 1
    quotationSheet.mergeCells(`C${gstRow}:D${gstRow}`)
    const cellGst = quotationSheet.getCell(`C${gstRow}`)
    cellGst.value = 'GST 18%'
    cellGst.font = { bold: true, size: 12 }
    const gstAmount = totalAmount * 0.18
    quotationSheet.getCell(`E${gstRow}`).value = gstAmount
    quotationSheet.getCell(`E${gstRow}`).numFmt = '"₹"#,##0'
    quotationSheet.getCell(`E${gstRow}`).font = { bold: true, size: 12 }
    quotationSheet.getCell(`E${gstRow}`).alignment = { horizontal: 'right' }

    // Grand Total
    const grandTotalRow = gstRow + 1
    quotationSheet.mergeCells(`C${grandTotalRow}:D${grandTotalRow}`)
    const cellGrandTotal = quotationSheet.getCell(`C${grandTotalRow}`)
    cellGrandTotal.value = 'GRAND TOTAL'
    cellGrandTotal.font = { bold: true, size: 14 }
    quotationSheet.getRow(grandTotalRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4E157' }
    }
    const grandTotal = totalAmount + gstAmount
    quotationSheet.getCell(`E${grandTotalRow}`).value = grandTotal
    quotationSheet.getCell(`E${grandTotalRow}`).numFmt = '"₹"#,##0'
    quotationSheet.getCell(`E${grandTotalRow}`).font = { bold: true, size: 14 }
    quotationSheet.getCell(`E${grandTotalRow}`).alignment = { horizontal: 'right' }

    // Terms & Conditions
    const termsRow = grandTotalRow + 2
    quotationSheet.mergeCells(`B${termsRow}:H${termsRow}`)
    const cellTerms = quotationSheet.getCell(`B${termsRow}`)
    cellTerms.value = 'TERMS & CONDITIONS:-'
    cellTerms.font = { bold: true, size: 12 }

    const terms = [
      'Quotation is valid for One Month.',
      'Any changes in design will be charged extra.',
      'Any changes in design or material finishes might increase cost',
      'Payment Details',
      '50%  Advance ',
      '40% Pre-Dispatch Stage',
      '10%  Post Handover',
      'Work will be commenced only after Advance Given.',
      'Delivery of Goods:- Ex-Factory.',
      'The charges for Labour Unions & Mathadi Kamgar for  unloading upto Installation will be borne by client.',
      'Plumbing and Electrical fitting charges will be extra.',
      'Structural warrenty -10 years',
      'Hardware warrenty - 5 years ',
      'Time line- 45 to 50 working days after sign off',
      'Furniture Dimensions may vary as per final designs.'
    ]

    terms.forEach((term, index) => {
      const termRowNum = termsRow + 1 + index
      const termIndex = index < 4 ? `${index + 1}]` : ''
      quotationSheet.mergeCells(`B${termRowNum}:H${termRowNum}`)
      const cellTerm = quotationSheet.getCell(`B${termRowNum}`)
      cellTerm.value = `${termIndex} ${term}`
      if (termIndex) {
        cellTerm.font = { bold: true }
      }
    })

    // Regards
    const regardsRow = termsRow + terms.length + 1
    quotationSheet.mergeCells(`C${regardsRow}:E${regardsRow}`)
    quotationSheet.getCell(`C${regardsRow}`).value = 'Regards,'

    const companyRow = regardsRow + 1
    quotationSheet.mergeCells(`C${companyRow}:E${companyRow}`)
    quotationSheet.getCell(`C${companyRow}`).value = 'For Pioneer Enterprises'
    quotationSheet.getCell(`C${companyRow}`).font = { bold: true }

    // Set column widths
    quotationSheet.getColumn('A').width = 2
    quotationSheet.getColumn('B').width = 10
    quotationSheet.getColumn('C').width = 50
    quotationSheet.getColumn('D').width = 15
    quotationSheet.getColumn('E').width = 20

    // Create Workbook Sheet (detailed breakdown)
    const workbookSheet = workbook.addWorksheet('Workbook')

    // Header
    workbookSheet.mergeCells('B1:M1')
    workbookSheet.getCell('B1').value = validatedData.clientInfo.name || ''
    workbookSheet.getCell('B1').font = { bold: true, size: 14 }

    // Table headers
    workbookSheet.getRow(2).font = { bold: true }
    workbookSheet.getCell('C2').value = 'l'
    workbookSheet.getCell('D2').value = 'b'
    workbookSheet.getCell('E2').value = 'sq.ft'
    workbookSheet.getCell('F2').value = 'Quantity'
    workbookSheet.getCell('G2').value = 'Total quantity Sq.Ft'
    workbookSheet.getCell('H2').value = 'Rate'
    workbookSheet.getCell('I2').value = 'Amount'

    // Items in Workbook sheet
    let wbRow = 3
    Object.keys(componentLabels).forEach((key) => {
      const componentKey = key as keyof typeof validatedData.components
      const componentData = validatedData.components[componentKey]
      const { total, details, size, rate, sqft } = calculateComponentTotal(componentKey, componentData, validatedData.kitchenType)

      if (total > 0 || componentData.brand || componentData.quantity || componentData.height || componentData.width) {
        // Component name
        workbookSheet.mergeCells(`B${wbRow}:M${wbRow}`)
        workbookSheet.getCell(`B${wbRow}`).value = componentLabels[key]
        workbookSheet.getCell(`B${wbRow}`).font = { bold: true }
        wbRow++

        // Size
        if (size) {
          workbookSheet.mergeCells(`B${wbRow}:M${wbRow}`)
          workbookSheet.getCell(`B${wbRow}`).value = `Size: ${size}`
          wbRow++
        }

        // l (length/height)
        workbookSheet.getCell(`C${wbRow}`).value = sqft > 0 ? sqft.toFixed(1) : ''

        // b (width)
        workbookSheet.getCell(`D${wbRow}`).value = sqft > 0 ? '1' : ''

        // sq.ft
        workbookSheet.getCell(`E${wbRow}`).value = sqft.toFixed(2)

        // Quantity
        const qty = parseFloat(componentData.quantity) || 1
        workbookSheet.getCell(`F${wbRow}`).value = qty

        // Total quantity Sq.Ft
        workbookSheet.getCell(`G${wbRow}`).value = sqft > 0 ? (sqft * qty).toFixed(2) : qty

        // Rate
        workbookSheet.getCell(`H${wbRow}`).value = rate

        // Amount
        workbookSheet.getCell(`I${wbRow}`).value = total
        workbookSheet.getCell(`I${wbRow}`).numFmt = '"₹"#,##0'
        wbRow++

        // 5% row
        const fivePercentRow = wbRow
        workbookSheet.mergeCells(`B${fivePercentRow}:H${fivePercentRow}`)
        workbookSheet.getCell(`I${fivePercentRow}`).value = total * 0.05
        workbookSheet.getCell(`I${fivePercentRow}`).numFmt = '"₹"#,##0'
        wbRow++
      }
    })

    // Set column widths for Workbook sheet
    workbookSheet.getColumn('A').width = 2
    workbookSheet.getColumn('B').width = 40
    workbookSheet.getColumn('C').width = 8
    workbookSheet.getColumn('D').width = 8
    workbookSheet.getColumn('E').width = 12
    workbookSheet.getColumn('F').width = 10
    workbookSheet.getColumn('G').width = 18
    workbookSheet.getColumn('H').width = 10
    workbookSheet.getColumn('I').width = 15

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
