import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss'
})
export class FaqPageComponent {
 searchTerm: string = '';
  faqs = [
    {
      question: '1.	Are you accredited by the RCMP',
      answer: '<b>a.</b> Yes, Flash Biometric Centre is accredited by the RCMP (insert link to accreditation)',
      open: true
    },
    {
      question: '2.	What are the acceptable government IDs',
      answer: '<b>a.</b>	Please click the following link to see the acceptable government IDs <a href="https://flashbiometricscentre.com/required-documents/ ">https://flashbiometricscentre.com/required-documents/ </a> ',
      open: false
    },
    {
      question: '3.	Do I need to print out a request or instructions letter?',
      answer: '<b>a.</b>	Printing your documents with the requests and instructions allows the process to flow more efficiently and minimizes confusion and extra questioning',
      open: false
    },
    {
      question: '4.	Where are you located and how can I get to your office?',
      answer: '<b>a.</b>	Flash Biometrics Centre is located at Unit 207 - 5200 Dixie Road Mississauga, ON L4W 1E4. When you arrive at Unit 207, there will be a Flash Security sign at the door and a doorbell that you will be required to click to enter the office.',
      open: false
    },
    {
      question: '5.	Do you provide the Vulnerable Sector Check?',
      answer: '<b>a.</b>	As of right now, we do not provide the vulnerable sector check. You will need to go to your local police station to obtain this check.',
      open: false
    },
    {
      question: '6.	Why do I need the fingerprint-based check instead of the name-based background check',
      answer: '<b>a.</b>	A name-based background check uses only your name and date of birth. When there are inconclusive results from a name-based search, fingerprints are required to confirm your identity and provide a background check. There are many individuals who have the same names and nicknames, which can make the name-based check impossible and require you to obtain a fingerprint-based check',
      open: false
    },
    {
      question: '7.	Do you offer walk in services',
      answer: '<b>a.</b>	Yes, Flash Biometrics Centre offers walk-in services, however we highly recommend you book an appointment to make it a much faster process for you.',
      open: false
    },
    {
      question: '8.	How long does it take to process my criminal record check?',
      answer: '<b>a.</b>	If there is no criminal record the processing time is typically between 1-3 business days and will be sent via mail to the listed address on the form <br> <b>b.</b>	If there is a positive/potential match, your record will be sent for manual review and could take up 120 business days before being sent via mail.',
      open: false
    },
    {
      question: '9.	Who do I contact if I haven’t received my results within the listed processing time?',
      answer: '<b>a.</b> If we have given you email confirmation on our end that the RCMP has retrieved your documents and you have not received it within the typical processing time, you can contact CCRTIS. You will need to provide them with your fully legal name, date of birth, application type, and document control number (DCN) for them to check the status of your application.',
      open: false
    },
  ];

  toggle(index: number) {
    console.log("asndjsandjnjn")
    this.faqs[index].open = !this.faqs[index].open;
  }


  filteredFaqs() {
    if (!this.searchTerm.trim()) return this.faqs;
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

