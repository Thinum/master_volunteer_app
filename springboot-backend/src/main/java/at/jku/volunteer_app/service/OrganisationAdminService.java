package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Org_Admin;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.Org_AdminRepository;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrganisationAdminService {
    private final Org_AdminRepository adminRepository;
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;

    public OrganisationAdminService(Org_AdminRepository adminRepository,
                                    OrganisationRepository organisationRepository,
                                    UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
    }

    public List<Organisation> getAdministeredOrganisations(int userId) {
        return organisationRepository.findAllByOrgAdmins_Id(userId);
    }

    public boolean isPlatformAdmin(int userId) {
        return adminRepository.findOneById(userId).map(Org_Admin::isPlatformAdmin).orElse(false);
    }

    public List<Organisation> getAllOrganisations(int userId) {
        requirePlatformAdmin(userId);
        return organisationRepository.findAllWithAdminAssignments();
    }

    @Transactional
    public Organisation replaceAssignments(int userId, int organisationId, Set<Integer> requestedAdminIds) {
        requirePlatformAdmin(userId);
        Organisation organisation = organisationRepository.findById(organisationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"));

        Set<Integer> requestedIds = requestedAdminIds == null ? new HashSet<>() : new HashSet<>(requestedAdminIds);
        List<Org_Admin> platformAdmins = adminRepository.findAllByPlatformAdminTrue();
        Set<Integer> platformAdminIds = platformAdmins.stream()
                .map(Org_Admin::getId)
                .collect(Collectors.toSet());
        Set<Integer> memberIds = organisation.getOrgMembers().stream()
                .map(member -> member.getUser().getId())
                .collect(Collectors.toSet());

        if (requestedIds.stream().anyMatch(id -> !memberIds.contains(id) && !platformAdminIds.contains(id))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Organisation admins must be members of the organisation"
            );
        }

        Set<Integer> adminIds = new HashSet<>(requestedIds);
        platformAdmins.forEach(admin -> adminIds.add(admin.getId()));

        List<User> selectedUsers = userRepository.findAllById(adminIds);
        if (selectedUsers.size() != adminIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more selected admins do not exist");
        }

        organisation.setOrgAdmins(new HashSet<>(selectedUsers));
        return organisationRepository.save(organisation);
    }

    @Transactional
    public void assignPlatformAdminsTo(Organisation organisation) {
        List<Org_Admin> platformAdmins = adminRepository.findAllByPlatformAdminTrue();
        organisation.getOrgAdmins().addAll(platformAdmins);
        organisationRepository.save(organisation);
    }

    @Transactional
    public void ensureDefaultAssignments() {
        List<Organisation> organisations = organisationRepository.findAll();

        Org_Admin platformAdmin = adminRepository.findOneByUsername("admin").orElse(null);
        if (platformAdmin != null) {
            platformAdmin.setPlatformAdmin(true);
            organisations.forEach(organisation -> organisation.getOrgAdmins().add(platformAdmin));
        }

        Org_Admin alice = adminRepository.findOneByUsername("alice").orElse(null);
        Organisation techAid = organisations.stream()
                .filter(organisation -> "Tech Aid Association".equals(organisation.getOrgName()))
                .findFirst()
                .orElse(null);

        if (alice != null && techAid != null) {
            techAid.getOrgAdmins().add(alice);
        }
        organisationRepository.saveAll(organisations);
    }


    public void requireAdminOf(int userId, int organisationId) {
        if (!organisationRepository.existsByIdAndOrgAdmins_Id(organisationId, userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only an administrator assigned to this organisation may perform this operation"
            );
        }
    }

    private void requirePlatformAdmin(int userId) {
        if (!isPlatformAdmin(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only a platform administrator may manage organisation admin assignments"
            );
        }
    }
}
