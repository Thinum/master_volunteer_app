package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ActivityRecommendationDTO;
import at.jku.volunteer_app.contract.RecommendationReasonType;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.ActivitySkillRequirement;
import at.jku.volunteer_app.model.ActivityStatus;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.SkillProficiency;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserSkill;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ActivityRecommendationServiceTest {

    @Test
    void returnsOnlyActivitiesWithMatchingInterestsSkillsOrTags() {
        User user = new User();
        user.setId(1);
        user.setInterestCategories(List.of(InterestCategory.ANIMALS, InterestCategory.OUTDOOR_ACTIVITIES));
        user.setSkillProfiles(List.of(new UserSkill("Animal Care", null, SkillProficiency.ADVANCED)));

        Activity animalShelterWalk = new Activity();
        animalShelterWalk.setId(10);
        animalShelterWalk.setTitle("Animal shelter outdoor walk");
        animalShelterWalk.setPublic(true);
        animalShelterWalk.setStatus(ActivityStatus.open);
        animalShelterWalk.setCapacity(10);
        animalShelterWalk.setParticipants(List.of());
        animalShelterWalk.setCategories(List.of(InterestCategory.ANIMALS));
        animalShelterWalk.setTags(List.of("Outdoor", "Social"));
        animalShelterWalk.setSkillRequirements(List.of(
                ActivitySkillRequirement.required("Animal Care", SkillProficiency.BEGINNER)
        ));

        Activity communityEvent = new Activity();
        communityEvent.setId(20);
        communityEvent.setTitle("Community information stand");
        communityEvent.setPublic(true);
        communityEvent.setStatus(ActivityStatus.open);
        communityEvent.setCapacity(10);
        communityEvent.setParticipants(List.of());
        communityEvent.setCategories(List.of(InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS));
        communityEvent.setTags(List.of("Social"));
        communityEvent.setSkillRequirements(List.of(ActivitySkillRequirement.required("Teamwork")));

        UserRepository userRepository = repository(UserRepository.class, "findById", Optional.of(user));
        ActivityRepository activityRepository = repository(
                ActivityRepository.class,
                "findAll",
                List.of(communityEvent, animalShelterWalk)
        );

        ActivityRecommendationService service = new ActivityRecommendationService(activityRepository, userRepository);
        List<ActivityRecommendationDTO> recommendations = service.getRecommendationsForUser(1);

        assertThat(recommendations).hasSize(1);
        assertThat(recommendations.get(0).activity().id()).isEqualTo(10);
        assertThat(recommendations.get(0).score()).isPositive();
        assertThat(recommendations.get(0).reasons())
                .extracting(reason -> reason.type() + ":" + reason.label())
                .contains(
                        RecommendationReasonType.INTEREST + ":Animals",
                        RecommendationReasonType.REQUIRED_SKILL + ":Animal Care",
                        RecommendationReasonType.TAG + ":Outdoor"
                );
    }

    @SuppressWarnings("unchecked")
    private <T> T repository(Class<T> type, String supportedMethod, Object result) {
        return (T) Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class<?>[]{type},
                (proxy, method, arguments) -> {
                    if (supportedMethod.equals(method.getName())) {
                        return result;
                    }
                    throw new UnsupportedOperationException(method.getName());
                }
        );
    }
}
