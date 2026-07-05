package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.RelationshipType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import at.jku.volunteer_app.model.User;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Override
    @EntityGraph(attributePaths = {"interests"})
    List<User> findAll();

    Optional<User> findByName(String name);

    Optional<User> findByUsername(String username);
}
