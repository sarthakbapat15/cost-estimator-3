import { NextRequest, NextResponse } from 'next/server'
import { Workbook } from 'exceljs'
import fs from 'fs'
import path from 'path'

interface EstimateData {
  clientInfo: {
    name: string
    address: string
    contact: string
    serviceType: string
  }
  kitchenType: string
  totalCost: number
  kitchenCost: number
  livingRoomCost: number
  components: Record<string, any>
  livingRoomEstimate?: Record<string, any>
  logoSettings?: {
    width: number
    height: number
    position: 'left' | 'center' | 'right'
  }
  miscEstimate?: {
    falseCeiling: { type: string; material: string; height: string; width: string }
    electricalWork: Array<{ id?: string; lightPointType: string; quantity: string }>
    painting: Array<{ id?: string; paintType: string; totalArea: string }>
  }
}

function validateData(body: any): EstimateData {
  return {
    clientInfo: {
      name: body?.clientInfo?.name || '',
      address: body?.clientInfo?.address || '',
      contact: body?.clientInfo?.contact || '',
      serviceType: body?.clientInfo?.serviceType || ''
    },
    kitchenType: body?.kitchenType || '',
    totalCost: body?.totalCost || 0,
    kitchenCost: body?.kitchenCost || 0,
    livingRoomCost: body?.livingRoomCost || 0,
    components: body?.components || {},
    livingRoomEstimate: body?.livingRoomEstimate || undefined,
    logoSettings: body?.logoSettings || { width: 350, height: 140, position: 'center' },
    miscEstimate: body?.miscEstimate || undefined,
  }
}

// Price constants (mirrored from frontend)
const PRICES = {
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
  profileShutter: 350,
  countertopMaterial: { Granite: 550, Quartz: 650 },
  baseCarcase: 1650,
  kitchenPaneling: { SF: 800, 'Gloss (MR+)': 1150, HGL: 1350, Acrylic: 1450 },
  overheadCabinetFinish: { SF: 1350, HGL: 1475, Acrylic: 2050, 'Glass Acrylic': 2250 }
}

const calculateSqft = (height: string, width: string): number => {
  const h = parseFloat(height) || 0
  const w = parseFloat(width) || 0
  return (h * w) / 92903
}

interface ExportItem {
  label: string
  subLabel?: string
  l?: number
  b?: number
  sqft?: number
  quantity?: number
  totalSqft?: number
  rate?: number
  amount: number
}

