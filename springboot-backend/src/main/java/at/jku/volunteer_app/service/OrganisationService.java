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
import java.util.Optional;

@Service
public class OrganisationService {
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public OrganisationService(OrganisationRepository organisationRepository, UserRepository userRepository,
                               ActivityRepository activityRepository) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    public List<Organisation> getAllOrganisations(){
        return organisationRepository.findAll();
    }

    public Organisation getOrganisationById(int id) {
        return organisationRepository.findById(id).get();
    }

    public List<Organisation> getOrganisationsForUser(at.jku.volunteer_app.model.User user) {
        return organisationRepository.findAllByOrgContactsContains(user);
    }

    public Organisation addOrganisation(Organisation organisation) {
        return organisationRepository.save(organisation);
    }

    public Organisation updateOrganisation(Organisation organisation) {
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
}
