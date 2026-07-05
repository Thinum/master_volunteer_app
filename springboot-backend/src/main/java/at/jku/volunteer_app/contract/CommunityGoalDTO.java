package at.jku.volunteer_app.contract;

import java.sql.Timestamp;
import java.util.List;

public record CommunityGoalDTO(
        int id,
        String title,
        String description,
        int targetValue,
        int currentValue,
        List<String> activityTags,
        List<CommunityGoalContributionDTO> contributions,
        Timestamp startDate,
        Timestamp endDate,
        String status,
        Timestamp createdAt,
        Timestamp updatedAt,
        OrganisationDTO organisation
) {
}
