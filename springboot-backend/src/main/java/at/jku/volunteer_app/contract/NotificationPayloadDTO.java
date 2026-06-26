package at.jku.volunteer_app.contract;

public record NotificationPayloadDTO(
        int id,
        String payloadType,
        String payload
) {
}
