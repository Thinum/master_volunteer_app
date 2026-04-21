import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/authservice/auth.service';
import { LayoutingService } from '../../services/layouting.service';
import { OrganisationService } from '../../services/api/organisation.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Organisation, OrganisationCategory } from '../../models/organisation.model';
import {
  MOCK_FEATURED_ORGANISATIONS
} from '../../mock/mock-organisations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIcon,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  protected loginForm: FormGroup;
  protected hidePw = signal(true);
  
  // Organisation properties
  protected organisations: Organisation[] = [];
  protected organisationsFiltered: Organisation[] = [];
  
  protected searchTerm = '';
  protected selectedCategory: OrganisationCategory | null = null;
  protected selectedTags: string[] = [];
  protected showFilters = false;
  
  protected categories: OrganisationCategory[] = [];
  protected tags: string[] = [];

  private loggedInSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private layoutingService: LayoutingService,
    private authService: AuthService,
    private organisationService: OrganisationService,
    private router: Router
  ) {
    this.layoutingService.showBottomNavbar.set(false);

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    if (this.authService.isLoggedIn()){
      this.layoutingService.showBottomNavbar.set(true);
      this.router.navigate(['home']);
    }

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

  private loadOrganisations(): void {
    this.organisationService.getAllOrganisations().subscribe(orgs => {
      this.organisations = orgs;
      this.organisationsFiltered = [...orgs];
      this.extractCategoriesAndTags();
    });
  }

  private extractCategoriesAndTags(): void {
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
