import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouteService } from '@services/route.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  companyID: any;

  constructor(
    public routeService: RouteService,
    private router: Router,
    private toaster: ToastrService,
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private authService: AuthService
    , private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
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
  ngOnInit() {
    const currentRole = this.authService.getRole();

    // If user is already logged in, redirect to their respective dashboard
    if (currentRole === 'admin') {
      this.router.navigateByUrl('/01/admin/dashboard');
    } else if (currentRole === 'user') {
      this.router.navigate([this.routeService.dashboard]);
    }
  }

  fetchTimelogData(name: string) {
    this.loading = true;
    this.firestoreService.getuserProfil(this.companyID, name)
      .then((data) => {
        let password = this.loginForm.controls['password'].value;
        console.log('Timelog data:', data);
        this.loading = false;

        if (password === data.password) {
          this.toaster.showSuccess('Login Successful');

          const companyId = data.companyID; // <--- Add this

          if (data.role === 'admin') {
            this.router.navigate([`${companyId}/admin/dashboard`]);
          } else {
            this.router.navigate([`${companyId}/dashboard`]);
          }

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
