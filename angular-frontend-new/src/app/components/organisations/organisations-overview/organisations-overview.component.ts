import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { OrganisationService } from '../../../services/api/organisation.service';
import { Organisation, OrganisationCategory } from '../../../models/organisation.model';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';

import {
  MOCK_JOINED_ORGANISATIONS,
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

  //TODO: not sure if these should be effected by the search / filters too?
  joinedOrganisations = MOCK_JOINED_ORGANISATIONS;
  recommendedOrganisations = MOCK_RECOMMENDED_ORGANISATIONS;
  featuredOrganisations = MOCK_FEATURED_ORGANISATIONS;

  constructor(private organisationService: OrganisationService) {}

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

  addNew(): void {}
}
