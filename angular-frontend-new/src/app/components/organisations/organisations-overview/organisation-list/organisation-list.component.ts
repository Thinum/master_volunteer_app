import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Organisation} from '../../../../models/organisation.model';

@Component({
  selector: 'app-organisation-list',
  imports: [
    MatIcon,
    NgForOf,
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './organisation-list.component.html',
  styleUrl: './organisation-list.component.css'
})
export class OrganisationListComponent {
    @Input() organisationsList?: Organisation[];
    @Input() sectionTitle?: string;
    @Input() userInterestMatchLabels: string[] = [];
    @Input() userSkillMatchLabels: string[] = [];

    getMemberCount(org: Organisation): number {
      return org.orgMembers?.length ?? 0;
    }

    getVisibleTags(org: Organisation): string[] {
      const labels = new Map<string, string>();

      (org.tags ?? [])
        .map(value => value?.trim().replace(/\s+/g, ' '))
        .filter((value): value is string => !!value)
        .forEach(value => {
          const normalized = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
          if (!labels.has(normalized)) {
            labels.set(normalized, value);
          }
        });

      return Array.from(labels.values())
        .sort((first, second) => Number(this.isUserMatchedTag(second)) - Number(this.isUserMatchedTag(first)))
        .slice(0, 3);
    }

    isUserMatchedTag(tag: string): boolean {
      const normalizedTag = this.normalizeTag(tag);
      const matchesInterest = this.userInterestMatchLabels.some(label => {
        const normalizedLabel = this.normalizeTag(label);
        return normalizedLabel && normalizedTag.includes(normalizedLabel);
      });
      const matchesSkill = this.userSkillMatchLabels.some(label => this.normalizeTag(label) === normalizedTag);

      return matchesInterest || matchesSkill;
    }

    private normalizeTag(value: string): string {
      return value
        .trim()
        .replace(/[&_-]+/g, ' ')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
    }
}
