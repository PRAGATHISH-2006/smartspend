// PDF Report Generator Service for SmartSpend using jsPDF and jspdf-autotable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UnifiedTransaction, CategorySpending } from '../types/financial';
import { formatINR } from '../utils/currency';
import { format, parseISO } from 'date-fns';
import { getProxyEndpoints } from './emailReportService';

export interface MonthStatementPdfParams {
  monthName: string; // e.g. "October_2026"
  monthDisplay: string; // e.g. "October 2026"
  startDate: string; // e.g. "2026-10-01"
  endDate: string; // e.g. "2026-10-31"
  startingBalance: number;
  totalMoneyAdded: number;
  totalExpenses: number;
  closingBalance: number;
  rolloverAmount: number;
  recipientEmail?: string;
  transactions: UnifiedTransaction[];
  categoryBreakdown?: CategorySpending[];
}

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  filename: string;
  base64: string;
}

/**
 * Generate a PDF Statement for the closed month with month name
 */
export function generateMonthStatementPdf(params: MonthStatementPdfParams): GeneratedPdfResult {
  const {
    monthName,
    monthDisplay,
    startDate,
    endDate,
    startingBalance,
    totalMoneyAdded,
    totalExpenses,
    closingBalance,
    rolloverAmount,
    recipientEmail = 'selvanpragathish@gmail.com',
    transactions,
    categoryBreakdown = [],
  } = params;

  const filename = `${monthName}_Transactions.pdf`;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Emerald Header Banner
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title text in banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SMARTSPEND MONTHLY FINANCIAL STATEMENT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(209, 250, 229);
  doc.text(`Month: ${monthDisplay}   |   Cycle Period: ${startDate} to ${endDate}`, 14, 20);

  // 2. Metadata details row
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.text(`Account: ${recipientEmail}`, 14, 34);
  doc.text(`Generated On: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, pageWidth - 14, 34, {
    align: 'right',
  });

  // 3. Executive KPI Summary Cards (4 Balanced Equal-Width Metric Cards)
  const cardY = 38;
  const cardHeight = 24;
  const marginX = 14;
  const availableWidth = pageWidth - marginX * 2; // 182mm
  const cardGap = 3.5;
  const cardWidth = (availableWidth - cardGap * 3) / 4; // ~42.8mm per card

  const kpis = [
    {
      title: 'Starting Balance',
      value: formatINR(startingBalance),
      color: [15, 23, 42],
      bgColor: [248, 250, 252],
      borderColor: [226, 232, 240],
    },
    {
      title: 'Money Added (+)',
      value: `+${formatINR(totalMoneyAdded)}`,
      color: [5, 150, 105],
      bgColor: [236, 253, 245],
      borderColor: [167, 243, 208],
    },
    {
      title: 'Total Expenses (-)',
      value: `-${formatINR(totalExpenses)}`,
      color: [220, 38, 38],
      bgColor: [254, 242, 242],
      borderColor: [254, 202, 202],
    },
    {
      title: 'Rollover Surplus',
      value: formatINR(rolloverAmount),
      color: [4, 120, 87],
      bgColor: [209, 250, 229],
      borderColor: [52, 211, 153],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = marginX + idx * (cardWidth + cardGap);
    // Draw background card
    doc.setFillColor(kpi.bgColor[0], kpi.bgColor[1], kpi.bgColor[2]);
    doc.setDrawColor(kpi.borderColor[0], kpi.borderColor[1], kpi.borderColor[2]);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.title.toUpperCase(), x + cardWidth / 2, cardY + 7, { align: 'center' });

    // Amount Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + cardWidth / 2, cardY + 16, { align: 'center' });
  });

  let currentY = cardY + cardHeight + 8; // ~70mm

  // 4. Category Breakdown Table
  if (categoryBreakdown && categoryBreakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Spending Breakdown by Category', 14, currentY);

    const catRows = categoryBreakdown.map((c) => [
      c.name,
      formatINR(c.amount),
      `${c.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Category', 'Amount Incurred', '% Share']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'right' },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Complete Chronological Transaction Ledger Table
  // Sort transactions chronologically (newest first, secondary sort by ID)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    if (dateB !== dateA) {
      return dateB.localeCompare(dateA);
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Complete Transaction Ledger (${sortedTransactions.length} Records)`, 14, currentY);

  const txRows = sortedTransactions.map((tx) => {
    const isIncome = tx.rawType === 'income';
    const amountStr = isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`;
    const typeLabel =
      tx.type === 'money_added'
        ? 'Wallet Top-up'
        : tx.type === 'fixed_expense'
        ? 'Daily Fixed'
        : tx.type === 'skipped_fixed_expense'
        ? 'Skipped Fixed'
        : 'Manual Expense';

    return [
      tx.date || '',
      typeLabel,
      tx.category || 'Other',
      tx.name || '',
      amountStr,
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', 'Type', 'Category', 'Description', 'Amount (INR)']],
    body: txRows,
    theme: 'striped',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      1: { cellWidth: 30, halign: 'left' },
      2: { cellWidth: 32, halign: 'left' },
      3: { cellWidth: 'auto', halign: 'left' },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Synchronize Amount header alignment with column alignment
      if (data.column.index === 4 && data.section === 'head') {
        data.cell.styles.halign = 'right';
      }
      if (data.column.index === 0 && data.section === 'head') {
        data.cell.styles.halign = 'center';
      }
      // Highlight amounts: green for top-up, red for expenses
      if (data.column.index === 4 && data.section === 'body') {
        const val = String(data.cell.raw || '');
        if (val.startsWith('+')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { top: 32, bottom: 18, left: 14, right: 14 },
  });

  // 6. Professional Footer on Every Page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Subtle divider line above footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);

    doc.text(
      `SmartSpend Financial Archival Engine • Google Drive Cloud Backup`,
      14,
      pageHeight - 6
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  const blob = doc.output('blob');
  const base64 = doc.output('datauristring');

  return {
    doc,
    blob,
    filename,
    base64,
  };
}

/**
 * Trigger immediate client-side download of the PDF file
 */
export function downloadPdfDocument(filename: string, doc: jsPDF) {
  if (typeof window !== 'undefined') {
    doc.save(filename);
  }
}

export const DEFAULT_GDRIVE_WEBHOOK_URL =
  process.env.EXPO_PUBLIC_GOOGLE_DRIVE_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbwvX1VHlHlUQvBGfybe04iDpL9euETLyXG3bnK8zYvJplsO_6W-KiHZP3nwOww_utCpTg/exec';

export interface GoogleDriveUploadResult {
  success: boolean;
  message: string;
  fileUrl?: string;
  fileId?: string;
  needsWebhookUrl?: boolean;
  error?: string;
}

/**
 * Upload PDF to Google Drive via local proxy / Google Apps Script Webhook
 */
export async function uploadPdfToGoogleDrive(params: {
  filename: string;
  base64: string;
  webhookUrl?: string;
}): Promise<GoogleDriveUploadResult> {
  const { filename, base64, webhookUrl } = params;
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const targetWebhook = webhookUrl || DEFAULT_GDRIVE_WEBHOOK_URL;

  // 1. Try local proxy server candidates first
  const endpoints = getProxyEndpoints('/api/upload-to-drive');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          base64: cleanBase64,
          webhookUrl: targetWebhook,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            message: data.message || `Successfully uploaded ${filename} to Google Drive!`,
            fileUrl: data.fileUrl,
            fileId: data.fileId,
          };
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  // 2. Direct upload fallback to Google Apps Script Webhook
  try {
    console.log('[Google Drive] Uploading directly to Google Apps Script Webhook...');
    const gResponse = await fetch(targetWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        filename: filename || 'Transactions.pdf',
        base64: cleanBase64,
        folderId: '1AJzY39IKyCTR0d7HspLN0bMk609kITT2',
      }),
      redirect: 'follow',
    });

    const gText = await gResponse.text();
    let gData: any = {};
    try {
      gData = JSON.parse(gText);
    } catch {
      gData = { raw: gText };
    }

    const isOk = gResponse.ok && gData.status !== 'error';
    return {
      success: isOk,
      message: isOk
        ? `Successfully uploaded ${filename} to Google Drive!`
        : gData.message || 'Google Drive upload failed',
      fileUrl: gData.url || gData.fileUrl,
      fileId: gData.fileId || gData.id,
      error: isOk ? undefined : gData.message,
    };
  } catch (err: any) {
    console.warn('[Google Drive] Direct upload error:', err);
    return {
      success: false,
      message: 'Failed to upload to Google Drive',
      error: err.message || String(err),
    };
  }
}

