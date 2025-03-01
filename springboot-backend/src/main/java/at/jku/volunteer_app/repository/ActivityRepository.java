package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import at.jku.volunteer_app.model.Activity;

import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    Optional<Activity> findById(int id);
    Optional<Activity> findByProjectId(int projectId);
}
