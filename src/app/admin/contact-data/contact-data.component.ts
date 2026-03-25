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
  selector: 'app-contact-data',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule, FormsModule, TableModule, CalendarModule],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent {
  receipts: any;
  uplloadDailog: boolean = false;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  importDateRange: Date[] = [];
  UnitValue: any;
  filteredList: any;

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

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {
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

    this.appointmentService.addExposrt(singleValue)
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
        this.dataFilter = res;
        this.allImports = res.filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.importID === item.importID)
        );
      }
    })
  }

  setDefaultDateRange() {
    const today = new Date();
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
    this.importDateRange = [twoMonthsAgo, today];
  }

  getEm() {
    this.appService.getExports().subscribe({
      next: (res: any) => {
        this.appList = res;
        this.appData = res.filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.importID === item.importID)
        );
        this.filteredList = res;
        console.log("appList", this.appList);
        this.search();
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
      .updateEports(value?.id, value)
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
    this.appList.forEach((item: any, index: number) => {
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
    this.setDefaultDateRange();
    this.search();
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

      const raw = XLSX.utils.sheet_to_json(worksheet);
      const data = raw.map((row: any) => {
        const trimmed: any = {};
        Object.keys(row).forEach(key => trimmed[key.trim()] = row[key]);
        return trimmed;
      });

      console.log("Excel Data:", data);

      this.uploadExcelData(data);
    };

    reader.readAsBinaryString(target.files[0]);
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

