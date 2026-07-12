import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { OrganisationService } from '../../../services/api/organisation.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { Organisation, OrganisationCategory } from '../../../models/organisation.model';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';

import {
  MOCK_RECOMMENDED_ORGANISATIONS,
  MOCK_FEATURED_ORGANISATIONS
} from '../../../mock/mock-organisations';

@Component({
  selector: 'app-organisations-overview',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,

    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,

    OrganisationListComponent
  ],
  templateUrl: './organisations-overview.component.html',
  styleUrls: ['./organisations-overview.component.css']
})
export class OrganisationsOverviewComponent implements OnInit {

  organisations: Organisation[] = [];
  organisationsFiltered: Organisation[] = [];

  searchTerm = '';
  selectedCategory: OrganisationCategory | null = null;
  selectedTags: string[] = [];
  showFilters = false;

  categories: OrganisationCategory[] = [];
  tags: string[] = [];

  joinedOrganisations: Organisation[] = [];
  recommendedOrganisations = MOCK_RECOMMENDED_ORGANISATIONS;
  featuredOrganisations = MOCK_FEATURED_ORGANISATIONS;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private organisationService: OrganisationService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.loadOrganisations();
    this.loadJoinedOrganisations();
  }

  private loadJoinedOrganisations(): void {
    this.volunteerService.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (!user?.id) {
          this.joinedOrganisations = [];
          return;
        }

        this.volunteerService.getOrganisations(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(organisations => {
            this.joinedOrganisations = (organisations ?? []).map(org => this.withCleanTags(org));
          });
      });
  }

  private loadOrganisations(): void {
     this.organisationService.getAllOrganisations().subscribe(orgs => {
        this.organisations = (orgs ?? []).map(org => this.withCleanTags(org));
        this.organisationsFiltered = [...this.organisations];

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
        (org.body ?? '').toLowerCase().includes(search) ||
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
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.some(selectedTag => this.normalizeTag(selectedTag) === this.normalizeTag(tag));
  }

  toggleCategory(category: OrganisationCategory): void {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedTags = [];
    this.organisationsFiltered = [...this.organisations];
  }

  get activeFilterCount(): number {
    return (this.selectedCategory ? 1 : 0) + this.selectedTags.length;
  }

  addNew(): void {}

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
