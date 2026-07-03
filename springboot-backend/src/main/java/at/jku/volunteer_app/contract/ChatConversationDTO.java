package at.jku.volunteer_app.contract;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Timestamp;

public record ChatConversationDTO(
        int id,
        Integer ownerUserId,
        Integer contactUserId,
        String contact,
        String avatar,
        String lastMessage,
        Timestamp timestamp,
        Integer unreadCount,
        @JsonProperty("isActive")
        Boolean isActive
) {
}
