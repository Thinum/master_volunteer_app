package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.repository.ActivityRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CommunityGoalTaxonomyServiceTest {

    @Test
    void interestOptionsCombineStructuredCategoriesAndLegacyTags() {
        Activity activity = new Activity();
        activity.setCategories(List.of(InterestCategory.ENVIRONMENT_AND_NATURE));
        activity.setTags(List.of("coding", "weekend"));

        ActivityRepository repository = (ActivityRepository) Proxy.newProxyInstance(
                ActivityRepository.class.getClassLoader(),
                new Class<?>[]{ActivityRepository.class},
                (proxy, method, arguments) -> {
                    if ("findAllByOrganisations_Id".equals(method.getName())) {
                        return List.of(activity);
                    }
                    throw new UnsupportedOperationException(method.getName());
                }
        );
        CommunityGoalService service = new CommunityGoalService(null, null, repository, null);

        assertThat(service.getActivityInterestsForOrganisation(7))
                .containsExactly("Environment and Nature", "Technology");
    }
}
