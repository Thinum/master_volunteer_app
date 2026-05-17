import { Component, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice/auth.service';
import { signal } from '@angular/core';
import {Subscription} from 'rxjs';
import {LayoutingService} from '../../services/layouting.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  protected registerForm: FormGroup;
  protected hidePw = signal(true);
  protected hideConfirmPw = signal(true);

  private loggedInSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private layoutingService: LayoutingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    this.loggedInSubscription = this.authService.loggedInEvent.subscribe(
      loggedInEvent => {
        if (loggedInEvent) {
          this.layoutingService.showBottomNavbar.set(true);
          this.router.navigate(['home']);
        }
      }
    );
  }

  ngOnDestroy() {
    this.loggedInSubscription.unsubscribe();
  }

  private passwordMatchValidator(form: FormGroup) {
    const pw = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pw === confirm ? null : { passwordMismatch: true };
  }

  clickRegister(): void {
    if (this.registerForm.invalid) return;

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password);
  }

  toggleHidePw(event: MouseEvent) {
    this.hidePw.update(v => !v);
    event.stopPropagation();
  }

  toggleHideConfirmPw(event: MouseEvent) {
    this.hideConfirmPw.update(v => !v);
    event.stopPropagation();
  }

  goToLogin(): void {
    this.router.navigate(['']);
  }

}
