import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
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
  MatAccordion,
  MatExpansionPanel, MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {Activity} from '../../models/activity.model';

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
    MatChipsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    DatePipe
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

  protected activitiesByOrganisationId: Record<number, Activity[]> = {};

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

    if (this.authService.isLoggedIn()) {
      this.layoutingService.showBottomNavbar.set(true);
      this.router.navigate(['home']);
    }

    this.loggedInSubscription = this.authService.loggedIn$.subscribe(
      isLoggedIn => {
        if (isLoggedIn) {
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
      this.organisations = (orgs ?? []).map(org => this.withCleanTags(org));
      for (let org of this.organisations) {
        this.loadExampleActivitiesForOrganisation(org.id);
      }
      this.organisationsFiltered = [...this.organisations];
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
      this.getTags(org).forEach(tag => {
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
        this.getTags(org).some(tag =>
          tag.toLowerCase().includes(search)
        );

      const matchesCategory =
        !this.selectedCategory ||
        org.category === this.selectedCategory;

      const matchesTags =
        this.selectedTags.length === 0 ||
        this.selectedTags.every(tag =>
          this.getTags(org).some(orgTag => this.normalizeTag(orgTag) === this.normalizeTag(tag))
        );

      return matchesSearch && matchesCategory && matchesTags;
    });
  }

  toggleTag(tag: string): void {
    if (this.isTagSelected(tag)) {
      this.selectedTags = this.selectedTags.filter(t => this.normalizeTag(t) !== this.normalizeTag(tag));
    } else {
      this.selectedTags = [...this.selectedTags, tag];
    }
    this.applyFilters();
  }

  protected isTagSelected(tag: string): boolean {
    return this.selectedTags.some(selectedTag => this.normalizeTag(selectedTag) === this.normalizeTag(tag));
  }

  protected get activeFilterCount(): number {
    return (this.selectedCategory ? 1 : 0) + this.selectedTags.length;
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

    const {username, password} = this.loginForm.value;
    this.authService.login(username, password).subscribe();
  }

  clickRegister(): void {
    this.router.navigate(['register']);
  }

  ngOnDestroy(): void {
    this.loggedInSubscription?.unsubscribe();
  }

  loadExampleActivitiesForOrganisation(organisationId: number)
  {
    this.organisationService.getExampleActivitiesForOrganisation(organisationId).subscribe({
      next: activities => {
        this.activitiesByOrganisationId[organisationId] = activities;
      },
      error: err => {
        console.error('Failed to load organisation activities', err);
      }
    });
  }

  protected getVisibleTags(org: Organisation): string[] {
    return this.getTags(org).slice(0, 4);
  }

  private withCleanTags(org: Organisation): Organisation {
    return {
      ...org,
      tags: this.getTags(org)
    };
  }

  private getTags(org: Organisation): string[] {
    return this.uniqueLabels(org.tags ?? []);
  }

  private uniqueLabels(values: string[]): string[] {
    const labels = new Map<string, string>();

    values
      .map(value => value?.trim().replace(/\s+/g, ' '))
      .filter((value): value is string => !!value)
      .forEach(value => {
        const normalized = this.normalizeTag(value);
        if (!labels.has(normalized)) {
          labels.set(normalized, value);
        }
      });

    return Array.from(labels.values());
  }

  private normalizeTag(value: string): string {
    return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  }
}
