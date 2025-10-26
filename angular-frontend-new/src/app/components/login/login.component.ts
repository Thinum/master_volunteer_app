import {Component, signal} from '@angular/core';
import {LayoutingService} from '../../services/layouting.service';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/authservice/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  protected loginForm: FormGroup;

  protected hidePw = signal(true);


  constructor(private formbuilder: FormBuilder,
              private layoutingService: LayoutingService,
              private authService: AuthService,
              private router: Router) {
    this.layoutingService.showBottomNavbar.set(false);
    this.loginForm = this.formbuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    })
  }

  clickHidePw(event: MouseEvent) {
    this.hidePw.set(!this.hidePw());
    event.stopPropagation();
  }

  clickLogin() {
    const formValue = this.loginForm.value;

    if(formValue.username && formValue.password){
      this.authService.login(formValue.username, formValue.password).subscribe((token) => {
        this.layoutingService.showBottomNavbar.set(true);
        this.router.navigate(['home'])
      } ); //So far as long as we get any response we redirect
    }
  }
}
