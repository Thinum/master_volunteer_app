package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.RelationshipType;

public record RelationshipDTO(
    Long id,
    int fromUserId,
    String fromUserName,
    int toUserId,
    String toUserName,
    RelationshipType type,
    Integer likeScore
) {}
