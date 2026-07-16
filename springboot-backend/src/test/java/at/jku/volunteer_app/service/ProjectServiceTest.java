package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ProjectDTO;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.Project;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.ProjectRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock private ProjectRepository projectRepository;
    @Mock private OrganisationRepository organisationRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrganisationAdminService organisationAdminService;
    @Mock private ActivityRepository activityRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(
                projectRepository,
                organisationRepository,
                userRepository,
                organisationAdminService,
                activityRepository
        );
    }

    @Test
    void createsTimeBoundProjectForAdministeredOrganisation() {
        Organisation organisation = new Organisation();
        organisation.setId(12);
        User creator = new User();
        creator.setId(7);
        ProjectDTO input = input(LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31));

        when(organisationRepository.findById(12)).thenReturn(Optional.of(organisation));
        when(userRepository.findById(7)).thenReturn(Optional.of(creator));
        when(projectRepository.save(org.mockito.ArgumentMatchers.any(Project.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Project saved = projectService.createProject(input, 7);

        verify(organisationAdminService).requireAdminOf(7, 12);
        assertSame(organisation, saved.getOrganisation());
        assertSame(creator, saved.getCreatedBy());
        assertEquals(LocalDate.of(2026, 8, 1), saved.getStartDate());
        assertEquals(LocalDate.of(2026, 8, 31), saved.getEndDate());
        assertEquals("Riverside restoration", saved.getTitle());
    }

    @Test
    void rejectsEndDateBeforeStartDate() {
        ProjectDTO input = input(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 8, 31));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> projectService.createProject(input, 7)
        );

        assertEquals(400, error.getStatusCode().value());
    }

    private ProjectDTO input(LocalDate startDate, LocalDate endDate) {
        return new ProjectDTO(
                0,
                "Riverside restoration",
                "Restore the trail during August.",
                null,
                startDate,
                endDate,
                false,
                12,
                null,
                0,
                null,
                null
        );
    }
}
