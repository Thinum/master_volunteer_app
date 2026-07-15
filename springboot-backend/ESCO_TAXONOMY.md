# Skills, interests, and tags

The application uses three related but distinct kinds of metadata:

- **Skills** describe what a volunteer can do and what an activity requires. A skill reference stores its label, canonical ESCO URI when available, and proficiency or minimum proficiency.
- **Fields of interest** are application-specific concepts. They deliberately use stable `urn:volunteer-app:taxonomy:interests:*` URIs rather than pretending to be ESCO skills. Each interest exposes aliases and an explicit crosswalk to related skill labels.
- **Tags** remain lightweight labels for filtering and discovery. `GET /activities/tags/concepts` resolves every tag to related interest codes and skill labels, while the older `GET /activities/tags/catalog` string response remains supported.

## ESCO-compatible skill catalogue

`GET /skills/catalog` merges the local starter catalogue with records stored in `skill_concept`. An imported record with the same normalized preferred label replaces the local presentation of that skill, so clients begin writing its canonical URI without breaking older name-only rows.

The stored shape mirrors the useful subset of ESCO/SKOS:

```json
[
  {
    "conceptUri": "http://data.europa.eu/esco/skill/...",
    "preferredLabel": "Programming",
    "alternativeLabels": ["Computer programming"],
    "description": "Write and maintain computer code.",
    "skillType": "skill/competence",
    "reuseLevel": "cross-sector",
    "broaderConceptUris": ["http://data.europa.eu/esco/skill/..."],
    "relatedInterestCodes": ["TECHNOLOGY"],
    "source": "ESCO",
    "sourceVersion": "1.2.1"
  }
]
```

Authenticated clients can upsert that normalized JSON at `POST /skills/import`. This keeps the application independent of one ESCO delivery format: an adapter can transform the official CSV, JSON-LD, RDF, or API response into the same record without changing profile or activity tables.

For ESCO CSV imports, map the canonical concept URI, preferred label, alternative labels, description, skill type, reuse level, and broader skill relations into the fields above. `relatedInterestCodes` is the application crosswalk and is not an ESCO source field.

ESCO publishes concepts with canonical URIs, preferred/non-preferred labels, descriptions, hierarchy and relationship metadata. The official dataset is available in CSV, RDF/TTL, XML, ODS and JSON-LD formats: <https://esco.ec.europa.eu/en/use-esco/download>.

## Backward compatibility

- Existing `skills: string[]`, `interests: string[]`, and tag arrays remain in the API.
- Structured `skillProfiles`, `requiredSkills`, `preferredSkills`, `interestCategories`, and tag concepts are the canonical forms.
- Name-only legacy skill rows still match by normalized label. URI matches take precedence once ESCO concepts are imported.
- Activity editing preserves required/preferred classification, URI, and minimum proficiency instead of rebuilding every skill as a new beginner-level requirement.
