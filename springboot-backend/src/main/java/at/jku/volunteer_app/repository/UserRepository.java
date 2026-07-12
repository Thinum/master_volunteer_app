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
    @EntityGraph(attributePaths = {"interestCategories", "skillProfiles"})
    List<User> findAll();

    @Override
    @EntityGraph(attributePaths = {"interestCategories", "skillProfiles"})
    Optional<User> findById(Integer id);

    @EntityGraph(attributePaths = {"interestCategories", "skillProfiles"})
    Optional<User> findByName(String name);

    @EntityGraph(attributePaths = {"interestCategories", "skillProfiles"})
    Optional<User> findByUsername(String username);
}
