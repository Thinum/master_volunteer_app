package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import univ.iwa.model.Activity;

import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    Optional<Activity> findById(int id);
    Optional<Activity> findByProject_id(int project_id);
}
