package at.jku.volunteer_app.contract;

import java.util.List;

public record InterestCategoryDTO(
        String code,
        String label,
        String conceptUri,
        String conceptSchemeUri,
        String escoConceptUri,
        List<String> aliases,
        List<String> broaderConceptUris,
        List<String> relatedSkillLabels
) {
}
