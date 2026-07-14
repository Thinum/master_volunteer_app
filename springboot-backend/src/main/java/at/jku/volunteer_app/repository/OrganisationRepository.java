package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import at.jku.volunteer_app.model.Organisation;

import java.util.List;
import java.util.Optional;

public interface OrganisationRepository extends JpaRepository<Organisation, Integer> {
    
    @Override
    @EntityGraph(attributePaths = {"tags", "orgContacts", "orgAdmins"})
    List<Organisation> findAll();

    @EntityGraph(attributePaths = {"tags", "orgContacts", "orgMembers", "orgMembers.user", "orgAdmins"})
    Optional<Organisation> findById(int id);

    @EntityGraph(attributePaths = {"tags", "orgContacts", "orgMembers", "orgMembers.user", "orgAdmins"})
    List<Organisation> findAllByOrgMembers_User(at.jku.volunteer_app.model.User user);

    @EntityGraph(attributePaths = {"tags", "orgContacts", "orgAdmins"})
    List<Organisation> findAllByOrgAdmins_Id(int userId);

    boolean existsByIdAndOrgAdmins_Id(int organisationId, int userId);
}
