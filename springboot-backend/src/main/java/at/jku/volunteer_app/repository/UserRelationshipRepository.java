package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserRelationship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRelationshipRepository extends JpaRepository<UserRelationship, Integer> {
    Optional<UserRelationship> findByType(RelationshipType type);

    Optional<UserRelationship> findByFromUser(User user);

    Optional<UserRelationship> findByToUser(User user);
}
