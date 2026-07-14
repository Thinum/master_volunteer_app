package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ProjectDTO;
import at.jku.volunteer_app.model.Location;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.Project;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.ProjectRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final OrganisationAdminService organisationAdminService;

    public ProjectService(ProjectRepository projectRepository,
                          OrganisationRepository organisationRepository,
                          UserRepository userRepository,
                          OrganisationAdminService organisationAdminService) {
        this.projectRepository = projectRepository;
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.organisationAdminService = organisationAdminService;
    }

    public List<Project> getAllProjects(Integer organisationId) {
        return organisationId == null
                ? projectRepository.findAll()
                : projectRepository.findAllByOrganisation_Id(organisationId);
    }

    public Project getProject(int id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @Transactional
    public Project createProject(ProjectDTO input, int userId) {
        validate(input);
        organisationAdminService.requireAdminOf(userId, input.organisationId());
        Organisation organisation = getOrganisation(input.organisationId());
        User creator = getUser(userId);
        Timestamp now = new Timestamp(System.currentTimeMillis());

        Project project = new Project();
        applyInput(project, input);
        project.setOrganisation(organisation);
        project.setCreatedBy(creator);
        project.setCreatedAt(now);
        project.setUpdatedAt(now);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(int id, ProjectDTO input, int userId) {
        validate(input);
        Project project = getProject(id);
        organisationAdminService.requireAdminOf(userId, project.getOrganisation().getId());
        organisationAdminService.requireAdminOf(userId, input.organisationId());

        applyInput(project, input);
        project.setOrganisation(getOrganisation(input.organisationId()));
        project.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(int id, int userId) {
        Project project = getProject(id);
        organisationAdminService.requireAdminOf(userId, project.getOrganisation().getId());
        projectRepository.delete(project);
    }

    private void applyInput(Project project, ProjectDTO input) {
        project.setTitle(input.title().trim());
        project.setDescription(input.description());
        project.setLocation(input.location() == null
                ? null
                : new Location(input.location().lat(), input.location().lon()));
        project.setClosed(input.closed());
    }

    private void validate(ProjectDTO input) {
        if (input == null || input.title() == null || input.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project title is required");
        }
        if (input.organisationId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organisation is required");
        }
    }

    private Organisation getOrganisation(int id) {
        return organisationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"));
    }

    private User getUser(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
