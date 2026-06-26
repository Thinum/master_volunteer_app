package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.NotificationType;

import java.sql.Timestamp;
import java.util.List;

public record NotificationDTO(
        int id,
        String title,
        String text,
        NotificationType type,
        boolean hasBeenRead,
        Timestamp createdAt,
        UserDTO user,
        List<NotificationPayloadDTO> notificationPayloadList
) {
}
