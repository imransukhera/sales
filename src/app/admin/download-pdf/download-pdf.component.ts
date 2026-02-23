import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-download-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss'
})
export class DownloadPdfComponent {

  @Input() filteredList: any[] = [];
  @Input() qtyValue: any[] = [];

  downloadPdf(): void {
    if (!this.filteredList || this.filteredList.length === 0) {
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ledger Report', 14, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.text(`Generated: ${today}`, 14, 22);

    const headers = [
      'Sr.No', 'Vendor', 'Export GD', 'Order Number', 'Import GD',
      'Date of Export', 'Export HS Code', 'Import HS Code',
      'Date Of Consumption', 'Analysis Card', 'UOM', 'Type Of Export',
      'Qty', 'FYC', 'Amount', 'Balance'
    ];

    const importQty = Number(this.qtyValue?.[0]?.qty) || 0;
    const body = this.filteredList.map((item: any, index: number) => {
      const consumed = this.filteredList
        .slice(0, index + 1)
        .reduce((sum: number, r: any) => sum + (Number(r?.qty) || 0), 0);
      const balance = importQty - consumed;
      return [
        index + 1,
        item?.vendor ?? '',
        item?.GD_Invoice ?? '',
        item?.orderNumber ?? '',
        item?.importID ?? '',
        item?.dateOfExport ?? '',
        item?.HS_Code ?? '',
        item?.impoortHS_Code ?? '',
        item?.dateOfConsumption ?? '',
        item?.analysisCard ?? '',
        item?.unit ?? '',
        item?.type_Of_Export ?? '',
        item?.qty ?? '',
        item?.rate ?? '',
        item?.Amount ?? '',
        balance
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [36, 90, 112],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7
      },
      alternateRowStyles: {
        fillColor: [241, 247, 250]
      },
      columnStyles: {
        0:  { cellWidth: 10 },
        1:  { cellWidth: 20 },
        2:  { cellWidth: 22 },
        3:  { cellWidth: 22 },
        4:  { cellWidth: 22 },
        5:  { cellWidth: 20 },
        6:  { cellWidth: 18 },
        7:  { cellWidth: 18 },
        8:  { cellWidth: 22 },
        9:  { cellWidth: 18 },
        10: { cellWidth: 12 },
        11: { cellWidth: 18 },
        12: { cellWidth: 12 },
        13: { cellWidth: 12 },
        14: { cellWidth: 14 },
        15: { cellWidth: 14 }
      },
      margin: { top: 28, left: 5, right: 5 },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 5
        );
      }
    });

    doc.save('Ledger-Report.pdf');
  }
}
