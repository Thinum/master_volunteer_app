package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ActivityEngagementAccessDTO;
import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.EngagementLevelRequirementRepository;
import at.jku.volunteer_app.repository.OrganisationMemberRepository;
import at.jku.volunteer_app.repository.OrganisationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EngagementLevelServiceTest {
    @Mock private EngagementLevelRequirementRepository requirementRepository;
    @Mock private OrganisationMemberRepository memberRepository;
    @Mock private OrganisationRepository organisationRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private OrganisationAdminService organisationAdminService;

    private EngagementLevelService service;
    private Organisation organisation;
    private User user;
    private OrganisationMember member;
    private List<EngagementLevelRequirement> requirements;

    @BeforeEach
    void setUp() {
        service = new EngagementLevelService(
                requirementRepository,
                memberRepository,
                organisationRepository,
                activityRepository,
                organisationAdminService
        );

        organisation = new Organisation();
        organisation.setId(10);
        organisation.setOrgName("Test Organization");

        user = new User();
        user.setId(7);

        member = new OrganisationMember();
        member.setId(1L);
        member.setOrganisation(organisation);
        member.setUser(user);
        member.setEngagementLevel(0);

        requirements = List.of(
                requirement(0, 3, 0, 0, EngagementTimeUnit.MONTHS),
                requirement(1, 20, 1, 3, EngagementTimeUnit.MONTHS),
                requirement(2, null, 4, 1, EngagementTimeUnit.MONTHS),
                requirement(3, null, 100, 1, EngagementTimeUnit.YEARS)
        );

        lenient().when(memberRepository.findByOrganisation_IdAndUser_Id(10, 7)).thenReturn(Optional.of(member));
        lenient().when(requirementRepository.findAllByOrganisation_IdOrderByLevelAsc(10)).thenReturn(requirements);
        requirements.forEach(requirement -> lenient().when(requirementRepository.findByOrganisation_IdAndLevel(10, requirement.getLevel()))
                .thenReturn(Optional.of(requirement)));
    }

    @Test
    void promotesMemberFromFinishedActivityWithinConfiguredTimespan() {
        Activity completed = activity(1, ActivityStatus.finished, true);
        completed.setDate(Timestamp.from(Instant.now().minus(5, ChronoUnit.DAYS)));
        when(activityRepository.findAllByOrganisations_Id(10)).thenReturn(List.of(completed));

        int level = service.getCurrentLevel(10, 7);

        assertThat(level).isEqualTo(1);
        assertThat(member.getEngagementLevel()).isEqualTo(1);
        verify(memberRepository).save(member);
    }

    @Test
    void neverMovesDedicatedVolunteerDown() {
        member.setEngagementLevel(3);

        int level = service.getCurrentLevel(10, 7);

        assertThat(level).isEqualTo(3);
        verify(memberRepository, never()).save(any());
        verifyNoInteractions(activityRepository);
    }

    @Test
    void organisationAdminAlwaysReceivesPermanentDedicatedLevel() {
        when(organisationAdminService.isAdminOf(7, 10)).thenReturn(true);
        member.setEngagementLevel(1);

        int level = service.getCurrentLevel(10, 7);

        assertThat(level).isEqualTo(EngagementLevelService.DEDICATED_LEVEL);
        assertThat(member.getEngagementLevel()).isEqualTo(EngagementLevelService.DEDICATED_LEVEL);
        verify(memberRepository).save(member);
        verifyNoInteractions(activityRepository);
    }

    @Test
    void blocksRegistrationWhenCurrentLevelLimitIsReached() {
        List<Activity> activeRegistrations = List.of(
                activity(1, ActivityStatus.open, true),
                activity(2, ActivityStatus.upcoming, true),
                activity(3, ActivityStatus.open, true)
        );
        when(activityRepository.findAllByOrganisations_Id(10)).thenReturn(activeRegistrations);

        Activity target = activity(99, ActivityStatus.open, false);
        ActivityEngagementAccessDTO access = service.getActivityAccess(target, 7);

        assertThat(access.canRegister()).isFalse();
        assertThat(access.registrationLimit()).isEqualTo(3);
        assertThat(access.activeRegistrations()).isEqualTo(3);
        assertThat(access.limitationMessage()).contains("registration limit").contains("3 of 3");
    }

    private EngagementLevelRequirement requirement(int level, Integer limit, int requiredActivities,
                                                   int timespanValue, EngagementTimeUnit unit) {
        EngagementLevelRequirement requirement = new EngagementLevelRequirement();
        requirement.setOrganisation(organisation);
        requirement.setLevel(level);
        requirement.setRegistrationLimit(limit);
        requirement.setRequiredActivities(requiredActivities);
        requirement.setTimespanValue(timespanValue);
        requirement.setTimespanUnit(unit);
        return requirement;
    }

    private Activity activity(int id, ActivityStatus status, boolean includesUser) {
        Activity activity = new Activity();
        activity.setId(id);
        activity.setStatus(status);
        activity.setOrganisations(List.of(organisation));
        activity.setParticipants(includesUser ? new ArrayList<>(List.of(user)) : new ArrayList<>());
        return activity;
    }
}
