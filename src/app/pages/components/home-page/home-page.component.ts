import { Component } from '@angular/core';
import { OurServiceHomeeComponent } from '../our-service-homee/our-service-homee.component';
import { GetInTouchComponent } from "../get-in-touch/get-in-touch.component";
import { OurProcessComponent } from "../our-process/our-process.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [OurServiceHomeeComponent, GetInTouchComponent, OurProcessComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
