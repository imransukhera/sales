import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-contact-data',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule, TableModule],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent {
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
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      vendor: ['', Validators.required],
      GD_Invoice: ['', Validators.required],
      importID: ['', Validators.required],
      dateOfExport: ['', Validators.required],
      type_Of_Export: ['', Validators.required],
      dateOfConsumption: ['', Validators.required],
      qty: ['', Validators.required],
      rate: ['', Validators.required],
      total: ['', Validators.required],
      id: [''],
    });



  }



  getEm() {
    this.appService.getExports().subscribe({
      next: (res: any) => {
        this.appList = res;
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
      total: appointment.total,
      id: appointment.id
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

