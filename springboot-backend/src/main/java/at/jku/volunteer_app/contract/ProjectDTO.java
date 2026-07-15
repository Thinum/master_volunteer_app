package at.jku.volunteer_app.contract;

import java.sql.Timestamp;
import java.time.LocalDate;

public record ProjectDTO(
        int id,
        String title,
        String description,
        LocationDTO location,
        LocalDate startDate,
        LocalDate endDate,
        boolean closed,
        int organisationId,
        String organisationName,
        int activityCount,
        Timestamp createdAt,
        Timestamp updatedAt
) {
}
