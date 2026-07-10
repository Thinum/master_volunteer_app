package at.jku.volunteer_app.contract;

public record RecommendationReasonDTO(
        RecommendationReasonType type,
        String label,
        String detail,
        double scoreContribution
) {
}
