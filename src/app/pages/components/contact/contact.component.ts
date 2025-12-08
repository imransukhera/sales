import { Component } from '@angular/core';
import { GetInTouchComponent } from "../get-in-touch/get-in-touch.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [GetInTouchComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

}
