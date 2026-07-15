package at.jku.volunteer_app.contract;

import java.util.List;

public record InterestCategoryDTO(
        String code,
        String label,
        String escoConceptUri,
        List<String> aliases
) {
}
