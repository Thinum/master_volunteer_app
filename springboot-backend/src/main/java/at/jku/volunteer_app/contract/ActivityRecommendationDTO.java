package at.jku.volunteer_app.contract;

import java.util.List;

public record ActivityRecommendationDTO(
        ActivityDTO activity,
        double score,
        List<RecommendationReasonDTO> reasons
) {
}
