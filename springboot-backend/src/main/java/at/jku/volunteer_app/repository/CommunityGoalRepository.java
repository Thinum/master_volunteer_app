package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.CommunityGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityGoalRepository extends JpaRepository<CommunityGoal, Integer> {

    List<CommunityGoal> findByOrganisationId(int organisationId);
}