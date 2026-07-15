package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.SkillConceptDTO;
import at.jku.volunteer_app.service.SkillCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/skills")
public class SkillCatalogController {

    private final SkillCatalogService skillCatalogService;

    public SkillCatalogController(SkillCatalogService skillCatalogService) {
        this.skillCatalogService = skillCatalogService;
    }

    @GetMapping("/catalog")
    public List<SkillConceptDTO> getCatalog() {
        return skillCatalogService.getCatalog();
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public List<SkillConceptDTO> importConcepts(@RequestBody List<SkillConceptDTO> concepts) {
        return skillCatalogService.importConcepts(concepts);
    }
}
