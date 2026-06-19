package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.UserModelDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.model.Organisation;
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
    public List<Organisation> getAllOrganisations() {
        return organisationService.getAllOrganisations();
    }

    @GetMapping("/{id}")
    public Organisation getOrganisationById(@PathVariable int id) {
        return organisationService.getOrganisationById(id);
    }

    @PostMapping
    public Organisation createOrganisation(@RequestBody Organisation organisation) {
        return organisationService.addOrganisation(organisation);
    }

    @PutMapping("/{id}")
    public Organisation updateOrganisation(@RequestBody Organisation organisation) {
        return organisationService.updateOrganisation(organisation);
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
    public List<Activity> getExampleActivities(@PathVariable int id){
        return this.organisationService.getExampleActivities(id);
    }
}
