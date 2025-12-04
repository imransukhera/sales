import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { RouteService } from '@services/route.service';
import { ActivatedRoute } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TooltipModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  sidebarOpen = false;
  tooltipVisible = false;
  companyID: any;
  constructor(
    private router: Router,
    public routeService: RouteService,
    private route: ActivatedRoute
  ) {
    this.route.parent?.paramMap.subscribe(params => {
      this.companyID = params.get('companyId');
      console.log('Company ID:', this.companyID);
    });
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('companyId');
      if (id) {
        this.companyID = id;
        console.log('Company ID:', this.companyID);
        break;
      }
      currentRoute = currentRoute.parent;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  showTooltip() {
    this.tooltipVisible = true;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate([`/${this.routeService.login}`]);
  }

}
