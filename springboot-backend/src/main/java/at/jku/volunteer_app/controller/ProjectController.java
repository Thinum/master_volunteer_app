package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.LocationDTO;
import at.jku.volunteer_app.contract.ProjectDTO;
import at.jku.volunteer_app.model.Project;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDTO> getProjects(@RequestParam(required = false) Integer organisationId) {
        return projectService.getAllProjects(organisationId).stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ProjectDTO getProject(@PathVariable int id) {
        return toDTO(projectService.getProject(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDTO createProject(@RequestBody ProjectDTO project,
                                    @AuthenticationPrincipal UserModelDetails userDetails) {
        return toDTO(projectService.createProject(project, requireUser(userDetails)));
    }

    @PutMapping("/{id}")
    public ProjectDTO updateProject(@PathVariable int id,
                                    @RequestBody ProjectDTO project,
                                    @AuthenticationPrincipal UserModelDetails userDetails) {
        return toDTO(projectService.updateProject(id, project, requireUser(userDetails)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable int id,
                              @AuthenticationPrincipal UserModelDetails userDetails) {
        projectService.deleteProject(id, requireUser(userDetails));
    }

    private int requireUser(UserModelDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userDetails.getUserId();
    }

    private ProjectDTO toDTO(Project project) {
        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getLocation() == null
                        ? null
                        : new LocationDTO(project.getLocation().getLat(), project.getLocation().getLon()),
                project.isClosed(),
                project.getOrganisation().getId(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
