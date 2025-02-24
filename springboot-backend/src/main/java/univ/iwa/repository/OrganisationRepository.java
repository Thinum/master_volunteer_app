package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import univ.iwa.model.Organisation;

import java.util.Optional;

public interface OrganisationRepository extends JpaRepository<Organisation, Integer> {
    Optional<Organisation> findById(int id);
}
