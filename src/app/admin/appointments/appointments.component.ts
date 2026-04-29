import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { EditorModule } from 'primeng/editor';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalendarModule } from 'primeng/calendar';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorModule, ReactiveFormsModule, DropdownModule, ToastModule, TableModule, FormsModule, TooltipModule, CalendarModule],
  providers: [MessageService],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  receipts: any;
  importDateRange: Date[] = []
  pdfUrl: any;
  subject: any = 'J-Invoice Generated – TCN Details';
  body: any;
  StatusValue: any;
  UnitValue: any;
  text: string | undefined;
  @ViewChild('invoice', { static: false }) invoice!: ElementRef;
  appList: any;
  visible: boolean = false;
  emailDilog: boolean = false;
  balanceFrozen: boolean = false;
  editForm!: FormGroup;
  selectedId: string = '';
  appointment: any;
  DCNNumber: any;
  isEditMode = false;
  filteredList: any;
  private currentSub?: Subscription;
  uniqueImportIDs: any[] = [];
  uniqueHSCodes: any[] = [];
  statusArray: any = [
    {
      status: 'Raw Material'
    },
    {
      status: 'Machinery Parts'
    },
    {
      status: 'Machinery'
    },
    {
      status: 'All'
    }
  ]

  UOM: any = [
    {
      status: 'Yards'
    },
    {
      status: 'Mm'
    },
    {
      status: 'GSM'
    },
    {
      status: 'All'
    }
  ]

  data: any;
  uplloadDailog: boolean = false;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,

  ) {
    this.getEm();
  }

  ngOnInit() {
    this.setDefaultDateRange();
    this.editForm = this.fb.group({
      vendor: [''],
      importID: ['', Validators.required],
      dateOfImport: ['', Validators.required],
      dateOfExport: [''],
      dateOfApplied: [''],
      HS_Code: ['', Validators.required],
      Sales_Tax: [0, Validators.required],
      Custom_Duty: [0, Validators.required],
      Income_Tax: [0, Validators.required],
      FED: [0, Validators.required],
      Additional_Custom_Duty: [0, Validators.required],
      Additional_Sales_Tax: [0, Validators.required],
      type: ['', Validators.required],
      qty: [0, Validators.required],
      rate: [0, Validators.required],
      total: [0, Validators.required],
      amountValue: [''],
      unit: ['', Validators.required],
      status: [''],
      descriptionofMaterial: [''],
      grandsTotal: [0, Validators.required],
      id: [''],
    });

    this.editForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotals();
    });



  }

  calculateTotals() {
    const form = this.editForm;

    const qty = Number(form.get('qty')?.value) || 0;
    const rate = Number(form.get('rate')?.value) || 0;
    const total = qty * rate;
    form.get('total')?.setValue(total, { emitEvent: false }); // prevent recursion

    // Taxes / Duties
    const customDuty = Number(form.get('Custom_Duty')?.value) || 0;
    const addCustomDuty = Number(form.get('Additional_Custom_Duty')?.value) || 0;
    const salesTax = Number(form.get('Sales_Tax')?.value) || 0;
    const addSalesTax = Number(form.get('Additional_Sales_Tax')?.value) || 0;
    const incomeTax = Number(form.get('Income_Tax')?.value) || 0;
    const fed = Number(form.get('FED')?.value) || 0;

    const grandsTotal = total + customDuty + addCustomDuty + salesTax + addSalesTax + incomeTax + fed;
    form.get('grandsTotal')?.setValue(grandsTotal, { emitEvent: false });
  }



  setDefaultDateRange() {
    const today = new Date();
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
    this.importDateRange = [twoMonthsAgo, today];
  }

  getEm() {
    this.currentSub?.unsubscribe();
    this.currentSub = this.appService.getImportsPage(500).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.appList = res;
        this.filteredList = res;
        this.buildDropdownOptions(res);
      }
    });
  }

  buildDropdownOptions(data: any[]) {
    const seenIDs = new Set<string>();
    const seenHS = new Set<string>();
    this.uniqueImportIDs = [];
    this.uniqueHSCodes = [];
    for (const item of data) {
      if (item.importID && !seenIDs.has(item.importID)) {
        seenIDs.add(item.importID);
        this.uniqueImportIDs.push(item);
      }
      if (item.HS_Code && !seenHS.has(item.HS_Code)) {
        seenHS.add(item.HS_Code);
        this.uniqueHSCodes.push(item);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentSub?.unsubscribe();
  }

  closeDialog() {
    this.isEditMode = false;
    this.editForm.reset();
    this.visible = false;
  }

  openEditDialog(appointment: any) {
    this.isEditMode = true;
    this.appointment = appointment;
    this.visible = true;
    this.selectedId = appointment.id;
    this.DCNNumber = this.appointment?.DCN;
    this.editForm.patchValue({
      vendor: appointment.vendor,
      importID: appointment.importID,
      dateOfImport: appointment.dateOfImport,
      dateOfExport: appointment.dateOfExport,
      dateOfApplied: appointment.dateOfApplied,
      HS_Code: appointment.HS_Code,
      Sales_Tax: appointment.Sales_Tax,
      Custom_Duty: appointment.Custom_Duty,
      Income_Tax: appointment.Income_Tax,
      FED: appointment.FED,
      Additional_Custom_Duty: appointment.Additional_Custom_Duty,
      Additional_Sales_Tax: appointment.Additional_Sales_Tax,
      type: appointment.type,
      qty: appointment.qty,
      rate: appointment.rate,
      total: appointment.total,
      id: appointment.id,
      status: appointment.status,
      unit: appointment.unit,
      descriptionofMaterial: appointment.descriptionofMaterial,
      grandsTotal: appointment.grandsTotal,
    });
  }


  // Update Firestore
  submit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    let value = this.editForm.value;

    const isDuplicate = this.appList.some((data: any) => data?.importID === value?.importID);
    if (isDuplicate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Duplicated',
        detail: 'This GD number already exists.'
      });
      return;
    }

    this.visible = false;
    this.appointmentService
      .addAppointment(value)
      .then(() => {
        this.editForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Imports successfully Added'
        });

      });
  }


  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);

    if (target.files.length !== 1) {
      return;
    }

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      const raw = XLSX.utils.sheet_to_json(worksheet);
      const rows = raw.map((row: any) => {
        const trimmed: any = {};
        Object.keys(row).forEach(key => trimmed[key.trim()] = row[key]);
        return trimmed;
      });

      this.uploadExcelData(rows);
    };

    reader.readAsArrayBuffer(target.files[0]);
  }

  async uploadExcelData(data: any[]) {
    this.isUploading = true;
    this.uploadProgress = 0;

    const payloads = data.map(row => ({
      vendor: row['Vendor'] || '',
      importID: row['Import GD'] || '',
      dateOfImport: this.excelDateToJSDate(row['Date Of Import']),
      dateOfExport: this.excelDateToJSDate(row['Date Of Expiry']),
      dateOfApplied: row['Date Of Applied'] || '',
      HS_Code: row['HS Code'] || '',
      unit: row['UOM'] || '',
      descriptionofMaterial: row['Description of Material'] || '',
      type: row['Type'] || row['Type of Material'] || '',
      qty: row['Qty'] || 0,
      rate: row['FCY'] || 0,
      total: row['Amount'] || '',
      Custom_Duty: row['Custom Duty'] || 0,
      Additional_Custom_Duty: row['Add Custom Duty'] || 0,
      Sales_Tax: row['Sales Tax'] || 0,
      Additional_Sales_Tax: row['Add Sales Tax'] || 0,
      Income_Tax: row['Income Tax'] || 0,
      FED: row['FED'] || 0,
      status: row['Status'] || '',
      grandsTotal: row['Grands Amount'] || 0,
    }));

    await this.appointmentService.batchAddAppointments(payloads, (done, total) => {
      this.uploadProgress = Math.round((done / total) * 100);
    });

    this.isUploading = false;
    this.uploadProgress = 0;
    this.messageService.add({
      severity: 'success',
      summary: 'Uploaded',
      detail: `All ${payloads.length} entries imported successfully`
    });
    this.uplloadDailog = false;
  }

  excelDateToJSDate(excelDate: any): string {
    if (!excelDate) return '';

    // If already a Date object
    if (excelDate instanceof Date) {
      return excelDate.toISOString().split('T')[0];
    }

    // If Excel serial number
    if (typeof excelDate === 'number') {
      const utc_days = Math.floor(excelDate - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);

      return date_info.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    return excelDate;
  }

  // Update Firestore
  update() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    let value = this.editForm.value;

    const isDuplicate = this.appList.some((data: any) =>
      data?.importID === value?.importID && data?.id !== value?.id
    );

    if (isDuplicate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Duplicate',
        detail: 'This GD number already exists in another record.'
      });
      return;
    }

    this.visible = false;
    this.appointmentService
      .updateImports(value?.id, value)
      .then(() => {
        this.editForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Imports successfully Updated'
        });
      });
  }


  deleteValue(appointmentId: any) {
    this.appService.deleteImport(appointmentId)
      .catch(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete record.' });
        console.error('Error deleting:', err);
      });
  }

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('App List');

    // 🔹 Complete Table Headers
    worksheet.addRow([
      'Vendor',
      'Import GD',
      'Date Of Import',
      'Date Of Expiry',
      'HS Code',
      'UOM',
      'Type of Material',
      'Qty',
      'FCY',
      'Amount',
      'Custom Duty',
      'Add Custom Duty',
      'Sales Tax',
      'Add Sales Tax',
      'Income Tax',
      'FED',
      'Grands Amount',
      'Description of Material'
    ]);

    // 🔹 Header Styling
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // 🔹 Table Data
    this.appList.forEach((item: any) => {
      worksheet.addRow([
        item.vendor || '',
        item.importID || '',
        item.dateOfImport ? new Date(item.dateOfImport).toLocaleDateString('en-GB') : '',
        item.dateOfExport ? new Date(item.dateOfExport).toLocaleDateString('en-GB') : '',
        item.HS_Code || '',
        item.unit || '',
        item.type || '',
        item.qty || 0,
        item.rate || 0,
        item.total || 0,
        item.Custom_Duty || 0,
        item.Additional_Custom_Duty || 0,
        item.Sales_Tax || 0,
        item.Additional_Sales_Tax || 0,
        item.Income_Tax || 0,
        item.FED || 0,
        item.grandsTotal || 0,
        item?.descriptionofMaterial || ''
      ]);
    });

    // 🔹 Auto column width
    worksheet.columns.forEach(column => {
      column.width = 18;
    });

    // 🔹 Download Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      saveAs(blob, 'import-data.xlsx');
    });
  }


  search() {
    if (this.importDateRange?.length === 2 && this.importDateRange[1]) {
      const start = this.formatDate(this.importDateRange[0]);
      const end = this.formatDate(this.importDateRange[1]);
      this.appService.getImportsByDateRange(start, end).then(res => {
        let filtered = res;
        if (this.StatusValue) filtered = filtered.filter((i: any) => i.importID === this.StatusValue);
        if (this.UnitValue) filtered = filtered.filter((i: any) => i.HS_Code === this.UnitValue);
        this.appList = filtered;
      });
    } else {
      let filtered = this.filteredList || [];
      if (this.StatusValue) filtered = filtered.filter((i: any) => i.importID === this.StatusValue);
      if (this.UnitValue) filtered = filtered.filter((i: any) => i.HS_Code === this.UnitValue);
      this.appList = filtered;
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  resetFilters() {
    this.StatusValue = null;
    this.UnitValue = null;
    this.importDateRange = [];
    this.getEm();
  }


  downloadSampleFile() {
    const link = document.createElement('a');
    link.href = 'assets/samplefile.xlsx';
    link.download = 'Sample_Import_File.xlsx';
    link.click();
  }

}
