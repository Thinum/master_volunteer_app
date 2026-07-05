package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.CommunityGoal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityGoalRepository extends JpaRepository<CommunityGoal, Integer> {
    @Override
    @EntityGraph(attributePaths = {"activityInterests", "organisation"})
    List<CommunityGoal> findAll();

    @Override
    @EntityGraph(attributePaths = {"activityInterests", "organisation"})
    Optional<CommunityGoal> findById(Integer id);

    @EntityGraph(attributePaths = {"activityInterests", "organisation"})
    List<CommunityGoal> findByOrganisationId(int organisationId);
}
