package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record AppointmentDTO(
        int id,
        String title,
        String description,
        String location,
        Timestamp startDateTime,
        Timestamp endDateTime,
        int createdBy,
        Integer activityId
) {
}
