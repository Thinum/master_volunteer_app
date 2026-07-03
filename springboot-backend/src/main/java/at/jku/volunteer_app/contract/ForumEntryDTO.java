package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record ForumEntryDTO(
        int id,
        String title,
        String lastMessage,
        Timestamp lastEdited,
        String icon,
        Integer newPosts
) {
}