function getKitchenItems(components: any, kitchenType: string): ExportItem[] {
  const items: ExportItem[] = []

  // Component 1: Ply Verticals or Structure/Countertop
  const c1 = components.component1 || {}
  if (kitchenType === 'Semi-Modular') {
    const qty = parseFloat(c1.quantity) || 0
    if (qty > 0) {
      items.push({
        label: 'Ply Verticals',
        subLabel: 'CARCASE',
        quantity: qty,
        totalSqft: qty,
        rate: PRICES.plyVerticals,
        amount: qty * PRICES.plyVerticals
      })
    }
  } else {
    const sqft = calculateSqft(c1.height, c1.width)
    const basePrice = PRICES.countertopMaterial[c1.material as keyof typeof PRICES.countertopMaterial] || PRICES.countertopMaterial.Granite
    if (sqft > 0 && c1.height && c1.width) {
      items.push({
        label: 'Structure / Countertop',
        subLabel: c1.material || 'Granite',
        l: parseFloat(c1.height) || 0,
        b: parseFloat(c1.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: basePrice,
        amount: sqft * basePrice
      })
    }
  }

  // Tandem Drawers
  const td = components.tandemDrawers || {}
  if (td.brand && PRICES.tandemDrawers[td.brand as keyof typeof PRICES.tandemDrawers]) {
    const qty = parseFloat(td.quantity) || 0
    const price = PRICES.tandemDrawers[td.brand as keyof typeof PRICES.tandemDrawers]
    if (qty > 0) {
      items.push({
        label: 'Tandem Drawers',
        subLabel: td.brand,
        quantity: qty,
        totalSqft: qty,
        rate: price,
        amount: qty * price
      })
    }
  }

  // Dustbin + BTD
  const db = components.dustbinBTD || {}
  if (db.brand && PRICES.dustbinBTD[db.brand as keyof typeof PRICES.dustbinBTD]) {
    const qty = parseFloat(db.quantity) || 0
    const price = PRICES.dustbinBTD[db.brand as keyof typeof PRICES.dustbinBTD]
    if (qty > 0) {
      items.push({
        label: 'Dustbin + BTD',
        subLabel: db.brand,
        quantity: qty,
        totalSqft: qty,
        rate: price,
        amount: qty * price
      })
    }
  }

  // Bottle Pullout
  const bp = components.bottlePullout || {}
  if (bp.brand && PRICES.bottlePullout[bp.brand as keyof typeof PRICES.bottlePullout]) {
    const qty = parseFloat(bp.quantity) || 0
    const price = PRICES.bottlePullout[bp.brand as keyof typeof PRICES.bottlePullout]
    if (qty > 0) {
      items.push({
        label: 'Bottle Pullout',
        subLabel: bp.brand,
        quantity: qty,
        totalSqft: qty,
        rate: price,
        amount: qty * price
      })
    }
  }

  // Wicker Basket
  const wb = components.wickerBasket || {}
  if (wb.brand && PRICES.wickerBasket[wb.brand as keyof typeof PRICES.wickerBasket]) {
    const qty = parseFloat(wb.quantity) || 0
    const price = PRICES.wickerBasket[wb.brand as keyof typeof PRICES.wickerBasket]
    if (qty > 0) {
      items.push({
        label: 'Wicker Baskets',
        subLabel: wb.brand,
        quantity: qty,
        totalSqft: qty,
        rate: price,
        amount: qty * price
      })
    }
  }

  // Tall Unit
  const tu = components.tallUnit || {}
  if (tu.height && tu.width && tu.tallPantryFinish) {
    const sqft = calculateSqft(tu.height, tu.width)
    const rate = PRICES.tallPantryFinish[tu.tallPantryFinish as keyof typeof PRICES.tallPantryFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Tall Unit',
        subLabel: `Carcass ${tu.tallPantryFinish}`,
        l: parseFloat(tu.height) || 0,
        b: parseFloat(tu.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Pantry Unit
  const pu = components.pantryUnit || {}
  if (pu.height && pu.width && pu.tallPantryFinish) {
    const sqft = calculateSqft(pu.height, pu.width)
    const finishRate = PRICES.tallPantryFinish[pu.tallPantryFinish as keyof typeof PRICES.tallPantryFinish] || 0
    let amount = sqft * finishRate
    const accType = pu.accessories as string
    const accPrice = accType ? PRICES.pantryAccessories[accType as keyof typeof PRICES.pantryAccessories] : 0
    amount += accPrice || 0
    if (sqft > 0 && (finishRate > 0 || accPrice > 0)) {
      items.push({
        label: 'Pantry Unit',
        subLabel: `Carcass ${pu.tallPantryFinish}`,
        l: parseFloat(pu.height) || 0,
        b: parseFloat(pu.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: finishRate,
        amount
      })
      if (accPrice > 0) {
        items.push({
          label: '',
          subLabel: accType,
          quantity: 1,
          totalSqft: 1,
          rate: accPrice,
          amount: accPrice
        })
      }
    }
  }

  // Base Carcase
  const bcc = components.baseCarcase || {}
  if (bcc.height && bcc.width) {
    const sqft = calculateSqft(bcc.height, bcc.width)
    if (sqft > 0) {
      items.push({
        label: 'Base Carcase',
        subLabel: 'CARCASE',
        l: parseFloat(bcc.height) || 0,
        b: parseFloat(bcc.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: PRICES.baseCarcase,
        amount: sqft * PRICES.baseCarcase
      })
    }
  }

  // Kitchen Paneling
  const kp = components.kitchenPaneling || {}
  if (kp.height && kp.width && kp.tallPantryFinish) {
    const sqft = calculateSqft(kp.height, kp.width)
    const kpRate = kp.tallPantryFinish === 'Postforming'
      ? (validatedData.components.postformingRate ? parseFloat(validatedData.components.postformingRate) : 0)
      : (PRICES.kitchenPaneling[kp.tallPantryFinish as keyof typeof PRICES.kitchenPaneling] || 0)
    if (sqft > 0 && kpRate > 0) {
      items.push({
        label: 'Kitchen Paneling',
        subLabel: kp.tallPantryFinish,
        l: parseFloat(kp.height) || 0,
        b: parseFloat(kp.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: kpRate,
        amount: sqft * kpRate
      })
    }
  }

  // Overhead Cabinet
  const ohc = components.overheadCabinet || {}
  if (ohc.height && ohc.width && ohc.overheadCabinetFinish) {
    const sqft = calculateSqft(ohc.height, ohc.width)
    const ohcRate = PRICES.overheadCabinetFinish[ohc.overheadCabinetFinish as keyof typeof PRICES.overheadCabinetFinish] || 0
    if (sqft > 0 && ohcRate > 0) {
      items.push({
        label: 'Overhead Cabinet',
        subLabel: ohc.overheadCabinetFinish,
        l: parseFloat(ohc.height) || 0,
        b: parseFloat(ohc.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: ohcRate,
        amount: sqft * ohcRate
      })
    }
  }

  // Overhead Loft
  const ol = components.overheadLoft || {}
  if (ol.height && ol.width && ol.loftType) {
    const sqft = calculateSqft(ol.height, ol.width)
    const basePrice = PRICES.overheadLoft[ol.loftType as keyof typeof PRICES.overheadLoft] || 0
    const finishPrice = ol.finish ? (PRICES.overheadFinish[ol.finish as keyof typeof PRICES.overheadFinish] || 0) : 0
    const totalRate = basePrice + finishPrice
    if (sqft > 0 && totalRate > 0) {
      items.push({
        label: 'Overhead Loft',
        subLabel: `Carcass ${ol.loftType}`,
        l: parseFloat(ol.height) || 0,
        b: parseFloat(ol.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate: totalRate,
        amount: sqft * totalRate
      })
    }
  }

  // Profile Shutter
  const ps = components.profileShutter || {}
  const psQty = parseFloat(ps.quantity) || 0
  const psPrice = parseFloat(ps.price) || PRICES.profileShutter
  if (psQty > 0) {
    items.push({
      label: 'Profile Shutter with Glass',
      quantity: psQty,
      totalSqft: psQty,
      rate: psPrice,
      amount: psQty * psPrice
    })
  }

  // Handles
  const hd = components.handles || {}
  const handleFeet = parseFloat(hd.runningFeet) || 0
  const handlePrice = parseFloat(hd.handlePrice) || 0
  if (handleFeet > 0 && handlePrice > 0) {
    items.push({
      label: 'Handles',
      subLabel: hd.handleType,
      quantity: handleFeet,
      totalSqft: handleFeet,
      rate: handlePrice,
      amount: handleFeet * handlePrice
    })
  }

  return items
}

function getLivingRoomItems(livingRoomEstimate: any): ExportItem[] {
  const items: ExportItem[] = []
  if (!livingRoomEstimate || !livingRoomEstimate.components) return items

  const comps = livingRoomEstimate.components

  // Chest of Drawers
  const cod = comps.chestOfDrawers || {}
  if (cod.height && cod.width && cod.tallPantryFinish) {
    const sqft = calculateSqft(cod.height, cod.width)
    const rate = PRICES.livingRoomFinish[cod.tallPantryFinish as keyof typeof PRICES.livingRoomFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Chest of Drawers',
        subLabel: `Carcass ${cod.tallPantryFinish}`,
        l: parseFloat(cod.height) || 0,
        b: parseFloat(cod.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Base Cabinet
  const bc = comps.baseCabinet || {}
  if (bc.height && bc.width && bc.tallPantryFinish) {
    const sqft = calculateSqft(bc.height, bc.width)
    const rate = PRICES.livingRoomFinish[bc.tallPantryFinish as keyof typeof PRICES.livingRoomFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Base Cabinet with shutters',
        subLabel: `Carcass ${bc.tallPantryFinish}`,
        l: parseFloat(bc.height) || 0,
        b: parseFloat(bc.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Tall Unit
  const ltu = comps.livingRoomTallUnit || {}
  if (ltu.height && ltu.width && ltu.tallPantryFinish) {
    const sqft = calculateSqft(ltu.height, ltu.width)
    const rate = PRICES.livingRoomTallUnitFinish[ltu.tallPantryFinish as keyof typeof PRICES.livingRoomTallUnitFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Tall Unit',
        subLabel: `Carcass ${ltu.tallPantryFinish}`,
        l: parseFloat(ltu.height) || 0,
        b: parseFloat(ltu.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Back Panel
  const bp = comps.backPanel || {}
  if (bp.height && bp.width && bp.loftType) {
    const sqft = calculateSqft(bp.height, bp.width)
    const rate = PRICES.backPanelFinish[bp.loftType as keyof typeof PRICES.backPanelFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Back Panel',
        subLabel: bp.loftType,
        l: parseFloat(bp.height) || 0,
        b: parseFloat(bp.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Ledge/Shelf
  const ls = comps.ledgeShelf || {}
  const lsSqft = calculateSqft(ls.height, ls.width)
  const lsQty = parseFloat(ls.quantity) || 1
  if (lsSqft > 0) {
    items.push({
      label: 'Ledge/Shelf',
      subLabel: 'Sitting',
      l: parseFloat(ls.height) || 0,
      b: parseFloat(ls.width) || 0,
      sqft: lsSqft,
      quantity: lsQty,
      totalSqft: lsSqft * lsQty,
      rate: PRICES.ledgeShelf,
      amount: lsSqft * PRICES.ledgeShelf * lsQty
    })
  }

  // Fluted Panel
  const fp = comps.flutedPanel || {}
  const fpQty = parseFloat(fp.quantity) || 0
  if (fpQty > 0) {
    items.push({
      label: 'Wall Décor',
      subLabel: 'Fluted Panel',
      quantity: fpQty,
      totalSqft: fpQty,
      rate: PRICES.flutedPanel,
      amount: fpQty * PRICES.flutedPanel
    })
  }

  // Shoe Rack
  const sr = comps.shoeRack || {}
  if (sr.height && sr.width && sr.tallPantryFinish) {
    const sqft = calculateSqft(sr.height, sr.width)
    const rate = PRICES.livingRoomFinish[sr.tallPantryFinish as keyof typeof PRICES.livingRoomFinish] || 0
    if (sqft > 0 && rate > 0) {
      items.push({
        label: 'Shoe Rack',
        subLabel: `Carcass ${sr.tallPantryFinish}`,
        l: parseFloat(sr.height) || 0,
        b: parseFloat(sr.width) || 0,
        sqft,
        quantity: 1,
        totalSqft: sqft,
        rate,
        amount: sqft * rate
      })
    }
  }

  // Sitting with Cushion
  const swc = comps.sittingWithCushion || {}
  const swcSqft = calculateSqft(swc.height, swc.width)
  if (swcSqft > 0) {
    items.push({
      label: 'Sitting',
      subLabel: 'with Cushion',
      l: parseFloat(swc.height) || 0,
      b: parseFloat(swc.width) || 0,
      sqft: swcSqft,
      quantity: 1,
      totalSqft: swcSqft,
      rate: PRICES.sittingWithCushion,
      amount: swcSqft * PRICES.sittingWithCushion
    })
  }

  return items
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateData(body)

    const workbook = new Workbook()

    // ========================================
    // SHEET 1: Quotation (olive+HGL format)
    // ========================================
    const qs = workbook.addWorksheet('Quotation')

    // Company Header — Logo centered at top (replaces text)
    const logoPath = path.join(process.cwd(), 'upload', 'pioneer 2.jpg')
    const lw = validatedData.logoSettings?.width || 350
    const lh = validatedData.logoSettings?.height || 140
    const lpos = validatedData.logoSettings?.position || 'center'
    // Column positions: left=0.1, center=1.5, right=4 (approximate for 8-col sheet)
    const colPositions: Record<string, number> = { left: 0.1, center: 1.5, right: 4.5 }
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      const logoImageId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'jpeg',
      })
      qs.addImage(logoImageId, {
        tl: { col: colPositions[lpos] || 1.5, row: 0 },
        ext: { width: lw, height: lh },
      })
    }

    // Address below logo, centered
    qs.mergeCells('A3:H3')
    const c2 = qs.getCell('A3')
    c2.value = 'GAT. NO.63, PLOT NO. 6/B, A/P SHINDEWADI, TAL. BHOR, DIST. PUNE-412205'
    c2.font = { size: 10, name: 'Calibri' }
    c2.alignment = { horizontal: 'center' }

    // Date row - put DATE: label and value separately
    qs.getCell('E4').value = 'DATE:'
    qs.getCell('E4').font = { bold: true, name: 'Calibri' }
    qs.getCell('E4').alignment = { horizontal: 'right' }

    qs.mergeCells('F4:H4')
    const dateVal = qs.getCell('F4')
    dateVal.value = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    dateVal.font = { name: 'Calibri' }

    // To
    qs.getCell('B6').value = 'To,'
    qs.getCell('B6').font = { bold: true, name: 'Calibri' }

    // Client name (row 7 area)
    qs.mergeCells('B7:H7')
    qs.getCell('B7').value = validatedData.clientInfo.name || ''
    qs.getCell('B7').font = { bold: true, size: 12, name: 'Calibri' }

    // Empty rows
    // Row 8-9 empty

    // Subject
    qs.mergeCells('A10:H10')
    const subCell = qs.getCell('A10')
    subCell.value = 'SUB:- Tentative costing For Household Modular Furniture and Accessories at your Residence.'
    subCell.font = { bold: true, size: 11, name: 'Calibri' }

    // Table Header
    const headerRow = 12
    qs.getRow(headerRow).font = { bold: true, name: 'Calibri' }
    qs.getRow(headerRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }
    qs.getCell(`A${headerRow}`).value = 'Sr.No.'
    qs.getCell(`B${headerRow}`).value = 'Particulars'
    qs.getCell(`C${headerRow}`).value = 'Qty.'
    qs.getCell(`D${headerRow}`).value = 'Amount'

    // Collect all items with sections
    const livingRoomItems = getLivingRoomItems(validatedData.livingRoomEstimate)
    const kitchenItems = getKitchenItems(validatedData.components, validatedData.kitchenType)

    let rowNum = headerRow + 1
    let srNo = 1
    let totalAmount = 0

    // Helper to write a section
    const writeSection = (sectionName: string, items: ExportItem[]) => {
      if (items.length === 0) return

      // Section header
      qs.mergeCells(`B${rowNum}:D${rowNum}`)
      qs.getCell(`B${rowNum}`).value = sectionName
      qs.getCell(`B${rowNum}`).font = { bold: true, size: 12, name: 'Calibri' }
      rowNum++

      items.forEach((item) => {
        // Sr.No.
        qs.getCell(`A${rowNum}`).value = `${srNo}]`
        qs.getCell(`A${rowNum}`).font = { name: 'Calibri' }

        // Particulars
        if (item.label) {
          qs.getCell(`B${rowNum}`).value = item.label
          qs.getCell(`B${rowNum}`).font = { bold: true, name: 'Calibri' }
        }

        // Qty
        const qtyText = item.sqft ? (Math.round(item.sqft * 100) / 100).toFixed(2) : (item.quantity ? String(item.quantity) : '1')
        qs.getCell(`C${rowNum}`).value = qtyText
        qs.getCell(`C${rowNum}`).alignment = { horizontal: 'center' }
        qs.getCell(`C${rowNum}`).font = { name: 'Calibri' }

        // Amount
        if (item.amount > 0) {
          qs.getCell(`D${rowNum}`).value = Math.round(item.amount)
          qs.getCell(`D${rowNum}`).numFmt = '"₹"#,##0'
          qs.getCell(`D${rowNum}`).alignment = { horizontal: 'right' }
          qs.getCell(`D${rowNum}`).font = { name: 'Calibri' }
          totalAmount += item.amount
        }

        rowNum++

        // Sub-label row (indented detail)
        if (item.subLabel) {
          qs.mergeCells(`B${rowNum}:D${rowNum}`)
          qs.getCell(`B${rowNum}`).value = item.subLabel
          qs.getCell(`B${rowNum}`).alignment = { indent: 1 }
          qs.getCell(`B${rowNum}`).font = { size: 9, name: 'Calibri' }
          rowNum++
        }

        // Size detail row
        if (item.l && item.b) {
          qs.mergeCells(`B${rowNum}:D${rowNum}`)
          qs.getCell(`B${rowNum}`).value = `Size: ${item.l}mm x ${item.b}mm`
          qs.getCell(`B${rowNum}`).alignment = { indent: 1 }
          qs.getCell(`B${rowNum}`).font = { size: 9, name: 'Calibri' }
          rowNum++
        }

        srNo++
      })

      // Empty row after section
      rowNum++
    }

    // Write LIVING ROOM section
    if (validatedData.clientInfo.serviceType === 'Full Interior') {
      writeSection('LIVING ROOM ', livingRoomItems)
    }

    // Write KITCHEN section
    writeSection('KITCHEN', kitchenItems)

    // MISCELLANEOUS section
    const MISC_RATES: Record<string, Record<string, number>> = {
      ceilingMaterial: { Gypsum: 105, Acrylic: 160, ACP: 180, Armstrong: 115, Glass: 350, PVC: 125 },
      lightPoint: { 'Primary Light Point': 750, 'Secondary Light Point': 450, 'Half Plug Point': 400, 'Full Plug Point': 700, 'Concealed Light Fitting': 150, 'Fan Fitting': 150 },
      paint: { 'Luster Paint': 38, 'Texture Paint': 115, 'Plastic Paint': 33, 'Distemper Paint': 27 },
    }
    const misc = validatedData.miscEstimate
    let miscTotal = 0
    const miscExportItems: Array<{ label: string; qty?: string; amount: number }> = []

    if (misc) {
      // False Ceiling
      const fc = misc.falseCeiling || {}
      if (fc.height && fc.width && fc.material) {
        const sqft = (parseFloat(fc.height) * parseFloat(fc.width)) / 92903
        const rate = MISC_RATES.ceilingMaterial[fc.material] || 0
        const amt = Math.round(sqft * rate)
        if (amt > 0) {
          miscExportItems.push({
            label: `False Ceiling (${fc.type || fc.material})`,
            qty: sqft.toFixed(2) + ' sqft',
            amount: amt,
          })
          miscTotal += amt
        }
      }
      // Electrical Work (array)
      const ewItems = Array.isArray(misc.electricalWork) ? misc.electricalWork : []
      ewItems.forEach((ew: any) => {
        if (ew.lightPointType && ew.quantity) {
          const rate = MISC_RATES.lightPoint[ew.lightPointType] || 0
          const qty = parseFloat(ew.quantity) || 0
          const amt = Math.round(rate * qty)
          if (amt > 0) {
            miscExportItems.push({
              label: `Electrical - ${ew.lightPointType}`,
              qty: qty + ' nos',
              amount: amt,
            })
            miscTotal += amt
          }
        }
      })
      // Painting (array)
      const ptItems = Array.isArray(misc.painting) ? misc.painting : []
      ptItems.forEach((pt: any) => {
        if (pt.paintType && pt.totalArea) {
          const rate = MISC_RATES.paint[pt.paintType] || 0
          const area = parseFloat(pt.totalArea) || 0
          const amt = Math.round(rate * area)
          if (amt > 0) {
            miscExportItems.push({
              label: `Painting - ${pt.paintType}`,
              qty: area + ' sqft',
              amount: amt,
            })
            miscTotal += amt
          }
        }
      })
    }

    if (miscExportItems.length > 0) {
      qs.mergeCells(`B${rowNum}:D${rowNum}`)
      qs.getCell(`B${rowNum}`).value = 'MISCELLANEOUS'
      qs.getCell(`B${rowNum}`).font = { bold: true, size: 12, name: 'Calibri' }
      rowNum++

      miscExportItems.forEach((item) => {
        qs.getCell(`A${rowNum}`).value = `${srNo}]`
        qs.getCell(`A${rowNum}`).font = { name: 'Calibri' }

        qs.mergeCells(`B${rowNum}:C${rowNum}`)
        qs.getCell(`B${rowNum}`).value = item.label.toUpperCase()
        qs.getCell(`B${rowNum}`).font = { name: 'Calibri' }

        qs.getCell(`D${rowNum}`).value = item.amount
        qs.getCell(`D${rowNum}`).numFmt = '"₹"#,##0'
        qs.getCell(`D${rowNum}`).alignment = { horizontal: 'right' }
        qs.getCell(`D${rowNum}`).font = { name: 'Calibri' }

        srNo++
        rowNum++
      })

      rowNum++
    }

    // SUB TOTAL
    qs.mergeCells(`B${rowNum}:C${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'SUB TOTAL'
    qs.getCell(`B${rowNum}`).font = { bold: true, size: 12, name: 'Calibri' }
    qs.getCell(`D${rowNum}`).value = Math.round(totalAmount + miscTotal)
    qs.getCell(`D${rowNum}`).numFmt = '"₹"#,##0'
    qs.getCell(`D${rowNum}`).font = { bold: true, size: 12, name: 'Calibri' }
    qs.getCell(`D${rowNum}`).alignment = { horizontal: 'right' }
    rowNum++

    // GRAND TOTAL (All Inclusive)
    const grandTotal = Math.round(totalAmount + miscTotal)
    qs.mergeCells(`B${rowNum}:C${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'GRAND TOTAL (All Inclusive)'
    qs.getCell(`B${rowNum}`).font = { bold: true, size: 13, name: 'Calibri' }
    qs.getRow(rowNum).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4E157' }
    }
    qs.getCell(`D${rowNum}`).value = grandTotal
    qs.getCell(`D${rowNum}`).numFmt = '"₹"#,##0'
    qs.getCell(`D${rowNum}`).font = { bold: true, size: 13, name: 'Calibri' }
    qs.getCell(`D${rowNum}`).alignment = { horizontal: 'right' }
    rowNum += 2

    // TERMS & CONDITIONS
    qs.mergeCells(`B${rowNum}:H${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'TERMS & CONDITIONS:-'
    qs.getCell(`B${rowNum}`).font = { bold: true, size: 12, name: 'Calibri' }
    rowNum++

    const terms = [
      { no: '1]', text: 'Quotation is valid for One Month.' },
      { no: '2]', text: 'Any changes in design will be charged extra.' },
      { no: '3]', text: 'Advance 40% ,40% Pre dispatch stage & 20% Post Handover' },
      { no: '4]', text: 'Work will be commenced only after the Advance Given.' },
      { no: '5]', text: 'Hardware Fittings- HETTICH, All Door internal colour is same as External laminate' },
      { no: '', text: 'Delivery of Goods:- At site' },
      { no: '6]', text: 'The charges for Labour Unions & Mathadi Kamgar for  unloading upto the Installation will be borne by client.' },
      { no: '7]', text: 'Plumbing and Electrical fitting charges will be extra.' }
    ]

    terms.forEach((term) => {
      qs.mergeCells(`B${rowNum}:H${rowNum}`)
      qs.getCell(`B${rowNum}`).value = term.no ? `${term.no} ${term.text}` : `     ${term.text}`
      qs.getCell(`B${rowNum}`).font = { name: 'Calibri', size: 10 }
      if (term.no) {
        qs.getCell(`A${rowNum}`).value = term.no
        qs.getCell(`A${rowNum}`).font = { bold: true, name: 'Calibri', size: 10 }
        qs.getCell(`B${rowNum}`).value = term.text
      }
      rowNum++
    })

    rowNum++
    qs.mergeCells(`B${rowNum}:D${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'Regards,'
    qs.getCell(`B${rowNum}`).font = { name: 'Calibri' }
    rowNum++

    qs.mergeCells(`B${rowNum}:D${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'For Pioneer Enterprises'
    qs.getCell(`B${rowNum}`).font = { bold: true, name: 'Calibri' }
    rowNum++

    qs.mergeCells(`B${rowNum}:D${rowNum}`)
    qs.getCell(`B${rowNum}`).value = 'Mr.Milind Padgaonkar'
    qs.getCell(`B${rowNum}`).font = { name: 'Calibri' }

    // Set column widths for Quotation sheet
    qs.getColumn('A').width = 10
    qs.getColumn('B').width = 45
    qs.getColumn('C').width = 15
    qs.getColumn('D').width = 20
    qs.getColumn('E').width = 3
    qs.getColumn('F').width = 12
    qs.getColumn('G').width = 12
    qs.getColumn('H').width = 12

    // ========================================
    // SHEET 2: Workbook (olive Workbook format)
    // ========================================
    const ws = workbook.addWorksheet('Workbook')

    // Client name header
    ws.mergeCells('B1:I1')
    ws.getCell('B1').value = validatedData.clientInfo.name || ''
    ws.getCell('B1').font = { bold: true, size: 14, name: 'Calibri' }

    // Table headers (row 2)
    const wbHeaderRow = 2
    ws.getRow(wbHeaderRow).font = { bold: true, name: 'Calibri', size: 10 }
    ws.getCell(`B${wbHeaderRow}`).value = '' // Component name column
    ws.getCell(`C${wbHeaderRow}`).value = 'l'
    ws.getCell(`D${wbHeaderRow}`).value = 'b'
    ws.getCell(`E${wbHeaderRow}`).value = 'sq.ft'
    ws.getCell(`F${wbHeaderRow}`).value = 'Quantity'
    ws.getCell(`G${wbHeaderRow}`).value = 'Total quantity Sq.Ft'
    ws.getCell(`H${wbHeaderRow}`).value = 'Rate'
    ws.getCell(`I${wbHeaderRow}`).value = 'Amount'

    let wbRow = 3

    // Helper to write workbook section
    const writeWorkbookSection = (sectionName: string, items: ExportItem[]) => {
      if (items.length === 0) return

      // Section header
      ws.mergeCells(`B${wbRow}:I${wbRow}`)
      ws.getCell(`B${wbRow}`).value = sectionName
      ws.getCell(`B${wbRow}`).font = { bold: true, size: 12, name: 'Calibri' }
      wbRow++

      items.forEach((item) => {
        // Component name row
        if (item.label) {
          ws.mergeCells(`B${wbRow}:I${wbRow}`)
          ws.getCell(`B${wbRow}`).value = item.label
          ws.getCell(`B${wbRow}`).font = { bold: true, name: 'Calibri' }
          wbRow++
        }

        // Sub-label
        if (item.subLabel) {
          ws.getCell(`B${wbRow}`).value = item.subLabel
          ws.getCell(`B${wbRow}`).font = { name: 'Calibri', size: 10 }
        }

        // l
        ws.getCell(`C${wbRow}`).value = item.l || ''
        ws.getCell(`C${wbRow}`).font = { name: 'Calibri' }

        // b
        ws.getCell(`D${wbRow}`).value = item.b || ''
        ws.getCell(`D${wbRow}`).font = { name: 'Calibri' }

        // sq.ft
        ws.getCell(`E${wbRow}`).value = item.sqft ? (Math.round(item.sqft * 100) / 100).toFixed(2) : ''
        ws.getCell(`E${wbRow}`).font = { name: 'Calibri' }

        // Quantity
        ws.getCell(`F${wbRow}`).value = item.quantity || 1
        ws.getCell(`F${wbRow}`).font = { name: 'Calibri' }

        // Total quantity Sq.Ft
        const totalQtySqft = item.sqft ? (item.sqft * (item.quantity || 1)) : (item.quantity || 0)
        ws.getCell(`G${wbRow}`).value = totalQtySqft > 0 ? (Math.round(totalQtySqft * 100) / 100).toFixed(2) : ''
        ws.getCell(`G${wbRow}`).font = { name: 'Calibri' }

        // Rate
        ws.getCell(`H${wbRow}`).value = item.rate || ''
        ws.getCell(`H${wbRow}`).font = { name: 'Calibri' }

        // Amount
        ws.getCell(`I${wbRow}`).value = Math.round(item.amount)
        ws.getCell(`I${wbRow}`).numFmt = '"₹"#,##0'
        ws.getCell(`I${wbRow}`).font = { name: 'Calibri' }
        wbRow++

        // 5% row (margin)
        if (item.amount > 0) {
          ws.mergeCells(`B${wbRow}:H${wbRow}`)
          ws.getCell(`I${wbRow}`).value = Math.round(item.amount * 0.05)
          ws.getCell(`I${wbRow}`).numFmt = '"₹"#,##0'
          ws.getCell(`I${wbRow}`).font = { name: 'Calibri', size: 9, color: { argb: 'FF888888' } }
          wbRow++
        }
      })

      // Section subtotal
      if (items.length > 0) {
        const sectionTotal = Math.round(items.reduce((sum, item) => sum + item.amount, 0))
        ws.mergeCells(`B${wbRow}:H${wbRow}`)
        ws.getCell(`I${wbRow}`).value = sectionTotal
        ws.getCell(`I${wbRow}`).numFmt = '"₹"#,##0'
        ws.getCell(`I${wbRow}`).font = { bold: true, name: 'Calibri' }
        wbRow++
      }

      wbRow++ // Empty row after section
    }

    // Write sections
    if (validatedData.clientInfo.serviceType === 'Full Interior') {
      writeWorkbookSection('LIVING', livingRoomItems)
    }
    writeWorkbookSection('KITCHEN', kitchenItems)

    // Set column widths for Workbook sheet
    ws.getColumn('A').width = 2
    ws.getColumn('B').width = 35
    ws.getColumn('C').width = 8
    ws.getColumn('D').width = 8
    ws.getColumn('E').width = 10
    ws.getColumn('F').width = 10
    ws.getColumn('G').width = 20
    ws.getColumn('H').width = 10
    ws.getColumn('I').width = 15

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="estimate_${validatedData.clientInfo.name || 'client'}.xlsx"`
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
