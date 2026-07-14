package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.OrganisationMember;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.repository.OrganisationRepository;

import java.util.List;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class OrganisationService {
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final OrganisationAdminService organisationAdminService;

    public OrganisationService(OrganisationRepository organisationRepository, UserRepository userRepository,
                               ActivityRepository activityRepository,
                               OrganisationAdminService organisationAdminService) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.organisationAdminService = organisationAdminService;
    }

    public List<Organisation> getAllOrganisations(){
        return organisationRepository.findAll();
    }

    public Organisation getOrganisationById(int id) {
        return organisationRepository.findById(id).get();
    }

    public List<Organisation> getOrganisationsForUser(at.jku.volunteer_app.model.User user) {
        return organisationRepository.findAllByOrgMembers_User(user);
    }

    public Organisation addOrganisation(Organisation organisation) {
        normalizeOrganisationProfile(organisation);
        Organisation saved = organisationRepository.save(organisation);
        organisationAdminService.assignPlatformAdminsTo(saved);
        return organisationRepository.findById(saved.getId()).orElse(saved);
    }

    public Organisation updateOrganisation(Organisation organisation) {
        normalizeOrganisationProfile(organisation);
        return organisationRepository.save(organisation);
    }

    public boolean deleteOrganisation(int id) {
        return false;
        //TODO: Change
    }

    public boolean joinOrganisation(int organisationId, int userId) {
        Optional<Organisation> optionalOrganisation = organisationRepository.findById(organisationId);
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalOrganisation.isEmpty() || optionalUser.isEmpty()) {
            return false;
        }
        Organisation organisation = optionalOrganisation.get();
        User user = optionalUser.get();
        boolean alreadyMember = organisation.getOrgMembers().stream()
                .anyMatch(member -> member.getUser().getId() == userId);

        if (alreadyMember) {
            return false;
        }
        OrganisationMember organisationMember = new OrganisationMember();
        organisationMember.setUser(user);
        organisationMember.setOrganisation(organisation);
        organisationMember.setEngagementLevel(0);
        organisationMember.setJoinedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        organisation.getOrgMembers().add(organisationMember);
        organisationRepository.save(organisation);
        return true;
    }

    //Gets activities for an organization that are displayed for non-locked in users
    public List<Activity> getExampleActivities(int organisationId){
        // Just as a test we return all activities for the organisation
        return this.activityRepository.findAllByOrganisations_Id(organisationId);
    }

    private void normalizeOrganisationProfile(Organisation organisation) {
        if (organisation == null) {
            return;
        }
        organisation.setTags(cleanTags(organisation.getTags()));
    }

    private Set<String> cleanTags(Set<String> values) {
        Set<String> cleaned = new LinkedHashSet<>();
        Set<String> seen = new LinkedHashSet<>();

        if (values == null) {
            return cleaned;
        }

        values.stream()
                .map(this::cleanTag)
                .filter(tag -> tag != null && !tag.isBlank())
                .forEach(tag -> {
                    String key = tag.replace('_', ' ')
                            .replace('-', ' ')
                            .toLowerCase()
                            .replaceAll("\\s+", " ");
                    if (seen.add(key)) {
                        cleaned.add(tag);
                    }
                });

        return cleaned;
    }

    private String cleanTag(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }
}
