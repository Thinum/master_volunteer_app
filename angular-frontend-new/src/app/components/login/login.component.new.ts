import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/authservice/auth.service';
import { LayoutingService } from '../../services/layouting.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIcon,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  protected loginForm: FormGroup;
  protected hidePw = signal(true);

  private loggedInSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private layoutingService: LayoutingService,
    private authService: AuthService,
    private router: Router
  ) {
    this.layoutingService.showBottomNavbar.set(false);

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.loggedInSubscription = this.authService.loggedInEvent.subscribe(
      loggedInEvent => {
        if (loggedInEvent) {
          this.layoutingService.showBottomNavbar.set(true);
          this.router.navigate(['home']);
        }
      }
    );
  }

  ngOnInit(): void {
  }

  clickHidePw(event: MouseEvent): void {
    this.hidePw.update(v => !v);
    event.stopPropagation();
  }

  clickLogin(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password);
  }

  clickRegister(): void {
    this.router.navigate(['register']);
  }

  ngOnDestroy(): void {
    this.loggedInSubscription?.unsubscribe();
  }
}
