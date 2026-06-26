package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record CommunityGoalDTO(
        int id,
        String title,
        String description,
        int targetValue,
        int currentValue,
        Timestamp startDate,
        Timestamp endDate,
        String status,
        Timestamp createdAt,
        Timestamp updatedAt,
        OrganisationDTO organisation
) {
}
