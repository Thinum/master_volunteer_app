package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import at.jku.volunteer_app.model.Organisation;

import java.util.Optional;

public interface OrganisationRepository extends JpaRepository<Organisation, Integer> {
    Optional<Organisation> findById(int id);
}
