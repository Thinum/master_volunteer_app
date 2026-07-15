import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Skill, SkillConcept } from '../../models/skill.model';

@Injectable({ providedIn: 'root' })
export class SkillCatalogService {
  private readonly apiUrl = `${environment.apiUrl}/skills`;

  constructor(private http: HttpClient) {}

  getSkillCatalog(): Observable<Skill[]> {
    return this.http.get<SkillConcept[]>(`${this.apiUrl}/catalog`).pipe(
      map(concepts => (concepts ?? []).map((concept, index) => ({
        id: index + 1,
        name: concept.preferredLabel,
        category: concept.skillType,
        description: concept.description,
        conceptUri: concept.conceptUri,
        alternativeLabels: concept.alternativeLabels ?? [],
        skillType: concept.skillType,
        reuseLevel: concept.reuseLevel,
        broaderConceptUris: concept.broaderConceptUris ?? [],
        relatedInterestCodes: concept.relatedInterestCodes ?? [],
        source: concept.source,
        sourceVersion: concept.sourceVersion,
      })))
    );
  }

  importSkillConcepts(concepts: SkillConcept[]): Observable<SkillConcept[]> {
    return this.http.post<SkillConcept[]>(`${this.apiUrl}/import`, concepts);
  }
}
