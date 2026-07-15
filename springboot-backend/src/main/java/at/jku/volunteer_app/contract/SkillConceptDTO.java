package at.jku.volunteer_app.contract;

import java.util.List;

/**
 * A catalogue entry for a skill or knowledge concept.
 *
 * <p>The fields intentionally mirror the useful subset of the ESCO/SKOS model,
 * while still allowing locally maintained concepts without an ESCO URI.</p>
 */
public record SkillConceptDTO(
        String conceptUri,
        String preferredLabel,
        List<String> alternativeLabels,
        String description,
        String skillType,
        String reuseLevel,
        List<String> broaderConceptUris,
        List<String> relatedInterestCodes,
        String source,
        String sourceVersion
) {
}
