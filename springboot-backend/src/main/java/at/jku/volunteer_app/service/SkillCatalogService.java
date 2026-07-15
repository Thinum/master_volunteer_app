package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.SkillConceptDTO;
import at.jku.volunteer_app.model.SkillConcept;
import at.jku.volunteer_app.repository.SkillConceptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class SkillCatalogService {

    private static final String LOCAL_SOURCE = "LOCAL";

    private final SkillConceptRepository repository;

    public SkillCatalogService(SkillConceptRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SkillConceptDTO> getCatalog() {
        Map<String, SkillConceptDTO> conceptsByLabel = new LinkedHashMap<>();
        defaultConcepts().forEach(concept -> conceptsByLabel.put(normalize(concept.preferredLabel()), concept));
        repository.findAll().stream()
                .map(this::toDTO)
                .forEach(concept -> conceptsByLabel.put(normalize(concept.preferredLabel()), concept));
        return new ArrayList<>(conceptsByLabel.values());
    }

    /**
     * Upserts normalized ESCO-style records. The endpoint accepts locally adapted
     * records too; ESCO concepts should use their canonical URI and source version.
     */
    @Transactional
    public List<SkillConceptDTO> importConcepts(List<SkillConceptDTO> concepts) {
        if (concepts == null) {
            return List.of();
        }

        List<SkillConceptDTO> imported = new ArrayList<>();
        concepts.stream()
                .filter(Objects::nonNull)
                .map(this::normalizeImport)
                .filter(Objects::nonNull)
                .forEach(dto -> imported.add(toDTO(repository.save(toEntity(dto)))));
        return imported;
    }

    private SkillConcept toEntity(SkillConceptDTO dto) {
        String normalizedLabel = normalize(dto.preferredLabel());
        SkillConcept entity = findExisting(dto.conceptUri(), normalizedLabel);
        entity.setConceptUri(clean(dto.conceptUri()));
        entity.setPreferredLabel(clean(dto.preferredLabel()));
        entity.setNormalizedLabel(normalizedLabel);
        entity.setAlternativeLabels(cleanList(dto.alternativeLabels()));
        entity.setDescription(clean(dto.description()));
        entity.setSkillType(clean(dto.skillType()));
        entity.setReuseLevel(clean(dto.reuseLevel()));
        entity.setBroaderConceptUris(cleanList(dto.broaderConceptUris()));
        entity.setRelatedInterestCodes(new ArrayList<>(cleanList(dto.relatedInterestCodes()).stream()
                .map(value -> value.toUpperCase(Locale.ROOT))
                .toList()));
        String source = clean(dto.source());
        entity.setSource(source == null ? LOCAL_SOURCE : source.toUpperCase(Locale.ROOT));
        entity.setSourceVersion(clean(dto.sourceVersion()));
        return entity;
    }

    private SkillConcept findExisting(String conceptUri, String normalizedLabel) {
        String cleanUri = clean(conceptUri);
        if (cleanUri != null) {
            return repository.findByConceptUri(cleanUri)
                    .or(() -> repository.findByNormalizedLabel(normalizedLabel))
                    .orElseGet(SkillConcept::new);
        }
        return repository.findByNormalizedLabel(normalizedLabel).orElseGet(SkillConcept::new);
    }

    private SkillConceptDTO normalizeImport(SkillConceptDTO dto) {
        String label = clean(dto.preferredLabel());
        if (label == null) {
            return null;
        }
        return new SkillConceptDTO(
                clean(dto.conceptUri()),
                label,
                cleanList(dto.alternativeLabels()),
                clean(dto.description()),
                clean(dto.skillType()),
                clean(dto.reuseLevel()),
                cleanList(dto.broaderConceptUris()),
                cleanList(dto.relatedInterestCodes()),
                clean(dto.source()),
                clean(dto.sourceVersion())
        );
    }

    private SkillConceptDTO toDTO(SkillConcept entity) {
        return new SkillConceptDTO(
                entity.getConceptUri(),
                entity.getPreferredLabel(),
                safeList(entity.getAlternativeLabels()),
                entity.getDescription(),
                entity.getSkillType(),
                entity.getReuseLevel(),
                safeList(entity.getBroaderConceptUris()),
                safeList(entity.getRelatedInterestCodes()),
                entity.getSource(),
                entity.getSourceVersion()
        );
    }

    private List<SkillConceptDTO> defaultConcepts() {
        return List.of(
                local("Teamwork", "skill/competence", "COMMUNITY_AND_SOCIAL_EVENTS", "ORGANISATION_AND_LEADERSHIP"),
                local("Organization", "skill/competence", "ORGANISATION_AND_LEADERSHIP"),
                local("Physical activity", "skill/competence", "SPORTS_AND_FITNESS", "OUTDOOR_ACTIVITIES"),
                local("Programming", "skill/competence", "TECHNOLOGY"),
                local("Communication", "skill/competence", "COMMUNITY_AND_SOCIAL_EVENTS"),
                local("Teaching", "skill/competence", "EDUCATION_AND_TUTORING"),
                local("Problem-Solving", "skill/competence", "TECHNOLOGY"),
                local("Mentoring", "skill/competence", "EDUCATION_AND_TUTORING", "CHILDREN_AND_YOUTH"),
                local("Event Support", "skill/competence", "COMMUNITY_AND_SOCIAL_EVENTS"),
                local("Fundraising", "skill/competence", "HUMANITARIAN_AID"),
                local("First Aid", "skill/competence", "HEALTH_AND_WELL_BEING", "EMERGENCY_AND_RESCUE_SERVICES"),
                local("Environmental Work", "skill/competence", "ENVIRONMENT_AND_NATURE"),
                local("Social Media", "skill/competence", "TECHNOLOGY", "COMMUNITY_AND_SOCIAL_EVENTS"),
                local("Event Planning", "skill/competence", "ORGANISATION_AND_LEADERSHIP", "COMMUNITY_AND_SOCIAL_EVENTS"),
                local("Community Outreach", "skill/competence", "COMMUNITY_AND_SOCIAL_EVENTS", "HUMANITARIAN_AID"),
                local("Animal Care", "skill/competence", "ANIMALS"),
                local("Responsibility", "attitude/value", "ORGANISATION_AND_LEADERSHIP"),
                local("Cleaning", "skill/competence", "COMMUNITY_AND_SOCIAL_EVENTS"),
                local("Emergency Response", "skill/competence", "EMERGENCY_AND_RESCUE_SERVICES"),
                local("Physical Fitness", "skill/competence", "SPORTS_AND_FITNESS"),
                local("Mathematics", "knowledge", "EDUCATION_AND_TUTORING"),
                local("Food Distribution", "skill/competence", "FOOD_AND_COOKING", "HUMANITARIAN_AID"),
                local("Cooking", "skill/competence", "FOOD_AND_COOKING")
        );
    }

    private SkillConceptDTO local(String label, String type, String... interestCodes) {
        return new SkillConceptDTO(
                null,
                label,
                List.of(),
                null,
                type,
                null,
                List.of(),
                List.of(interestCodes),
                LOCAL_SOURCE,
                null
        );
    }

    private List<String> cleanList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        Map<String, String> cleaned = new LinkedHashMap<>();
        values.stream()
                .map(this::clean)
                .filter(Objects::nonNull)
                .forEach(value -> cleaned.putIfAbsent(normalize(value), value));
        return new ArrayList<>(cleaned.values());
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalize(String value) {
        String cleaned = clean(value);
        return cleaned == null
                ? ""
                : cleaned.replace('_', ' ')
                .replace('-', ' ')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9:/.-]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }
}
