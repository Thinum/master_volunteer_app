package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import at.jku.volunteer_app.model.Organisation;

import java.util.List;
import java.util.Optional;

public interface OrganisationRepository extends JpaRepository<Organisation, Integer> {
    
    @Override
    @EntityGraph(attributePaths = {"tags", "orgContacts"})
    List<Organisation> findAll();

    @EntityGraph(attributePaths = {"tags", "orgContacts"})
    Optional<Organisation> findById(int id);
}
