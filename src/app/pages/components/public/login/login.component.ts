import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouteService } from '@services/route.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@services/toastr.service';
import { FirestoreService } from '@services/firestore.service';
import { user } from '@angular/fire/auth';
import { AuthService } from '../../../../auth.service';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loading: boolean = false;
  loginForm: FormGroup;
  passwordFieldType: string = 'password';


  constructor(
    public routeService: RouteService,
    private router: Router,
    private toaster: ToastrService,
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }
  ngOnInit() {
    const currentRole = this.authService.getRole();

    // If user is already logged in, redirect to their respective dashboard
    if (currentRole === 'admin') {
      this.router.navigate([this.routeService.admin]);
    } else if (currentRole === 'user') {
      this.router.navigate([this.routeService.dashboard]);
    }
  }

  fetchTimelogData(name: string) {
    this.loading = true;
    this.firestoreService.getuserProfile(name)
      .then((data) => {
        let password = this.loginForm.controls['password'].value;
        console.log('Timelog data:', data);
        this.loading = false;

        if (password === data.password) {
          this.toaster.showSuccess('Login Successful');
          if (data.role === 'admin') {
            this.router.navigate([this.routeService.admin]);
          }
          else {
            this.router.navigate([this.routeService.dashboard]);
          }
          this.loading = false;
          localStorage.setItem('userProfile', JSON.stringify(data));
        }
        else {
          this.toaster.showError('Login Failed');
          this.loading = false;
          return;
        }
      })
      .catch((error: any) => {
        console.error('Error fetching timelog data:', error);
      });
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      let userName = this.loginForm.controls['email'].value;
      this.fetchTimelogData(userName);
      this.loading = false;


    } else {
      this.loading = false;
      this.toaster.showError('Login Failed');
    }
  }
  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

}
