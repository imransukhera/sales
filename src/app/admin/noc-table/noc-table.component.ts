import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
  selector: 'app-noc-table',
  standalone: true,
    imports: [CommonModule, DialogModule, EditorModule, ReactiveFormsModule, DropdownModule, ToastModule, TableModule, FormsModule, TooltipModule, CalendarModule],

  templateUrl: './noc-table.component.html',
  styleUrl: './noc-table.component.scss'
})
export class NocTableComponent {
  receipts: any;
  importDateRange: any
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

  data: any;
  uplloadDailog: boolean = false;
statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Availed', value: 'Availed' },
  { label: 'Due', value: 'Due' }
];

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,

  ) {
    this.getEm();
  }



  ngOnInit() {
    this.editForm = this.fb.group({
      vendor: [''],
      importID: ['', Validators.required],
      dateOfImport: ['', Validators.required],
      dateOfExport: ['', Validators.required],
      dateOfApplied:[''],
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
      unit: ['', Validators.required],
      status: ['Pending'],
      grandsTotal: [0, Validators.required],
      id: [''],
    });

    this.editForm.valueChanges.subscribe(val => {
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



 getEm() {
  this.appService.getFilteredImports().subscribe({
    next: (res: any[]) => {
      this.appList = res;
      this.filteredList = res;
      console.log('Filtered Imports:', res);
    },
    error: (err) => {
      console.error(err);
    }
  });
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
    this.DCNNumber = this.appointment?.DCN,
      console.log("this is the Value of :", this.appointment,)
    this.editForm.patchValue({
      vendor: appointment.vendor,
      importID: appointment.importID,
      dateOfImport: appointment.dateOfImport,
      dateOfExport: appointment.dateOfExport,
       dateOfApplied:appointment.dateOfApplied,
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
      grandsTotal: appointment.grandsTotal,
    });
  }


  // Update Firestore
  submit() {
    if (this.editForm.invalid) {
      console.log("value")
      this.editForm.markAllAsTouched();
      return;
    }
    let value = this.editForm.value;

    const repreatedValue = this.appList.filter((data: any) => data?.importID == value?.GD_Invoice)
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
        importID: row['Import ID'] || '',
        dateOfImport: row['Date Of Import'] || '',
        dateOfExport: row['Date Of Export'] || '',
        dateOfApplied: row['Date Of Applied'] || '',
        HS_Code: row['HS Code'] || '',
        Sales_Tax: Number(row['Sales Tax']) || 0,
        Custom_Duty: Number(row['Custom Duty']) || 0,
        Income_Tax: Number(row['Income Tax']) || 0,
        FED: Number(row['FED']) || 0,
        Additional_Custom_Duty: Number(row['Additional Custom Duty']) || 0,
        Additional_Sales_Tax: Number(row['Additional Sales Tax']) || 0,
        type: row['Type'] || '',
        qty: Number(row['Qty']) || 0,
        rate: Number(row['Rate']) || 0,
        total: Number(row['Total']) || 0,
        unit: row['Unit'] || '',
        status: row['Status'] || '',
        grandsTotal: Number(row['Grand Total']) || 0,
      };

      // 🔹 Duplicate check
      const isDuplicate = this.appList.some(
        (item: any) => item.importID === payload.importID
      );

      if (!isDuplicate) {
        await this.appointmentService.addAppointment(payload);
      }
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Uploaded',
      detail: 'All Excel entries imported successfully'
    });
    this.uplloadDailog = false;
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
      data?.GD_Invoice === value?.importID && data?.id !== value?.id
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
      .then(() => {
        console.log("Appointment deleted successfully!");
      })
      .catch(err => {
        console.error("Error deleting appointment:", err);
      });

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
       saveAs(blob, 'NOC-Data.xlsx');
     });
   }


  search() {
    console.log("importDateRange", this.importDateRange);

    this.appList = this.filteredList.filter((item: any) => {
      // Parse dateOfImport as local date (avoid timezone issues)
      const importParts = item.dateOfImport.split('-'); // ["2026", "02", "03"]
      const importDate = new Date(
        +importParts[0],          // year
        +importParts[1] - 1,      // month is 0-based
        +importParts[2]            // day
      );

      const isGDMatch = !this.StatusValue || item.importID === this.StatusValue;
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


  downloadSampleFile() {
    const link = document.createElement('a');
    link.href = 'assets/samplefile.xlsx';
    link.download = 'Sample_Import_File.xlsx';
    link.click();
  }

  getStatusClass(status: string | undefined): string {
  switch ((status || 'Pending').toLowerCase()) {
    case 'availed':
      return 'bg-green-500';
    case 'due':
      return 'bg-red-500';
    case 'pending':
    default:
      return 'bg-yellow-500 text-black';
  }
}


}
