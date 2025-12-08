import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {
  step = 1;

  selectedService: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  constructor(private appService: FirestoreService) {
    this.getEm();
  }

  details = {
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  allServices: any = [
    { name: 'Permanent Resident Status', discription: 'Fingerprinting for Canadian permanent residence applications.' ,price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Canadian Citizenship', discription: 'Fingerprinting services for Canadian citizenship applications.' ,price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Refugee Sponsorship', discription: 'Fingerprinting for refugee sponsorship applications.' ,price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Immigration Sponsorship', discription: 'Fingerprinting for family and immigration sponsorship applications.' ,price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Immigration Biometrics', discription: 'Complete biometric services for immigration applications including green card, citizenship, and' ,price:'$59.99', fee: '+ $25 RCMP fee'  },

    // digitalService
    { name: 'Employment (Federal Government)', discription: 'Fingerprinting services for federal government employment applications and security clearances.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Employment (Private Industry)', discription: 'Background check fingerprinting for private sector employment requirements.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Controlled Goods Program', discription: 'Fingerprinting for Controlled Goods Program security assessments and clearances.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Cannabis Licence', discription: 'Fingerprinting services for cannabis licence applications and renewals.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Restricted Area Identity Card (Airport)', discription: 'Fingerprinting for airport RAIC security clearance applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Real Estate Licence', discription: 'Fingerprinting for real estate professional licence applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Immigration Consultants (ICCRC)', discription: 'Fingerprinting for regulated immigration consultant licence applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Accredited Fingerprinting Company Operator', discription: 'Fingerprinting for individuals applying to operate accredited fingerprinting companies.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Quebec Anti-Corruption Act', discription: 'Fingerprinting services for Quebec Anti-Corruption Act compliance requirements.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Volunteer Employment', discription: 'Fingerprinting for volunteer position background checks.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Employment (Other)', discription: 'Fingerprinting services for miscellaneous employment verification needs.',price:'$59.99', fee: '+ $25 RCMP fee'  },

    // other services
    { name: 'Adoption', discription: 'Fingerprinting for domestic and international adoption applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Name Change', discription: 'Fingerprinting for Ontario name change applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Refugee Sponsorship', discription: 'Fingerprinting for refugee sponsorship applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Immigration Sponsorship', discription: 'Fingerprinting for family and immigration sponsorship applications.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'Liquor Licence', discription: 'Fingerprinting for liquor licence applications and renewals.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'CRC for Personal Use (Active criminal record)', discription: 'Fingerprinting for personal criminal record checks for various purposes.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'CRC for Personal Use (Suspended record)', discription: 'Fingerprinting for personal criminal record checks with suspended records.',price:'$59.99', fee: '+ $25 RCMP fee'  },
    { name: 'CRC for Personal Use (other)', discription: 'Fingerprinting for personal criminal record checks with active records.',price:'$59.99', fee: '+ $25 RCMP fee'  }
  ];

  // CATEGORY ARRAYS
  // ---------------------------
  digitalService = this.allServices.filter((s: any) =>
    s.name.includes('Employment') ||
    s.name.includes('Controlled Goods') ||
    s.name.includes('Licence') ||
    s.name.includes('ICCRC') ||
    s.name.includes('Operator') ||
    s.name.includes('Volunteer')
  );

  immigrationService = this.allServices.filter((s: any) =>
    s.name.includes('Permanent') ||
    s.name.includes('Citizenship') ||
    s.name.includes('Refugee') ||
    s.name.includes('Immigration') ||
    s.name.includes('Biometrics')
  );

  otherService = this.allServices.filter((s: any) =>
    s.name.includes('Adoption') ||
    s.name.includes('Name Change') ||
    s.name.includes('CRC')
  );
  services: any = [];
  selectedCategory: string = 'all';
  timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];
  ngOnInit() {
    this.loadCategory('all');
  }
  loadCategory(category: string) {
  this.selectedCategory = category;

  if (category === 'all') {
    this.services = this.allServices;
  } else if (category === 'digital') {
    this.services = this.digitalService;
  } else if (category === 'immigration') {
    this.services = this.immigrationService;
  } else if (category === 'other') {
    this.services = this.otherService;
  }
}

  getEm() {
    this.appService.getAllAppointments().subscribe({
      next: (res: any) => {
        console.log("Res:", res);
      }
    })
  }


  submitBtn() {
    let dataOfSubmit = {
      serviceName: this.selectedService,
      locationName: 'Mississauga',
      worker: 'flashbiometricscentre',
      customerEmail: this.details?.email,
      customerName: this.details?.name,
      notes: this.details.notes,
      customerPhone: this.details?.phone,
      selectedTime: this.selectedTime,
      selectedDate: this.selectedDate
    }
    console.log("selectedService:", dataOfSubmit);

    this.appService.addAppointment(dataOfSubmit)
      .then(res => console.log("Saved!", res))
      .catch(err => console.log("Error:", err));
  }




}
