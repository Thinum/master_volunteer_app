package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.OrganisationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, Long> {
    Optional<OrganisationMember> findByOrganisation_IdAndUser_Id(int organisationId, int userId);
}
