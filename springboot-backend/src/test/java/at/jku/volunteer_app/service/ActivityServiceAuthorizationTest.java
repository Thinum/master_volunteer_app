package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceAuthorizationTest {
    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrganisationRepository organisationRepository;
    @Mock
    private OrganisationAdminService organisationAdminService;

    private ActivityService activityService;

    @BeforeEach
    void setUp() {
        activityService = new ActivityService(
                activityRepository,
                userRepository,
                organisationRepository,
                organisationAdminService,
                null
        );
    }

    @Test
    void creatorCanUpdateActivityWithoutASecondAdminCheck() {
        Organisation organisation = organisation(3);
        Activity existing = activity(17, 9, organisation);
        Activity changes = changes("Updated title", organisation(3));
        when(activityRepository.findById(17)).thenReturn(Optional.of(existing));

        Activity updated = activityService.updateActivity(17, changes, 9);

        assertEquals("Updated title", updated.getTitle());
        verify(organisationAdminService, never()).requireAdminOf(any(Integer.class), any(Integer.class));
    }

    @Test
    void administratorOfLinkedOrganisationCanUpdateActivity() {
        Organisation organisation = organisation(3);
        Activity existing = activity(17, 4, organisation);
        Activity changes = changes("Admin update", organisation(3));
        when(activityRepository.findById(17)).thenReturn(Optional.of(existing));
        when(organisationAdminService.isAdminOf(9, 3)).thenReturn(true);

        Activity updated = activityService.updateActivity(17, changes, 9);

        assertEquals("Admin update", updated.getTitle());
    }

    @Test
    void unrelatedUserCannotUpdateActivity() {
        Organisation organisation = organisation(3);
        Activity existing = activity(17, 4, organisation);
        when(activityRepository.findById(17)).thenReturn(Optional.of(existing));
        when(organisationAdminService.isAdminOf(9, 3)).thenReturn(false);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> activityService.updateActivity(17, changes("Rejected", organisation(3)), 9));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verify(activityRepository, never()).flush();
    }

    @Test
    void changingOrganisationStillRequiresAdministrationOfTheNewOrganisation() {
        Organisation originalOrganisation = organisation(3);
        Activity existing = activity(17, 9, originalOrganisation);
        Activity changes = changes("Moved", organisation(8));
        when(activityRepository.findById(17)).thenReturn(Optional.of(existing));
        when(organisationRepository.findAllById(List.of(8))).thenReturn(List.of(organisation(8)));

        activityService.updateActivity(17, changes, 9);

        verify(organisationAdminService).requireAdminOf(9, 8);
    }

    @Test
    void legacySkillsSetterKeepsHibernateCollectionMutable() {
        Activity activity = new Activity();
        activity.setSkills(List.of("First Aid", "Teamwork"));

        assertDoesNotThrow(() -> activity.getSkillRequirements().clear());
    }

    private Activity activity(int id, int creatorId, Organisation organisation) {
        User creator = new User();
        creator.setId(creatorId);
        Activity activity = changes("Original", organisation);
        activity.setId(id);
        activity.setCreatedBy(creator);
        activity.setParticipants(new ArrayList<>());
        activity.setAppointments(new ArrayList<>());
        return activity;
    }

    private Activity changes(String title, Organisation organisation) {
        Activity activity = new Activity();
        activity.setTitle(title);
        activity.setBody(title);
        activity.setDescription(title);
        activity.setOrganisations(List.of(organisation));
        activity.setParticipants(new ArrayList<>());
        activity.setAppointments(new ArrayList<>());
        activity.setTags(new ArrayList<>());
        activity.setCategories(new ArrayList<>());
        activity.setQualifications(new ArrayList<>());
        activity.setPrerequisites(new ArrayList<>());
        activity.setEquipmentProvided(new ArrayList<>());
        return activity;
    }

    private Organisation organisation(int id) {
        Organisation organisation = new Organisation();
        organisation.setId(id);
        return organisation;
    }
}
