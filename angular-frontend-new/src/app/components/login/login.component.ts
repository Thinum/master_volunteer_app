import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { LayoutingService } from '../../services/layouting.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/authservice/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrganisationListComponent } from '../organisations/organisations-overview/organisation-list/organisation-list.component';
import { Organisation, OrganisationCategory } from '../../models/organisation.model';
import { OrganisationService } from '../../services/api/organisation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
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

  searchTerm = '';
  selectedCategory: OrganisationCategory | null = null;
  selectedTags: string[] = [];
  showFilters = false;

  categories: OrganisationCategory[] = [];
  tags: string[] = [];

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

  applyFilters(): void {
      this.organisationsFiltered = this.organisations.filter(org => {

        const search = this.searchTerm.toLowerCase();

        const matchesSearch =
          !search ||
          org.orgName.toLowerCase().includes(search) ||
          org.body.toLowerCase().includes(search) ||
          (org.tags ?? []).some(tag =>
            tag.toLowerCase().includes(search)
          );

        const matchesCategory =
          !this.selectedCategory ||
          org.category === this.selectedCategory;

        const matchesTags =
          this.selectedTags.length === 0 ||
          this.selectedTags.every(tag =>
            (org.tags ?? []).includes(tag)
          );

        return matchesSearch && matchesCategory && matchesTags;
      });
    }

    toggleTag(tag: string): void {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
      this.applyFilters();
    }

    toggleCategory(category: OrganisationCategory): void {
      this.selectedCategory =
        this.selectedCategory === category ? null : category;
      this.applyFilters();
    }

  private loadOrganisations(): void {
     this.organisationService.getAllOrganisations().subscribe(orgs => {
        this.organisations = orgs;
        this.organisationsFiltered = [...orgs];

        this.extractCategoriesAndTags();
      });
  }

  private extractCategoriesAndTags(): void {

    // Extract categories (unique)
    const categorySet = new Set<OrganisationCategory>();
    const tagSet = new Set<string>();

    this.organisations.forEach(org => {
      if (org.category) {
        categorySet.add(org.category);
      }

      (org.tags ?? []).forEach(tag => {
        tagSet.add(tag);
      });
    });

    this.categories = Array.from(categorySet).sort();
    this.tags = Array.from(tagSet).sort();
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
