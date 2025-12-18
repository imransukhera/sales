import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { EmailservicesServiceService } from '@services/emailservices-service.service';


@Component({
  selector: 'app-contact-data',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule, TableModule],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent {
  appList: any;
  visible: boolean = false;
  editForm!: FormGroup;
  selectedId: string = '';
  appointment: any;

  statusArray: any = [
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

  constructor(private appService: FirestoreService, private emailService: EmailservicesServiceService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService
  ) {
    this.getEm();
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      name: [''],
      email: ['', Validators.required],
      subject: ['', Validators.required],
      notes: ['', Validators.required]
    });
  }

  submitted: boolean = false;

  getEm() {
    this.appService.getContactPage().subscribe({
      next: (res: any) => {
        this.appList = res;
        console.log("appList:", this.appList)
      }
    })
  }

  openEditDialog(appointment: any) {
    this.appointment = appointment;
    this.visible = true;
    this.selectedId = appointment.id;
    this.editForm.patchValue({
      name: appointment.name,
      email: appointment.email,
      subject: appointment.subject,
      notes: appointment?.notes,
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
    this.submitted = true;
    console.log("this is Form Value;", this.editForm.value)
    if(this.editForm.invalid){
      return;
    }
    let data = this.editForm.value
    this.emailService.sendEmail({
      to: data?.email,
      subject: data?.subject,
      message: data?.notes,
    }).subscribe((response: any) => {
      console.log(response);
       // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Email',
          detail: 'Successfully submitted.'
        });
        this.visible = false;
        this.editForm.reset();
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
    this.appService.deleteContact(appointmentId)
      .then(() => {
        console.log("Appointment deleted successfully!");
      })
      .catch(err => {
        console.error("Error deleting appointment:", err);
      });

  }

  get f(): { [key: string]: AbstractControl } {
    return this.editForm.controls;
  }


}

