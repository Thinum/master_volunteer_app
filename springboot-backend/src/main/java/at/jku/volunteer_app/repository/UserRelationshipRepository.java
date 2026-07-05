package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRelationshipRepository extends JpaRepository<UserRelationship, Long> {
    Optional<UserRelationship> findByType(RelationshipType type);

    Optional<UserRelationship> findByFromUser(User user);

    Optional<UserRelationship> findByToUser(User user);

    java.util.List<UserRelationship> findAllByFromUserAndType(User fromUser, RelationshipType type);

    java.util.List<UserRelationship> findAllByToUserAndType(User toUser, RelationshipType type);

    @Query("""
    SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
    FROM UserRelationship r
    WHERE (
        (r.fromUser = :user AND r.toUser = :friend)
        OR
        (r.fromUser = :friend AND r.toUser = :user)
    )
    AND r.type = :type
    """)
    boolean existsFriendship(User user, User friend, RelationshipType type);
}
