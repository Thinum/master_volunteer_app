import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { LayoutingService } from '../../services/layouting.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/authservice/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrganisationListComponent } from '../organisations/organisations-overview/organisation-list/organisation-list.component';
import { Organisation } from '../../models/organisation.model';
import { OrganisationService } from '../../services/api/organisation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButtonModule,
    ReactiveFormsModule,
    OrganisationListComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  organisations: Organisation[] = [];
  organisationsFiltered: Organisation[] = [];

  protected loginForm: FormGroup;
  protected hidePw = signal(true);

  private loggedInSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private layoutingService: LayoutingService,
    private authService: AuthService,
    private router: Router,
    private organisationService: OrganisationService
  ) {
    this.layoutingService.showBottomNavbar.set(false);

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
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
    this.loadOrganisations();
  }

  filterBy(searchTerm: string): void {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      this.organisationsFiltered = this.organisations.filter(o =>
        o.orgName.toLowerCase().includes(lower)
      );
    } else {
      this.organisationsFiltered = [...this.organisations];
    }
  }

  private loadOrganisations(): void {
    this.organisationService.getAllOrganisations().subscribe(orgs => {
      this.organisations = orgs;
      this.organisationsFiltered = [...orgs];
    });
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

  ngOnDestroy(): void {
    this.loggedInSubscription?.unsubscribe();
  }
}
