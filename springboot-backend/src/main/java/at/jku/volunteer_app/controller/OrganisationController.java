package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.OrganisationDTO;
import at.jku.volunteer_app.contract.OrganisationRecommendationDTO;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.OrganisationAdminService;
import at.jku.volunteer_app.service.OrganisationRecommendationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import at.jku.volunteer_app.service.OrganisationService;

import java.util.List;

@RestController
@RequestMapping("/organisations")
public class OrganisationController {
    private final OrganisationService organisationService;
    private final OrganisationAdminService organisationAdminService;
    private final OrganisationRecommendationService organisationRecommendationService;

    public OrganisationController(OrganisationService organisationService,
                                  OrganisationAdminService organisationAdminService,
                                  OrganisationRecommendationService organisationRecommendationService) {
        this.organisationService = organisationService;
        this.organisationAdminService = organisationAdminService;
        this.organisationRecommendationService = organisationRecommendationService;
    }

    @GetMapping
    public List<OrganisationDTO> getAllOrganisations() {
        return ContractMapper.toOrganisationDTOList(organisationService.getAllOrganisations());
    }

    @GetMapping("/recommendations")
    public List<OrganisationRecommendationDTO> getRecommendedOrganisations(
            @AuthenticationPrincipal UserModelDetails userDetails
    ) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return organisationRecommendationService.getRecommendationsForUser(userDetails.getUserId());
    }

    @GetMapping("/administered")
    public List<OrganisationDTO> getAdministeredOrganisations(
            @AuthenticationPrincipal UserModelDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return ContractMapper.toOrganisationDTOList(
                organisationAdminService.getAdministeredOrganisations(userDetails.getUserId()));
    }

    @GetMapping("/{id}")
    public OrganisationDTO getOrganisationById(@PathVariable int id) {
        return ContractMapper.toOrganisationDTO(organisationService.getOrganisationById(id));
    }

    @PostMapping
    public OrganisationDTO createOrganisation(@RequestBody OrganisationDTO organisation) {
        return ContractMapper.toOrganisationDTO(organisationService.addOrganisation(ContractMapper.toOrganisationEntity(organisation)));
    }

    @PutMapping("/{id}")
    public OrganisationDTO updateOrganisation(@PathVariable int id, @RequestBody OrganisationDTO organisation) {
        OrganisationDTO organisationToUpdate = new OrganisationDTO(
                id,
                organisation.orgName(),
                organisation.location(),
                organisation.profilePicture(),
                organisation.createdAt(),
                organisation.body(),
                organisation.deactivated(),
                organisation.reactivationTime(),
                organisation.category(),
                organisation.tags(),
                organisation.orgContacts(),
                organisation.orgMembers(),
                organisation.orgAdmins()
        );
        return ContractMapper.toOrganisationDTO(organisationService.updateOrganisation(ContractMapper.toOrganisationEntity(organisationToUpdate)));
    }

    @DeleteMapping("/{id}")
    public boolean deleteOrganisation(@PathVariable int id) {
        return organisationService.deleteOrganisation(id);
    }

    @PostMapping( "/join/{id}")
    public boolean joinOrganisation(@AuthenticationPrincipal UserModelDetails userDetails, @PathVariable int id) {
        return organisationService.joinOrganisation(id, userDetails.getUserId());
    }

    @GetMapping("/{id}/exampleActivities")
    public List<ActivityDTO> getExampleActivities(@PathVariable int id){
        return ContractMapper.toActivityDTOList(this.organisationService.getExampleActivities(id));
    }
}
