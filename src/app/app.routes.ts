// OTHER IMPORTS
import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './pages/components/dashboard/dashboard-layout/dashboard-layout.component';
import { AllServiceComponent } from './pages/components/all-service/all-service.component';
import { BookingComponent } from './pages/components/booking/booking.component';
import { AboutUsComponent } from './pages/components/about-us/about-us.component';
import { ContactComponent } from './pages/components/contact/contact.component';
import { FaqPageComponent } from './pages/components/faq-page/faq-page.component';
export const routes: Routes = [
    { path: '', component: DashboardLayoutComponent },
    { path: 'services', component: AllServiceComponent },
    { path: 'appointment', component: BookingComponent },
    { path: 'about-us', component: AboutUsComponent },
    { path: 'contact-us', component: ContactComponent },
    { path: 'faq', component: FaqPageComponent },




    { path: '**', redirectTo: '' }
];
