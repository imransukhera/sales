import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Simulate an authentication check
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userProfile'); // Replace with real auth check logic
  }

  // Simulate a login
  login(user: any) {
    localStorage.setItem('userProfile', JSON.stringify(user));
  }
  

  // Simulate a logout
  logout() {
    localStorage.removeItem('userProfile');
  }

  getRole() {
    const userToken = localStorage.getItem('userProfile');
    if (userToken) {
      const userProfile = JSON.parse(userToken); // Parse user profile from localStorage
      if (userProfile.role === 'admin') {
        return 'admin'; // Return admin role if match
      } else if (userProfile.role === 'user') {
        return 'user'; // Return user role if match
      }
    }
    return null; // Return null if no valid role is found
  }

}
