package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import univ.iwa.model._Organisation;

import java.util.Optional;

public interface _OrganisationRepository extends JpaRepository<_Organisation, Integer> {
    Optional<_Organisation> findById(int id);
}
