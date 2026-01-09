import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import jsPDF from 'jspdf';
import { EditorModule } from 'primeng/editor';
import { timeout } from 'rxjs';

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


  statusArray: any = [
    {
      status: 'Done'
    },
    {
      status: 'Confirmed'
    },
    {
      status: 'Pending'
    },
    {
      status: 'Cancelled'
    }
  ]

  data: any;

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {
    this.getEm();
  }

  ngOnInit() {
    this.fetchReceipts();
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      serviceName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      DCN: [''],
      status: ['', Validators.required]
    });

  }



  getEm() {
    this.appService.getAllAppointments().subscribe({
      next: (res: any) => {
        this.appList = res;
      }
    })
  }

  openEditDialog(appointment: any) {
    this.appointment = appointment;
    this.visible = true;
    this.selectedId = appointment.id;
    this.DCNNumber = this.appointment?.DCN,
      console.log("this is the Value of :", this.appointment,)
    this.editForm.patchValue({
      name: appointment.customerName,
      serviceName: appointment.serviceName?.name,
      date: appointment.selectedDate,
      time: this.convertTo24Hour(appointment.selectedTime),
      status: appointment.status,

    });
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
  updateAppointment() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    let value = this.editForm.value


    let serviceName = {
      discription: this.appointment?.serviceName?.discription,
      name: value?.serviceName,
      price: this.appointment?.serviceName?.price,
      rcmb: this.appointment?.serviceName?.rcmb,
      fee: this.appointment?.serviceName?.price,
      code: this.appointment?.serviceName?.code,
      feildStatus: this.appointment?.serviceName?.feildStatus,
    }


    let dataOfSubmit = {
      id: this.appointment.id,
      serviceName,
      locationName: 'Mississauga',
      worker: 'flashbiometricscentre',
      customerEmail: this.appointment.customerEmail,
      address: this.appointment.address,
      customerName: value.name,
      customerPhone: this.appointment?.customerPhone,
      selectedTime: this.convertToAMPM(value?.time),
      selectedDate: value?.date,
      DCN: this.DCNNumber,
      status: value?.status
    }
    if (value?.status == 'Done' && this.DCNNumber == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please Enter the DCN'
      });
      return;
    }


    console.log("This is Id:", this.selectedId, "dataOfSubmit", dataOfSubmit)
    this.appointmentService
      .updateAppointment(this.selectedId, dataOfSubmit)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Appointment successfully updated'
        });
        this.visible = false;
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
    this.appService.deleteAppointment(appointmentId)
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

  downloadPDF(product: any) {
    setTimeout(() => {
      this.downloadPdf(product);
    }, 1000);
  }


  downloadPdf(product: any) {
    let value = this.receipts.map((item: any) => item.DCN == product?.DCN)
    if (value[0] == true) {
      console.log("Your Value Has been Matched:", value);
      const customerName = product.customerName || "Customer";
      let valu = this.receipts.filter((data: any) => data?.DCN == product?.DCN);
      this.pdfUrl = valu[0].recieptUrl;
      this.body = `
        <p>Dear&nbsp;<strong>${customerName}</strong>,</p><p></p><p>Your&nbsp;DCN&nbsp;number&nbsp;is:&nbsp;<strong>12341</strong>.&nbsp;</p><p>Please&nbsp;download&nbsp;your&nbsp;receipt&nbsp;from&nbsp;the&nbsp;following&nbsp;link&nbsp;and&nbsp;complete&nbsp;the&nbsp;payment:&nbsp;</p><p><a href=\"${this.pdfUrl} \" rel=\"noopener noreferrer\" target=\"_blank\">${this.pdfUrl}&nbsp;</a></p><p>Thank&nbsp;you&nbsp;for&nbsp;your&nbsp;prompt&nbsp;attention.</p><p></p><p><strong>Best&nbsp;regards,</strong></p><p>Flash&nbsp;Biometric&nbsp;Centre&nbsp;</p>
    `;


    }
    if (value[0] == false) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a3',
      });

      const htmlData = document.getElementById('invoice');
      if (!htmlData) {
        console.error('HTML element not found');
        return;
      }

      pdf.html(htmlData, {
        margin: [23, 0, 70, 0],
        html2canvas: {
          logging: true,
          letterRendering: true,
        },
        callback: (pdf) => {
          const pdfBlob = pdf.output('blob');
          const mimeType = 'application/pdf';
          const fileName = 'ticket.pdf';

          const fileObj = new File([pdfBlob], fileName, { type: mimeType });
          const obj = {
            fileName: fileName,
            mimeType: mimeType
          };

          this.appService.getReportsFromS3(obj).subscribe({
            next: (res: any) => {
              const uploadUrl = res?.uploadUrl;
              const fileUrl = res?.fileUrl;
              this.uploadURL(uploadUrl, fileObj, fileUrl, product);
            },
            error: (err) => {
              console.error('Error getting upload URL:', err);
            }
          });
        }
      });
    }

  }

  dirctlyDownload() {
    setTimeout(() => {
      this.downloadDir()
    }), 1000;
  }
  downloadDir() {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a3', });
    const htmlData = document.getElementById('invoice');
    if (htmlData) {
      try {
        pdf.html(htmlData, {
          margin: [23, 0, 70, 0], callback: (pdf) => {

            pdf.save('ticket.pdf');


          },
          html2canvas: { logging: true, letterRendering: true, },
        });
      } catch (error) { }
    } else {
    }
  }

  async uploadURL(uploadUrl: string, file: File, fileUrl: string, product: any) {
    const obj = {
      file: file,
      uploadUrl: uploadUrl
    };

    this.appService.putReportsFromS3(obj).subscribe({
      next: (res: any) => {
        console.log('PDF uploaded to S3 successfully:', fileUrl);
        this.pdfUrl = fileUrl;
        const customerName = product.customerName || "Customer";
        this.body = `
        <p>Dear&nbsp;<strong>${customerName}</strong>,</p><p></p><p>Your&nbsp;DCN&nbsp;number&nbsp;is:&nbsp;<strong>12341</strong>.&nbsp;</p><p>Please&nbsp;download&nbsp;your&nbsp;receipt&nbsp;from&nbsp;the&nbsp;following&nbsp;link&nbsp;and&nbsp;complete&nbsp;the&nbsp;payment:&nbsp;</p><p><a href=\"${this.pdfUrl} \" rel=\"noopener noreferrer\" target=\"_blank\">${this.pdfUrl}&nbsp;</a></p><p>Thank&nbsp;you&nbsp;for&nbsp;your&nbsp;prompt&nbsp;attention.</p><p></p><p><strong>Best&nbsp;regards,</strong></p><p>Flash&nbsp;Biometric&nbsp;Centre&nbsp;</p>
        `;
        let data = {
          DCN: product?.DCN,
          recieptUrl: fileUrl
        }
        this.appService.addReciept(data)
          .then((res: any) => {
            console.log("This is Value:", res);
            this.fetchReceipts();
          })
          .catch((err: any) => {
            console.error("Error adding receipt:", err);
          });

        // Optional: send email here with fileUrl
        // this.sendEmail(fileUrl);
      },
      error: (err) => {
        console.error('Upload Error:', err);
      }
    });
  }



  fetchReceipts() {
    this.appService.getReceipts().subscribe({
      next: res => {
        this.receipts = res;
        console.log('All receipts:', this.receipts);
      },
      error: err => console.error(err)
    });
  }




  sendEmail() {
    console.log("This is Email:", this.subject, "This is Body:", this.body);
    this.appService.sendEmail({
      to: 'mimran@codeteck.com',
      subject: `${this.subject}`,
      message: this.body,
    }).subscribe((response: any) => {
      console.log(response);
    });
  }

  sendDialog() {
    this.emailDilog = true;
  }



}
