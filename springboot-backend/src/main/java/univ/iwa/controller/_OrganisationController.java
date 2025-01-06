package univ.iwa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import univ.iwa.model._Organisation;
import univ.iwa.service._OrganisationService;

import java.util.List;

@RestController
@RequestMapping("/organisations")
public class _OrganisationController {
    @Autowired
    private _OrganisationService organisationService;

    @GetMapping
    public List<_Organisation> getAllOrganisations() {
        return organisationService.getAllOrganisations();
    }

    @GetMapping("/{id}")
    public _Organisation getOrganisationById(@PathVariable int id) {
        return organisationService.getOrganisationById(id);
    }

    @PostMapping
    public _Organisation createOrganisation(@RequestBody _Organisation organisation) {
        return organisationService.addOrganisation(organisation);
    }

    @PutMapping("/{id}")
    public _Organisation updateOrganisation(@RequestBody _Organisation organisation) {
        return organisationService.updateOrganisation(organisation);
    }

    @DeleteMapping("/{id}")
    public boolean deleteOrganisation(@PathVariable int id) {
        return organisationService.deleteOrganisation(id);
    }
}
