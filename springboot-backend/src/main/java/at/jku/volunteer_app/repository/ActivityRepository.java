package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import at.jku.volunteer_app.model.Activity;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    @Override
    @EntityGraph(attributePaths = {"tags"})
    List<Activity> findAll();

    @EntityGraph(attributePaths = {"participants"})
    Optional<Activity> findById(int id);
    List<Activity> findAllByProjectIdOrderByDateAsc(int projectId);
    long countByProjectId(int projectId);
    List<Activity> findAllByParticipantsContains(at.jku.volunteer_app.model.User user);
    List<Activity> findAllByOrganisations_Id(int organisationId);
}
