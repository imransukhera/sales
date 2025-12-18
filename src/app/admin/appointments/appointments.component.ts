import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, DropdownModule, ToastModule,TableModule],
  providers: [MessageService],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent {
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

  constructor(private appService: FirestoreService, private fb: FormBuilder, private appointmentService: FirestoreService, private messageService: MessageService
  ) {
    this.getEm();
  }

  ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      serviceName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
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
    this.editForm.patchValue({
      name: appointment.customerName,
      serviceName: appointment.serviceName?.name,
      date: appointment.selectedDate,
      time: this.convertTo24Hour(appointment.selectedTime),
      status: appointment.status
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
      fee: this.appointment?.serviceName?.fee,
    }


    let dataOfSubmit = {
      serviceName: serviceName,
      locationName: 'Mississauga',
      worker: 'flashbiometricscentre',
      customerEmail: this.appointment.customerEmail,
      customerName: value.name,
      notes: this.appointment.notes,
      customerPhone: this.appointment?.customerPhone,
      selectedTime: this.convertToAMPM(value?.time),
      selectedDate: value?.date,
      status: value?.status
    }

    console.log("serviceName", dataOfSubmit);
    this.appointmentService
      .updateAppointment(this.selectedId, dataOfSubmit)
      .then(() => {
        console.log('Appointment updated');
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

  deleteValue(appointmentId:any) {
    this.appService.deleteAppointment(appointmentId)
      .then(() => {
        console.log("Appointment deleted successfully!");
      })
      .catch(err => {
        console.error("Error deleting appointment:", err);
      });

  }


}
