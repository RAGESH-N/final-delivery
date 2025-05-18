import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  captcha: string = '';
  isCaptchaValid: boolean = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateCaptcha();

    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      userid: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      favDish: ['', Validators.required],         // new field
      foodPref: ['', Validators.required],        // new field
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ],
      ],
      captchaInput: ['', Validators.required],
    });
  }

  generateCaptcha(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.captcha = Array.from({ length: 6 })
      .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
      .join('');
  }

  onSubmit(): void {
    if (this.signupForm.value.captchaInput !== this.captcha) {
      this.isCaptchaValid = false;
      return;
    }
    this.isCaptchaValid = true;

    // send as JSON, not FormData, since no files!
    this.http.post('http://localhost:3000/api/users/signup', this.signupForm.value).subscribe(
      (response: any) => {
        alert(response.message);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error occurred:', error);
        alert(error.error.message || 'An error occurred.');
      }
    );
  }

  refreshCaptcha(): void {
    this.generateCaptcha();
    this.isCaptchaValid = true;
    this.signupForm.controls['captchaInput'].reset();
  }
}