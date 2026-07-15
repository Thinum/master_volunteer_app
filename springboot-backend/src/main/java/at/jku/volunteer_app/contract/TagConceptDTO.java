package at.jku.volunteer_app.contract;

import java.util.List;

/** A lightweight tag plus its explicit crosswalk into the application taxonomy. */
public record TagConceptDTO(
        String conceptUri,
        String preferredLabel,
        List<String> alternativeLabels,
        List<String> relatedInterestCodes,
        List<String> relatedSkillLabels,
        String source
) {
}
