import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'A12dadf125@') {
      localStorage.setItem('role', 'admin');
      localStorage.setItem('loggedIn', 'true');
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.clear();
  }
}
