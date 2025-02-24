package univ.iwa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import univ.iwa.model.Organisation;
import univ.iwa.service.OrganisationService;

import java.util.List;

@RestController
@RequestMapping("/organisations")
public class OrganisationController {
    @Autowired
    private OrganisationService organisationService;

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
}
