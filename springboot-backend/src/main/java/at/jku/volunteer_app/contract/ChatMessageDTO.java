package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record ChatMessageDTO(
        int id,
        String author,
        Integer authorUserId,
        String authorName,
        String avatar,
        Boolean ownMessage,
        String text,
        Timestamp createdAt,
        Integer conversationId
) {
}
