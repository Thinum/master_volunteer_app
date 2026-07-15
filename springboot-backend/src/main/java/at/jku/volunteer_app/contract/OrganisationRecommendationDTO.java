package at.jku.volunteer_app.contract;

import java.util.List;

public record OrganisationRecommendationDTO(
        OrganisationDTO organisation,
        double score,
        List<RecommendationReasonDTO> reasons
) {
}
