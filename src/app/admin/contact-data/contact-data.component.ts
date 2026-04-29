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
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalendarModule } from 'primeng/calendar';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-contact-data',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule, FormsModule, TableModule, CalendarModule],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  receipts: any;
  uplloadDailog: boolean = false;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  importDateRange: Date[] = [];
  UnitValue: any;
  filteredList: any;
  private currentSub?: Subscription;
  uniqueGDs: any[] = [];
  uniqueHSCodes: any[] = [];

  pdfUrl: any;
  subject: any = 'J-Invoice Generated – TCN Details';
  body: any;
  StatusValue: any;
  text: string | undefined;
  @ViewChild('invoice', { static: false }) invoice!: ElementRef;
  appList: any;
appData:any;
  visible: boolean = false;
  emailDilog: boolean = false;
  balanceFrozen: boolean = false;
  editForm!: FormGroup;
  selectedId: string = '';
  appointment: any;
  DCNNumber: any;
  isEditMode = false;
  impoortHS_Code: any;
  dataFilter: any;
  statusArray: any = [
    {
      status: 'Garments'
    },
    {
      status: 'Fabric'
    },
    {
      status: 'Shorts'
    },
    {
      status: 'Jackets'
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

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService) {
    this.getEm();
    this.getEmhhh();
  }

  ngOnInit() {
    this.setDefaultDateRange();
    this.editForm = this.fb.group({
      vendor: [''],
      GD_Invoice: [''],
      orderNumber: ['', Validators.required],
      importID: ['', Validators.required],
      dateOfExport: ['', Validators.required],
      type_Of_Export: ['', Validators.required],
      typeOfImport: ['', Validators.required],
      dateOfConsumption: ['', Validators.required],
      unit: ['', Validators.required],
      consumptionUOM: ['', Validators.required],
      analysisCard: ['', Validators.required],
      qty: [0, Validators.required],
      consumptionQty: [0, Validators.required],
      rate: [0, Validators.required],
      pkr: [0, Validators.required],
      Amount: [0, Validators.required],
      HS_Code: ['', Validators.required],
      impoortHS_Code: ['', Validators.required],
      id: [''],
    });

    this.editForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotals();
    });



  }

  allImports: any;


  calculateTotals() {
    const form = this.editForm;
    const qty = Number(form.get('qty')?.value) || 0;
    const rate = Number(form.get('rate')?.value) || 0;
    const amount = qty * rate;
    form.get('Amount')?.setValue(amount, { emitEvent: false });
  }

  pushValue() {
    const singleValue = {
      GD_Invoice: 'GD12345',
      Vendor: 'Vendor Name',
      Date: new Date().toISOString()
    };

    this.appointmentService.addExport(singleValue)
      .then((res) => {
        console.log('Export added successfully:', res);
        alert('Export added!');
      })
      .catch((err) => {
        console.error('Error adding export:', err);
        alert('Failed to add export');
      });
  }


  getEmhhh() {
    this.appService.getAllAppointments().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.dataFilter = res;
        this.allImports = res.filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.importID === item.importID)
        );
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentSub?.unsubscribe();
  }

  setDefaultDateRange() {
    const today = new Date();
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
    this.importDateRange = [twoMonthsAgo, today];
  }

  getEm() {
    this.currentSub?.unsubscribe();
    this.currentSub = this.appService.getExportsPage(500).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.appList = res;
        this.filteredList = res;
        this.buildDropdownOptions(res);
      }
    });
  }

  buildDropdownOptions(data: any[]) {
    const seenGDs = new Set<string>();
    const seenHS = new Set<string>();
    this.uniqueGDs = [];
    this.uniqueHSCodes = [];
    for (const item of data) {
      if (item.GD_Invoice && !seenGDs.has(item.GD_Invoice)) {
        seenGDs.add(item.GD_Invoice);
        this.uniqueGDs.push(item);
      }
      if (item.HS_Code && !seenHS.has(item.HS_Code)) {
        seenHS.add(item.HS_Code);
        this.uniqueHSCodes.push(item);
      }
    }
  }

  openEditDialog(appointment: any) {
    this.isEditMode = true
    this.appointment = appointment;
    this.visible = true;
    this.selectedId = appointment.id;
    this.DCNNumber = this.appointment?.DCN;
    this.editForm.patchValue({
      vendor: appointment.vendor,
      GD_Invoice: appointment.GD_Invoice,
      importID: appointment.importID,
      type_Of_Export: appointment.type_Of_Export,
      typeOfImport: appointment.typeOfImport,
      dateOfConsumption: appointment.dateOfConsumption,
      dateOfExport: appointment.dateOfExport,
      qty: appointment.qty,
      consumptionQty: appointment.consumptionQty,
      rate: appointment.rate,
      pkr: appointment.pkr,
      Amount: appointment.Amount,
      id: appointment.id,
      unit: appointment.unit,
      consumptionUOM: appointment.consumptionUOM,
      orderNumber: appointment.orderNumber,
      HS_Code: appointment.HS_Code,
      impoortHS_Code: appointment.impoortHS_Code,
      analysisCard: appointment.analysisCard,
    });
  }

  closeDialog() {
    this.isEditMode = false;
    this.editForm.reset();
    this.visible = false;
  }

  convertTo24Hour(time: string): string {
    const [t, modifier] = time.split(' '); // "09:00", "AM"
    let [hours, minutes] = t.split(':');

    if (modifier === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    }

    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours}:${minutes}`;
  }

  // Update Firestore
  submit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    let value = this.editForm.value;

    const isDuplicate = this.appList.some((data: any) => data?.GD_Invoice === value?.GD_Invoice);
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
      .addExport(value)
      .then(() => {
        this.editForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Add',
          detail: 'Exports successfully Added'
        });

      });
  }

  // Update Firestore
  update() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    let value = this.editForm.value;

    // FIX: Check for duplicates EXCEPT for the record with the current ID
    // const isDuplicate = this.appList.some((data: any) =>
    //   data?.GD_Invoice === value?.GD_Invoice && data?.id !== value?.id
    // );

    // if (isDuplicate) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Duplicated',
    //     detail: 'This GD number already exists in another record.'
    //   });
    //   return;
    // }

    this.visible = false;
    this.appointmentService
      .updateExports(value?.id, value)
      .then(() => {
        this.editForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Imports successfully Updated'
        });
      });
  }

  convertToAMPM(time: string): string {
    let [hours, minutes] = time.split(':');
    let h = Number(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';

    if (h === 0) {
      h = 12; // 00:30 → 12:30 AM
    } else if (h > 12) {
      h = h - 12; // 13:30 → 1:30 PM
    }

    const formattedHours = h.toString().padStart(2, '0');
    return `${formattedHours}:${minutes} ${suffix}`;
  }

  deleteValue(appointmentId: any) {
    this.appService.deleteExports(appointmentId)
      .catch(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete record.' });
        console.error('Error deleting:', err);
      });
  }

  private extractAmount(value: string | undefined): number {
    if (!value) return 0;
    const match = value.match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  }

  get subTotal(): number {
    const price = this.extractAmount(this.data?.serviceName?.price);
    const rcmb = this.extractAmount(this.data?.serviceName?.rcmb);
    return price + rcmb;
  }


  get gst() {
    return this.subTotal * 0.13;
  }

  get grandTotal() {
    return this.subTotal + this.gst;
  }



  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('App List');

    // 🔹 Complete Table Headers
    worksheet.addRow([
      'Vendor',
      'Export GD No. & Date',
      'Date of Export',
      'Order Number/Invoice No.',
      'Export HS Code',
      'Type Of Export',
      'Export Qty Nos/Mtr',
      'UOM',
      'Value PKR',
      'Import GD No. & Date',
      'Type Of Imp',
      'Import HS Code',
      'Date Of Consumption',
      'Analysis Card',
      'UOM',
      'Consumption Qty',
      'PKR',
      'Imported Item Value'
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
        item.vendor,
        item.GD_Invoice,
        item.dateOfExport,
        item.orderNumber,
        item.HS_Code,
        item.type_Of_Export,
        item.qty,
        item.unit,
        item.rate,
        item.importID,
        item.typeOfImport,
        item.impoortHS_Code,
        item.dateOfConsumption,
        item.analysisCard,
        item.consumptionUOM,
        item.consumptionQty,
        item.pkr,
        item.Amount
      ]);
    });

    // 🔹 Auto Column Width
    worksheet.columns.forEach(column => {
      column.width = 18;
    });

    // 🔹 Download Excel
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      saveAs(blob, 'Export-data.xlsx');
    });
  }


  search() {
    if (this.importDateRange?.length === 2 && this.importDateRange[1]) {
      const start = this.formatDate(this.importDateRange[0]);
      const end = this.formatDate(this.importDateRange[1]);
      this.appService.getExportsByDateRange(start, end).then(res => {
        let filtered = res;
        if (this.StatusValue) filtered = filtered.filter((i: any) => i.GD_Invoice === this.StatusValue);
        if (this.UnitValue) filtered = filtered.filter((i: any) => i.HS_Code === this.UnitValue);
        this.appList = filtered;
      });
    } else {
      let filtered = this.filteredList || [];
      if (this.StatusValue) filtered = filtered.filter((i: any) => i.GD_Invoice === this.StatusValue);
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
      GD_Invoice: row['Export GD No. & Date'] || '',
      dateOfExport: this.excelDateToJSDate(row['Date of Export']),
      orderNumber: row['Order Number/Invoice No.'] || '',
      HS_Code: row['Export HS Code'] || '',
      type_Of_Export: row['Type Of Export'] || '',
      qty: row['Export Qty Nos/Mtr'] || '',
      unit: row['UOM'] || '',
      rate: row['Value PKR'] || '',
      importID: row['Import GD No. & Date'] || '',
      typeOfImport: row['Type Of Imp'] || '',
      impoortHS_Code: row['Import HS Code'] || '',
      dateOfConsumption: this.excelDateToJSDate(row['Date Of Consumption']),
      analysisCard: row['Analysis Card'] || '',
      consumptionUOM: row['UOM_1'] || '',
      consumptionQty: row['Consumption Qty'] || '',
      pkr: row['PKR'] || '',
      Amount: row['Imported Item Value'] || '',
    }));

    await this.appointmentService.batchAddExports(payloads, (done, total) => {
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


  downloadSampleFile() {
    const link = document.createElement('a');
    link.href = 'assets/export.xlsx';
    link.download = 'Sample_Export_File.xlsx';
    link.click();
  }

  filterdata(filterdata: any) {

    let value = this.dataFilter?.filter((data: any) => data?.importID === filterdata?.value);
    this.impoortHS_Code = value;
    console.log("filterdata:", value);
  }

}

