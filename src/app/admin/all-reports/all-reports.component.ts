import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalendarModule } from 'primeng/calendar';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-all-reports',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule, FormsModule, TableModule, CalendarModule],

  templateUrl: './all-reports.component.html',
  styleUrl: './all-reports.component.scss'
})
export class AllReportsComponent {
  receipts: any;
  uplloadDailog: boolean = false;
  importDateRange: any;
  UnitValue: any;
  filteredList: any;

  pdfUrl: any;
  subject: any = 'J-Invoice Generated – TCN Details';
  body: any;
  StatusValue: any;
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

  data: any;

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {
    this.getEm();
    this.getEmhhh();
  }

  ngOnInit() {

    this.editForm = this.fb.group({
      vendor: [''],
      GD_Invoice: [''],
      orderNumber: ['', Validators.required],
      importID: ['', Validators.required],
      dateOfExport: ['', Validators.required],
      type_Of_Export: ['', Validators.required],
      dateOfConsumption: ['', Validators.required],
      unit: ['', Validators.required],
      analysisCard: ['', Validators.required],
      qty: [0, Validators.required],
      rate: [0, Validators.required],
      Amount: [0, Validators.required],
      HS_Code: ['', Validators.required],
      id: [''],
    });

    this.editForm.valueChanges.subscribe(val => {
      this.calculateTotals();
    });



  }

  allImports: any;


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
    this.appService.getAllAppointments().subscribe({
      next: (res: any) => {
        this.allImports = res;
      }
    })
  }

  getEm() {
    this.appService.getExports().subscribe({
      next: (res: any) => {
        this.appList = res;
        this.filteredList = res;
        console.log("appList", this.appList);

      }
    })
  }

  openEditDialog(appointment: any) {
    this.isEditMode = true
    this.appointment = appointment;
    this.visible = true;
    this.selectedId = appointment.id;
    this.DCNNumber = this.appointment?.DCN,
      console.log("this is the Value of :", this.appointment,)
    this.editForm.patchValue({
      vendor: appointment.vendor,
      GD_Invoice: appointment.GD_Invoice,
      importID: appointment.importID,
      type_Of_Export: appointment.type_Of_Export,
      dateOfConsumption: appointment.dateOfConsumption,
      dateOfExport: appointment.dateOfExport,
      qty: appointment.qty,
      rate: appointment.rate,
      Amount: appointment.Amount,
      id: appointment.id,
      unit: appointment.unit,
      orderNumber: appointment.orderNumber,
      HS_Code: appointment.HS_Code,
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
    console.log("value", this.editForm.value);
    if (this.editForm.invalid) {
      console.log("value")
      this.editForm.markAllAsTouched();
      return;
    }

    let value = this.editForm.value;

    const repreatedValue = this.appList.filter((data: any) => data?.GD_Invoice == value?.GD_Invoice)
    console.log("repreatedValue:", repreatedValue);
    if (repreatedValue?.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Duplicated',
        detail: 'This GD number is already exist.'
      });
      return;
    }

    console.log("value", value);
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
    const isDuplicate = this.appList.some((data: any) =>
      data?.GD_Invoice === value?.GD_Invoice && data?.id !== value?.id
    );

    if (isDuplicate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Duplicated',
        detail: 'This GD number already exists in another record.'
      });
      return;
    }

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
      .then(() => {
        console.log("Appointment deleted successfully!");
      })
      .catch(err => {
        console.error("Error deleting appointment:", err);
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

    console.log("appList", this.appList);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('App List');

    // 🔹 Complete Table Headers
    worksheet.addRow([
      'Vendor',
      'Export GD',
      'Order Number',
      'Import GD',
      'Date of Export',
      'HS Code',
      'Date Of Consumption',
      'Analysis Card',
      'UOM',
      'Type Of Export',
      'Qty',
      'FYC',
      'Amount'
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
    this.appList.forEach((item: any, index: number) => {
      worksheet.addRow([
        item.vendor,
        item.GD_Invoice,
        item.orderNumber,
        item.importID,
        item.dateOfExport,
        item.HS_Code,
        item.dateOfConsumption,
        item.analysisCard,
        item.unit,
        item.type_Of_Export,
        item.qty,
        item.rate,
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
      saveAs(blob, 'All-Report.xlsx');
    });
  }


  search() {
    console.log("importDateRange", this.importDateRange);

    this.appList = this.filteredList.filter((item: any) => {
      // Parse dateOfImport as local date (avoid timezone issues)
      const importParts = item.dateOfExport.split('-'); // ["2026", "02", "03"]
      const importDate = new Date(
        +importParts[0],          // year
        +importParts[1] - 1,      // month is 0-based
        +importParts[2]            // day
      );

      const isGDMatch = !this.StatusValue || item.GD_Invoice === this.StatusValue;
      const isHSMatch = !this.UnitValue || item.HS_Code === this.UnitValue;

      let isDateMatch = true;
      if (this.importDateRange && this.importDateRange.length === 2) {
        let [start, end] = this.importDateRange;

        // Normalize start/end to 0:00
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        end = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        // Compare inclusive
        isDateMatch = importDate >= start && importDate <= end;
      }

      return isGDMatch && isHSMatch && isDateMatch;
    });

    console.log('Filtered List:', this.appList);
  }


  resetFilters() {
    this.StatusValue = null;
    this.UnitValue = null;
    this.importDateRange = null;
    this.appList = this.filteredList;
  }


  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);

    if (target.files.length !== 1) {
      return;
    }

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log("Excel Data:", data);

      this.uploadExcelData(data);
    };

    reader.readAsBinaryString(target.files[0]);
  }

  async uploadExcelData(data: any[]) {

    for (const row of data) {

      const payload = {
        vendor: row['Vendor'] || '',
        GD_Invoice: row['Export GDs'] || '',
        orderNumber: row['Order Number'] || '',
        importID: row['Import GDs'] || '',
        HS_Code: row['HS Code'] || '',
        dateOfExport: row['Date of Export'] || '',
        type_Of_Export: row['Type Of Export'] || '',
        dateOfConsumption: row['Date Of Consumption'] || '',
        unit: row['Unit'] || '',
        analysisCard: row['Analysis Card'] || '',
        qty: row['Qty'] || '',
        rate: row['Rate'] || '',
        Amount: row['Amount'] || '',
      };

      // 🔹 Duplicate check
      const isDuplicate = this.appList.some(
        (item: any) => item.importID === payload.importID
      );

      if (!isDuplicate) {
        await this.appointmentService.addExport(payload);
      }
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Uploaded',
      detail: 'All Excel entries imported successfully'
    });
    this.uplloadDailog = false;
  }


  downloadSampleFile() {
    const link = document.createElement('a');
    link.href = 'assets/export.xlsx';
    link.download = 'Sample_Export_File.xlsx';
    link.click();
  }

}

