package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record ProjectDTO(
        int id,
        String title,
        String description,
        LocationDTO location,
        boolean closed,
        int organisationId,
        Timestamp createdAt,
        Timestamp updatedAt
) {
}
