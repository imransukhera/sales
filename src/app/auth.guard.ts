import {  Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: any, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data.expectedRole; // Get expected role from route data
    const currentRole = this.authService.getRole(); 
    if (currentRole) {
      if (currentRole === 'admin' && state.url === '/') {
        this.router.navigate(['/admin/dashboard']); // Redirect to admin dashboard
        return false;
      } else if (currentRole === 'user' && state.url === '/') {
        this.router.navigate(['/dashboard']); // Redirect to user dashboard
        return false;
      }
    }

    if (currentRole && currentRole === expectedRole) {
      return true; // Allow access if roles match
    } else {
      this.router.navigate(['']); // Redirect to login if roles don't match
      return false; // Deny access
    }
  }
  //   if (this.authService.isLoggedIn()) {
  //     return true;
  //   } else {
  //     this.router.navigate(['']);
  //     return false;
  //   }
  // }
}

