import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-all-service',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './all-service.component.html',
  styleUrl: './all-service.component.scss'
})
export class AllServiceComponent {
activeTab = 1;

  arrayValue:any = [
    {
    name:'Permanent Resident Status',
    discription:'Fingerprinting for Canadian permanent residence applications.'
  },
  {
    name:'Canadian Citizenship',
    discription:'Fingerprinting services for Canadian citizenship applications.'
  },
   {
    name:'Refugee Sponsorship',
    discription:'Fingerprinting for refugee sponsorship applications.'
  },
   {
    name:'Immigration Sponsorship',
    discription:'Fingerprinting for family and immigration sponsorship applications.'
  },
  {
    name:'Immigration Biometrics',
    discription:'Complete biometric services for immigration applications including green card, citizenship, and'
  },
]

digitalService:any = [
  {
    name:'Employment (Federal Government)',
    discription:'Fingerprinting services for federal government employment applications and security clearances.'
  },
   {
    name:'Employment (Private Industry)',
    discription:'Background check fingerprinting for private sector employment requirements.'
  },
   {
    name:'Controlled Goods Program',
    discription:'Fingerprinting for Controlled Goods Program security assessments and clearances.'
  },
   {
    name:'Cannabis Licence',
    discription:'Fingerprinting services for cannabis licence applications and renewals.'
  },
   {
    name:'Restricted Area Identity Card (Airport)',
    discription:'Fingerprinting for airport RAIC security clearance applications.'
  },
  {
    name:'Real Estate Licence',
    discription:'Fingerprinting for real estate professional licence applications.'
  },
  {
    name:'Immigration Consultants (ICCRC)',
    discription:'Fingerprinting for regulated immigration consultant licence applications.'
  },
    {
    name:'Accredited Fingerprinting Company Operator',
    discription:'Fingerprinting for individuals applying to operate accredited fingerprinting companies.'
  },
  {
    name:'Quebec Anti-Corruption Act',
    discription:'Fingerprinting services for Quebec Anti-Corruption Act compliance requirements.'
  },
  {
    name:'Volunteer Employment',
    discription:'Fingerprinting for volunteer position background checks.'
  },
  {
    name:'Employment (Other)',
    discription:'Fingerprinting services for miscellaneous employment verification needs.'
  }
]


otherService:any = [
  {
    name:'Adoption',
    discription:'Fingerprinting for domestic and international adoption applications.'
  },
   {
    name:'Name Change',
    discription:'Fingerprinting for Ontario name change applications.'
  },
   {
    name:'Refugee Sponsorship',
    discription:'Fingerprinting for refugee sponsorship applications.'
  },
   {
    name:'Immigration Sponsorship',
    discription:'Fingerprinting for family and immigration sponsorship applications.'
  },
   {
    name:'Liquor Licence',
    discription:'Fingerprinting for liquor licence applications and renewals.'
  },
  {
    name:'CRC for Personal Use (Active criminal record)',
    discription:'Fingerprinting for personal criminal record checks for various purposes.'
  },
  {
    name:'CRC for Personal Use (Suspended record)',
    discription:'Fingerprinting for personal criminal record checks with suspended records.'
  },
    {
    name:'CRC for Personal Use (other)',
    discription:'Fingerprinting for personal criminal record checks with active records.'
  }
]

allServices: any = [
  // arrayValue
  {
    name:'Permanent Resident Status',
    discription:'Fingerprinting for Canadian permanent residence applications.'
  },
  {
    name:'Canadian Citizenship',
    discription:'Fingerprinting services for Canadian citizenship applications.'
  },
  {
    name:'Refugee Sponsorship',
    discription:'Fingerprinting for refugee sponsorship applications.'
  },
  {
    name:'Immigration Sponsorship',
    discription:'Fingerprinting for family and immigration sponsorship applications.'
  },
  {
    name:'Immigration Biometrics',
    discription:'Complete biometric services for immigration applications including green card, citizenship, and'
  },

  // digitalService
  {
    name:'Employment (Federal Government)',
    discription:'Fingerprinting services for federal government employment applications and security clearances.'
  },
  {
    name:'Employment (Private Industry)',
    discription:'Background check fingerprinting for private sector employment requirements.'
  },
  {
    name:'Controlled Goods Program',
    discription:'Fingerprinting for Controlled Goods Program security assessments and clearances.'
  },
  {
    name:'Cannabis Licence',
    discription:'Fingerprinting services for cannabis licence applications and renewals.'
  },
  {
    name:'Restricted Area Identity Card (Airport)',
    discription:'Fingerprinting for airport RAIC security clearance applications.'
  },
  {
    name:'Real Estate Licence',
    discription:'Fingerprinting for real estate professional licence applications.'
  },
  {
    name:'Immigration Consultants (ICCRC)',
    discription:'Fingerprinting for regulated immigration consultant licence applications.'
  },
  {
    name:'Accredited Fingerprinting Company Operator',
    discription:'Fingerprinting for individuals applying to operate accredited fingerprinting companies.'
  },
  {
    name:'Quebec Anti-Corruption Act',
    discription:'Fingerprinting services for Quebec Anti-Corruption Act compliance requirements.'
  },
  {
    name:'Volunteer Employment',
    discription:'Fingerprinting for volunteer position background checks.'
  },
  {
    name:'Employment (Other)',
    discription:'Fingerprinting services for miscellaneous employment verification needs.'
  },

  // otherService
  {
    name:'Adoption',
    discription:'Fingerprinting for domestic and international adoption applications.'
  },
  {
    name:'Name Change',
    discription:'Fingerprinting for Ontario name change applications.'
  },
  {
    name:'Refugee Sponsorship',
    discription:'Fingerprinting for refugee sponsorship applications.'
  },
  {
    name:'Immigration Sponsorship',
    discription:'Fingerprinting for family and immigration sponsorship applications.'
  },
  {
    name:'Liquor Licence',
    discription:'Fingerprinting for liquor licence applications and renewals.'
  },
  {
    name:'CRC for Personal Use (Active criminal record)',
    discription:'Fingerprinting for personal criminal record checks for various purposes.'
  },
  {
    name:'CRC for Personal Use (Suspended record)',
    discription:'Fingerprinting for personal criminal record checks with suspended records.'
  },
  {
    name:'CRC for Personal Use (other)',
    discription:'Fingerprinting for personal criminal record checks with active records.'
  }
];


  setActiveTab(tabNumber: number) {
    this.activeTab = tabNumber;
  }

}

