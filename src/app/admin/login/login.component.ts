import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  username = '';
  password = '';
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const loggedIn = this.authService.login(this.username, this.password);

    if (loggedIn) {
      this.router.navigate(['/admin/appointments']);
    } else {
      this.errorMsg = 'Invalid username or password!';
    }
  }
}
