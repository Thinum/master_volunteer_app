package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
    List<Project> findAllByOrganisation_Id(int organisationId);
}
