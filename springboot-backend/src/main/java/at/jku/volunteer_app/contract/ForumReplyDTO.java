package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record ForumReplyDTO(
        int id,
        String author,
        String avatar,
        String message,
        Timestamp createdAt,
        Integer forumEntryId
) {
}
