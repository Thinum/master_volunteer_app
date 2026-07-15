package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.SkillConceptDTO;
import at.jku.volunteer_app.model.SkillConcept;
import at.jku.volunteer_app.repository.SkillConceptRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class SkillCatalogServiceTest {

    @Test
    void importedEscoConceptOverridesLocalLabelAndKeepsCrosswalk() {
        List<SkillConcept> stored = new ArrayList<>();
        SkillConceptRepository repository = repository(stored);
        SkillCatalogService service = new SkillCatalogService(repository);

        service.importConcepts(List.of(new SkillConceptDTO(
                "http://data.europa.eu/esco/skill/example-programming",
                "Programming",
                List.of("Computer programming"),
                "Write and maintain computer code.",
                "skill/competence",
                "cross-sector",
                List.of("http://data.europa.eu/esco/skill/example-digital"),
                List.of("technology"),
                "ESCO",
                "1.2.1"
        )));

        SkillConceptDTO programming = service.getCatalog().stream()
                .filter(skill -> "Programming".equals(skill.preferredLabel()))
                .findFirst()
                .orElseThrow();

        assertThat(programming.conceptUri()).isEqualTo("http://data.europa.eu/esco/skill/example-programming");
        assertThat(programming.alternativeLabels()).containsExactly("Computer programming");
        assertThat(programming.relatedInterestCodes()).containsExactly("TECHNOLOGY");
        assertThat(programming.source()).isEqualTo("ESCO");
    }

    @SuppressWarnings("unchecked")
    private SkillConceptRepository repository(List<SkillConcept> stored) {
        return (SkillConceptRepository) Proxy.newProxyInstance(
                SkillConceptRepository.class.getClassLoader(),
                new Class<?>[]{SkillConceptRepository.class},
                (proxy, method, arguments) -> switch (method.getName()) {
                    case "findAll" -> stored;
                    case "findByConceptUri" -> stored.stream()
                            .filter(skill -> arguments[0].equals(skill.getConceptUri()))
                            .findFirst();
                    case "findByNormalizedLabel" -> stored.stream()
                            .filter(skill -> arguments[0].equals(skill.getNormalizedLabel()))
                            .findFirst();
                    case "save" -> {
                        SkillConcept saved = (SkillConcept) arguments[0];
                        stored.removeIf(skill -> skill.getNormalizedLabel().equals(saved.getNormalizedLabel()));
                        stored.add(saved);
                        yield saved;
                    }
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }
}
