package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.OrganisationAdminAssignmentDTO;
import at.jku.volunteer_app.contract.UpdateOrganisationAdminsRequest;
import at.jku.volunteer_app.contract.UserDTO;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.OrganisationAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/organisation-admin-assignments")
public class OrganisationAdminAssignmentController {
    private final OrganisationAdminService organisationAdminService;

    public OrganisationAdminAssignmentController(OrganisationAdminService organisationAdminService) {
        this.organisationAdminService = organisationAdminService;
    }

    @GetMapping("/access")
    public boolean hasPlatformAdminAccess(@AuthenticationPrincipal UserModelDetails userDetails) {
        return userDetails != null && organisationAdminService.isPlatformAdmin(userDetails.getUserId());
    }

    @GetMapping
    public List<OrganisationAdminAssignmentDTO> getAssignments(
            @AuthenticationPrincipal UserModelDetails userDetails) {
        int userId = requireUser(userDetails);
        return organisationAdminService.getAllOrganisations(userId).stream()
                .map(this::toAssignmentDTO)
                .toList();
    }

    @GetMapping("/admins")
    public List<UserDTO> getAvailableAdmins(@AuthenticationPrincipal UserModelDetails userDetails) {
        return organisationAdminService.getAllUsers(requireUser(userDetails)).stream()
                .map(ContractMapper::toUserDTO)
                .toList();
    }

    @PutMapping("/{organisationId}")
    public OrganisationAdminAssignmentDTO updateAssignments(
            @PathVariable int organisationId,
            @RequestBody UpdateOrganisationAdminsRequest request,
            @AuthenticationPrincipal UserModelDetails userDetails) {
        Organisation organisation = organisationAdminService.replaceAssignments(
                requireUser(userDetails), organisationId, request == null ? null : request.adminIds());
        return toAssignmentDTO(organisation);
    }

    private OrganisationAdminAssignmentDTO toAssignmentDTO(Organisation organisation) {
        return new OrganisationAdminAssignmentDTO(
                organisation.getId(),
                organisation.getOrgName(),
                organisation.getOrgAdmins().stream().map(ContractMapper::toUserDTO).toList()
        );
    }

    private int requireUser(UserModelDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userDetails.getUserId();
    }
}
