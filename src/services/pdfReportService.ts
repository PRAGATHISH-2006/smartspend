// PDF Report Generator Service for SmartSpend using jsPDF and jspdf-autotable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UnifiedTransaction, CategorySpending } from '../types/financial';
import { formatINR } from '../utils/currency';
import { format, parseISO } from 'date-fns';

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

  // 1. Top Emerald Banner
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title text in banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SMARTSPEND MONTHLY FINANCIAL STATEMENT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(209, 250, 229);
  doc.text(`Month: ${monthDisplay} | Period: ${startDate} to ${endDate}`, 14, 21);

  // 2. Metadata details
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Account Owner: ${recipientEmail}`, 14, 34);
  doc.text(`Generated On: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, pageWidth - 14, 34, {
    align: 'right',
  });

  // 3. Executive Summary KPI Grid (Box)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, pageWidth - 28, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Closed Month Financial Summary', 18, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Column 1: Starting & Added
  doc.text('Starting Balance:', 18, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(startingBalance), 65, 52, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Money Added:', 18, 59);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`+${formatINR(totalMoneyAdded)}`, 65, 59, { align: 'right' });

  // Column 2: Expenses & Closing Net
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Expenses Incurred:', 80, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`-${formatINR(totalExpenses)}`, 140, 52, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Closing Net Balance:', 80, 59);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(closingBalance), 140, 59, { align: 'right' });

  // Column 3: Rollover Surplus Highlight
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(146, 42, 50, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('ROLLED OVER TO NEXT MONTH', 171, 48, { align: 'center' });

  doc.setFontSize(14);
  doc.text(formatINR(rolloverAmount), 171, 58, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Added as starting balance', 171, 64, { align: 'center' });

  // 4. Category Breakdown Table
  let currentY = 80;

  if (categoryBreakdown && categoryBreakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Spending by Category', 14, currentY);

    const catRows = categoryBreakdown.map((c) => [
      c.name,
      formatINR(c.amount),
      `${c.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Category', 'Amount Incurred', '% of Total']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // 5. Complete Transaction Details Ledger Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Full Transaction Details (${transactions.length} Records)`, 14, currentY);

  const txRows = transactions.map((tx) => {
    const isIncome = tx.rawType === 'income';
    const amountStr = isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`;
    const typeLabel =
      tx.type === 'money_added'
        ? 'Wallet Top-up'
        : tx.type === 'fixed_expense'
        ? 'Fixed / Recurring'
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
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Highlight amounts
      if (data.column.index === 4 && data.section === 'body') {
        const val = String(data.cell.raw || '');
        if (val.startsWith('+')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Page Numbers and Google Drive Backup Link in Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `SmartSpend Permanent Google Drive Archive: https://drive.google.com/drive/folders/1AJzY39IKyCTR0d7HspLN0bMk609kITT2?usp=sharing`,
      14,
      doc.internal.pageSize.getHeight() - 6
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 6,
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

  try {
    const res = await fetch('http://localhost:3001/api/upload-to-drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        base64: cleanBase64,
        webhookUrl,
      }),
    });

    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || (data.success ? 'Uploaded to Google Drive!' : data.error),
      fileUrl: data.fileUrl,
      fileId: data.fileId,
      needsWebhookUrl: data.needsWebhookUrl,
      error: data.error,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not connect to upload proxy',
      error: err.message || String(err),
    };
  }
}

