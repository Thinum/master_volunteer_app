package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.OrganisationDTO;
import at.jku.volunteer_app.model.UserModelDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.service.OrganisationService;

import java.util.List;

@RestController
@RequestMapping("/organisations")
public class OrganisationController {
    private final OrganisationService organisationService;

    public OrganisationController(OrganisationService organisationService) {
        this.organisationService = organisationService;
    }

    @GetMapping
    public List<OrganisationDTO> getAllOrganisations() {
        return ContractMapper.toOrganisationDTOList(organisationService.getAllOrganisations());
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
                organisation.orgMembers()
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
