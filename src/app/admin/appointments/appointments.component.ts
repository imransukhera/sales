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

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorModule, ReactiveFormsModule, DropdownModule, ToastModule, TableModule, FormsModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent {
  receipts: any;
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
      status: 'Raw Material'
    },
    {
      status: 'Machinery Parts'
    },
    {
      status: 'Machinery'
    }
  ]

  data: any;

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,

  ) {
    this.getEm();
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      vendor: [''],
      GD_Invoice: ['', Validators.required],
      dateOfImport: ['', Validators.required],
      dateOfExport: ['', Validators.required],
      HS_Code: ['', Validators.required],
      Sales_Tax: ['', Validators.required],
      Custom_Duty: ['', Validators.required],
      Income_Tax: ['', Validators.required],
      FED: ['', Validators.required],
      Additional_Custom_Duty: ['', Validators.required],
      Additional_Sales_Tax: ['', Validators.required],
      type: ['', Validators.required],
      qty: ['', Validators.required],
      rate: ['', Validators.required],
      total: ['', Validators.required],
      id: [''],
    });

  }



  getEm() {
    this.appService.getAllAppointments().subscribe({
      next: (res: any) => {
        this.appList = res;
      }
    })
  }

   closeDialog(){
    this.isEditMode = false;
    this.editForm.reset();
    this.visible=false;
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
      GD_Invoice: appointment.GD_Invoice,
      dateOfImport: appointment.dateOfImport,
      dateOfExport: appointment.dateOfExport,
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

  exportToExcel(data: any) {
    let value = [data];
    console.log("appLiddst", this.appList)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('App List');

    // 🔹 Table Headers
    worksheet.addRow([
      'Sr.No',
      'Vendor',
      'GD Number',
      'GD Invoice (Import ID)',
      'Date of Export',
      'Qty',
      'Rate',
      'Total'
    ]);

    // 🔹 Header styling
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
    value.forEach((item: any, index: number) => {
      worksheet.addRow([
        index + 1,
        item.vendor,
        item.GD_Invoice,
        item.importID,
        item.dateOfExport,
        item.qty,
        item.rate,
        item.total
      ]);
    });

    // 🔹 Auto column width
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // 🔹 Download Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob(
        [buffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      saveAs(blob, 'App_List.xlsx');
    });
  }


}
