package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.EngagementLevelRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EngagementLevelRequirementRepository extends JpaRepository<EngagementLevelRequirement, Long> {
    List<EngagementLevelRequirement> findAllByOrganisation_IdOrderByLevelAsc(int organisationId);
    Optional<EngagementLevelRequirement> findByOrganisation_IdAndLevel(int organisationId, int level);
}
