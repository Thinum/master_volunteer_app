package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.TagConceptDTO;
import at.jku.volunteer_app.repository.ActivityRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ActivityTaxonomyServiceTest {

    @Test
    void structuredTagsExposeInterestAndSkillCrosswalks() {
        ActivityRepository repository = (ActivityRepository) Proxy.newProxyInstance(
                ActivityRepository.class.getClassLoader(),
                new Class<?>[]{ActivityRepository.class},
                (proxy, method, arguments) -> {
                    if ("findAll".equals(method.getName())) {
                        return List.of();
                    }
                    throw new UnsupportedOperationException(method.getName());
                }
        );
        ActivityService service = new ActivityService(repository, null, null, null, null);

        TagConceptDTO environment = service.getActivityTagConceptCatalog().stream()
                .filter(tag -> "environment".equals(tag.preferredLabel()))
                .findFirst()
                .orElseThrow();

        assertThat(environment.conceptUri()).isEqualTo("urn:volunteer-app:taxonomy:tags:environment");
        assertThat(environment.relatedInterestCodes()).contains("ENVIRONMENT_AND_NATURE");
        assertThat(environment.relatedSkillLabels()).contains("Environmental Work");
    }
}
