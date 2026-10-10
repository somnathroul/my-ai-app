import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, StoreSettings } from '../types';

/**
 * Generates an authentic, professionally styled A4 Tax Invoice PDF
 * matching the JYOTI Kitchen and Home Appliances / store design.
 */
export function generateInvoicePdf(invoice: Invoice, settings: StoreSettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  const storeName = settings.storeName || 'JYOTI Kitchen and Home Appliances';
  const tagline = settings.tagline || 'Kitchen and Home Appliances';

  // ---------------------------------------------------------------------------
  // 1. TOP HEADER BRANDING & LOGO
  // ---------------------------------------------------------------------------
  let currentY = 12;

  // Header background banner (light clean slate)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  // JYOTI Emblem / Logo Graphic (Left)
  const logoX = margin + 3;
  const logoY = currentY + 3;
  const logoSize = 14;

  // Draw logo shield / rounded badge
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, 'F');

  // Inner flame / monogram accent
  doc.setFillColor(37, 99, 235); // blue-600
  doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, 4.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('J', logoX + logoSize / 2, logoY + logoSize / 2 + 2.8, { align: 'center' });

  // Store Title & Details
  const titleX = logoX + logoSize + 4;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(storeName.toUpperCase(), titleX, currentY + 8);

  // Tagline
  if (tagline) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text(tagline, titleX, currentY + 12);
  }

  // Address line
  const addressParts = [
    settings.address,
    settings.city,
    settings.state && settings.pincode
      ? `${settings.state} - ${settings.pincode}`
      : settings.state || settings.pincode,
  ].filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  if (addressParts.length > 0) {
    doc.text(addressParts.join(', '), titleX, currentY + 17);
  }

  // Contact line
  const contactParts: string[] = [];
  if (settings.phone) contactParts.push(`Phone: ${settings.phone}`);
  if (settings.altPhone) contactParts.push(`Alt: ${settings.altPhone}`);
  if (settings.email) contactParts.push(`Email: ${settings.email}`);

  if (contactParts.length > 0) {
    doc.text(contactParts.join('  |  '), titleX, currentY + 22);
  }

  // Right Header: Tax Invoice Pill & GST Details
  const rightX = margin + contentWidth - 3;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(rightX - 52, currentY + 3, 52, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TAX INVOICE / CASH MEMO', rightX - 26, currentY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ORIGINAL FOR RECIPIENT', rightX, currentY + 13.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(settings.gstin ? 'GSTIN / Tax ID:' : 'Tax Status:', rightX, currentY + 18, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.gstin || 'Composition / Unregistered', rightX, currentY + 22.5, { align: 'right' });

  if (settings.state || settings.stateCode) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `State: ${settings.state || '-'} ${settings.stateCode ? `(Code: ${settings.stateCode})` : ''}`,
      rightX,
      currentY + 27,
      { align: 'right' }
    );
  }

  currentY += 37;

  // ---------------------------------------------------------------------------
  // 2. CUSTOMER DETAILS & INVOICE METADATA BOX
  // ---------------------------------------------------------------------------
  const metaBoxHeight = 27;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, metaBoxHeight, 1.5, 1.5, 'FD');

  const halfWidth = contentWidth / 2;

  // Vertical divider between Customer & Invoice meta
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + halfWidth, currentY + 2, margin + halfWidth, currentY + metaBoxHeight - 2);

  // Left side: Customer Information
  const custX = margin + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CUSTOMER DETAILS)', custX, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customer.name || 'Walk-in Customer', custX, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Mobile / Phone: ${invoice.customer.phone || 'N/A'}`, custX, currentY + 15.5);

  if (invoice.customer.address) {
    const custAddr = invoice.customer.address.length > 45
      ? `${invoice.customer.address.substring(0, 42)}...`
      : invoice.customer.address;
    doc.text(`Address: ${custAddr}`, custX, currentY + 20);
  }

  if (invoice.customer.gstin) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Customer GSTIN: ${invoice.customer.gstin}`, custX, currentY + 24.5);
  }

  // Right side: Invoice Metadata
  const metaX = margin + halfWidth + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE METADATA', metaX, currentY + 5);

  const metaRightX = margin + contentWidth - 4;

  const printMetaRow = (label: string, value: string, yPos: number, isValueBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, metaX, yPos);

    doc.setFont('helvetica', isValueBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, metaRightX, yPos, { align: 'right' });
  };

  printMetaRow('Invoice No:', invoice.invoiceNumber, currentY + 10, true);
  printMetaRow('Date & Time:', `${invoice.date}   ${invoice.time}`, currentY + 14.5);
  printMetaRow('Payment Mode:', invoice.payment.mode, currentY + 19, true);

  const posText = invoice.isInterState
    ? 'Inter-State'
    : `${settings.state || 'Local'} (${settings.stateCode || '-'})`;
  printMetaRow('Place of Supply:', posText, currentY + 23.5);

  currentY += metaBoxHeight + 4;

  // ---------------------------------------------------------------------------
  // 3. PURCHASED PRODUCTS TABLE (jspdf-autotable)
  // ---------------------------------------------------------------------------
  const tableHeaders = [
    [
      '#',
      'Item Description',
      'HSN',
      'Qty',
      'Rate (Rs.)',
      'Taxable (Rs.)',
      invoice.isInterState ? 'IGST' : 'CGST / SGST',
      'Total (Rs.)',
    ],
  ];

  const tableBody = invoice.items.map((item, idx) => {
    let desc = item.name;
    const subLines: string[] = [];
    if (item.brand) subLines.push(`Brand: ${item.brand}`);
    if (item.serialNo) subLines.push(`S/N: ${item.serialNo}`);
    if (subLines.length > 0) {
      desc += `\n${subLines.join(' | ')}`;
    }

    const gstDesc = invoice.isInterState
      ? `Rs. ${item.igstAmount.toFixed(2)} (${item.gstRate}%)`
      : `${(item.gstRate / 2).toFixed(1)}% + ${(item.gstRate / 2).toFixed(1)}%\n(Rs. ${item.cgstAmount.toFixed(2)} ea)`;

    return [
      (idx + 1).toString(),
      desc,
      item.hsn || '-',
      `${item.quantity} ${item.unit || 'Pcs'}`,
      item.rate.toFixed(2),
      item.taxableAmount.toFixed(2),
      gstDesc,
      item.total.toFixed(2),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 54, halign: 'left' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  const finalTableY = (doc as any).lastAutoTable
    ? (doc as any).lastAutoTable.finalY
    : currentY + 60;

  currentY = finalTableY + 4;

  // Check if we need to start a new page for totals & footer
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 15;
  }

  // ---------------------------------------------------------------------------
  // 4. SUMMARY & TOTALS SECTION
  // ---------------------------------------------------------------------------
  const summaryBoxHeight = 44;
  const leftColWidth = 105;
  const rightColWidth = contentWidth - leftColWidth - 4; // 77mm

  // Left Column: Amount in Words & Bank Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, leftColWidth, summaryBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE AMOUNT IN WORDS:', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const wordsLines = doc.splitTextToSize(invoice.grandTotalInWords, leftColWidth - 6);
  doc.text(wordsLines, margin + 3, currentY + 9.5);

  // Bank & Payment Details
  let bankY = currentY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BANK & UPI PAYMENT DETAILS:', margin + 3, bankY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const bankLines: string[] = [];
  if (settings.bankName) bankLines.push(`Bank: ${settings.bankName}`);
  if (settings.accountNumber) bankLines.push(`A/C: ${settings.accountNumber}`);
  if (settings.ifscCode) bankLines.push(`IFSC: ${settings.ifscCode}`);
  if (settings.upiId) bankLines.push(`UPI ID: ${settings.upiId}`);

  bankLines.slice(0, 3).forEach((line, i) => {
    doc.text(line, margin + 3, bankY + 4.5 + i * 4);
  });

  if (invoice.payment.transactionRef) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Txn Ref: ${invoice.payment.transactionRef}`, margin + 3, bankY + 16.5);
  }

  // Right Column: Financial Totals Card
  const rightBoxX = margin + leftColWidth + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightBoxX, currentY, rightColWidth, summaryBoxHeight, 1.5, 1.5, 'FD');

  const printCalcRow = (label: string, amount: string, yPos: number, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, rightBoxX + 3, yPos);
    doc.text(`Rs. ${amount}`, rightBoxX + rightColWidth - 3, yPos, { align: 'right' });
  };

  let calcY = currentY + 5;
  printCalcRow('Taxable Subtotal:', invoice.taxableTotal.toFixed(2), calcY);

  calcY += 4.5;
  if (!invoice.isInterState) {
    printCalcRow('Total CGST:', invoice.cgstTotal.toFixed(2), calcY);
    calcY += 4;
    printCalcRow('Total SGST:', invoice.sgstTotal.toFixed(2), calcY);
  } else {
    printCalcRow('Total IGST:', invoice.igstTotal.toFixed(2), calcY);
  }

  calcY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(rightBoxX + 3, calcY - 0.5, rightBoxX + rightColWidth - 3, calcY - 0.5);
  printCalcRow('Total Tax (GST):', invoice.totalGst.toFixed(2), calcY + 3, true);
  calcY += 6;

  if (invoice.discountAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61); // green-700
    doc.setFontSize(7.5);
    doc.text('Discount:', rightBoxX + 3, calcY);
    doc.text(`-Rs. ${invoice.discountAmount.toFixed(2)}`, rightBoxX + rightColWidth - 3, calcY, { align: 'right' });
    calcY += 4.5;
  }

  if (invoice.roundOff !== 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text('Round Off:', rightBoxX + 3, calcY);
    const roStr = invoice.roundOff > 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2);
    doc.text(`Rs. ${roStr}`, rightBoxX + rightColWidth - 3, calcY, { align: 'right' });
    calcY += 4;
  }

  // Grand Total Highlight Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(rightBoxX + 2, currentY + summaryBoxHeight - 9.5, rightColWidth - 4, 8, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('GRAND TOTAL:', rightBoxX + 4, currentY + summaryBoxHeight - 4.5);

  doc.setFontSize(10);
  doc.text(
    `Rs. ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    rightBoxX + rightColWidth - 4,
    currentY + summaryBoxHeight - 4.5,
    { align: 'right' }
  );

  currentY += summaryBoxHeight + 5;

  // ---------------------------------------------------------------------------
  // 5. TERMS & CONDITIONS AND AUTHORIZED SIGNATORY
  // ---------------------------------------------------------------------------
  if (currentY > pageHeight - 38) {
    doc.addPage();
    currentY = 15;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4;

  const termsWidth = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS:', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const termsToPrint = settings.terms && settings.terms.length > 0
    ? settings.terms.slice(0, 3)
    : [
        'Goods once sold will not be taken back without original tax invoice.',
        'Warranty of appliances & electronics as per manufacturer policy only.',
        'Physical damage or seal tampering voids all warranties.',
      ];

  termsToPrint.forEach((term, idx) => {
    doc.text(`${idx + 1}. ${term}`, margin, currentY + 3.5 + idx * 3.5);
  });

  // Signatory Box on the Right
  const signX = margin + contentWidth - 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${storeName}`, signX + 24, currentY, { align: 'center' });

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.line(signX, currentY + 12, signX + 48, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', signX + 24, currentY + 15, { align: 'center' });

  // ---------------------------------------------------------------------------
  // 6. THANK YOU FOOTER
  // ---------------------------------------------------------------------------
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Thank you for your business! For service & warranty claims, please preserve this bill.',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the invoice as a formatted PDF file.
 */
export function downloadInvoicePdf(invoice: Invoice, settings: StoreSettings): void {
  const doc = generateInvoicePdf(invoice, settings);
  const cleanNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Invoice_${cleanNumber}.pdf`);
}

/**
 * Returns a File object representing the generated PDF for sharing.
 */
export function getInvoicePdfFile(invoice: Invoice, settings: StoreSettings): File {
  const doc = generateInvoicePdf(invoice, settings);
  const blob = doc.output('blob');
  const cleanNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Invoice_${cleanNumber}.pdf`;
  return new File([blob], fileName, { type: 'application/pdf' });
}

/**
 * Shares the invoice via Web Share API with file attachment if supported,
 * otherwise falls back cleanly to the existing WhatsApp text-sharing functionality.
 */
export async function shareInvoicePdfOrWhatsApp(
  invoice: Invoice,
  settings: StoreSettings
): Promise<{ success: boolean; method: 'web-share-file' | 'whatsapp-fallback' }> {
  const storeName = settings.storeName || 'JYOTI Kitchen and Home Appliances';
  const cleanPhone = invoice.customer.phone ? invoice.customer.phone.replace(/[^0-9]/g, '') : '';

  // Generate plain-text summary (existing WhatsApp format)
  const itemsList = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name} (Qty: ${item.quantity}) - Rs. ${item.total.toLocaleString('en-IN')}`
    )
    .join('%0A');

  const textMessage =
    `*Tax Invoice from ${storeName}*%0A` +
    `--------------------------------%0A` +
    `*Invoice No:* ${invoice.invoiceNumber}%0A` +
    `*Date:* ${invoice.date} ${invoice.time}%0A` +
    `*Customer:* ${invoice.customer.name} (${invoice.customer.phone})%0A%0A` +
    `*Items:*%0A${itemsList}%0A%0A` +
    `*Taxable Amount:* Rs. ${invoice.taxableTotal.toLocaleString('en-IN')}%0A` +
    `*Total GST:* Rs. ${invoice.totalGst.toLocaleString('en-IN')}%0A` +
    (invoice.discountAmount > 0
      ? `*Discount:* -Rs. ${invoice.discountAmount.toLocaleString('en-IN')}%0A`
      : '') +
    `*Grand Total:* Rs. ${invoice.grandTotal.toLocaleString('en-IN')}%0A` +
    `*Payment Mode:* ${invoice.payment.mode}%0A` +
    `--------------------------------%0A` +
    `*Thank you for choosing ${storeName}!*%0A` +
    (settings.phone ? `Helpline: ${settings.phone}` : '');

  // Attempt Web Share API with PDF file
  try {
    const pdfFile = getInvoicePdfFile(invoice, settings);

    const isShareSupported =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function';

    const canShareFiles =
      isShareSupported &&
      typeof navigator.canShare === 'function' &&
      (() => {
        try {
          return navigator.canShare({ files: [pdfFile] });
        } catch {
          return false;
        }
      })();

    if (canShareFiles) {
      await navigator.share({
        files: [pdfFile],
        title: `Bill ${invoice.invoiceNumber} - ${storeName}`,
        text: `Tax Invoice #${invoice.invoiceNumber} from ${storeName} for ${invoice.customer.name}`,
      });
      return { success: true, method: 'web-share-file' };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // User dismissed share dialog
      return { success: false, method: 'web-share-file' };
    }
    console.warn('Web Share API file share failed; falling back to WhatsApp text sharing:', err);
  }

  // Graceful Fallback: WhatsApp text sharing
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${textMessage}`
    : `https://wa.me/?text=${textMessage}`;

  window.open(waUrl, '_blank');
  return { success: true, method: 'whatsapp-fallback' };
}
