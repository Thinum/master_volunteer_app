package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.OrganisationRecommendationDTO;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.OrganisationMember;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserSkill;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class OrganisationRecommendationServiceTest {

    @Test
    void recommendsOnlyOrganisationsWhoseTagsMatchTheUserProfile() {
        User user = new User();
        user.setId(1);
        user.setInterestCategories(List.of(InterestCategory.TECHNOLOGY));
        user.setSkillProfiles(List.of(UserSkill.fromName("Mentorship")));

        Organisation strongMatch = organisation(10, "Tech mentors", Set.of("coding", "mentorship"));
        Organisation weakerMatch = organisation(20, "Programming club", Set.of("programming"));
        Organisation unrelated = organisation(30, "Food bank", Set.of("cooking"));
        Organisation alreadyJoined = organisation(40, "Joined coding club", Set.of("coding"));
        OrganisationMember membership = new OrganisationMember();
        membership.setUser(user);
        alreadyJoined.setOrgMembers(new LinkedHashSet<>(Set.of(membership)));

        UserRepository userRepository = repository(
                UserRepository.class,
                "findById",
                Optional.of(user)
        );
        OrganisationRepository organisationRepository = repository(
                OrganisationRepository.class,
                "findAll",
                List.of(unrelated, alreadyJoined, weakerMatch, strongMatch)
        );

        OrganisationRecommendationService service = new OrganisationRecommendationService(
                organisationRepository,
                userRepository
        );
        List<OrganisationRecommendationDTO> recommendations = service.getRecommendationsForUser(1);

        assertThat(recommendations).hasSize(2);
        assertThat(recommendations.get(0).organisation().id()).isEqualTo(10);
        assertThat(recommendations.get(0).reasons())
                .extracting(reason -> reason.label())
                .containsExactlyInAnyOrder("coding", "mentorship");
        assertThat(recommendations.get(1).organisation().id()).isEqualTo(20);
    }

    private Organisation organisation(int id, String name, Set<String> tags) {
        Organisation organisation = new Organisation();
        organisation.setId(id);
        organisation.setOrgName(name);
        organisation.setTags(new LinkedHashSet<>(tags));
        organisation.setOrgContacts(new LinkedHashSet<>());
        organisation.setOrgMembers(new LinkedHashSet<>());
        organisation.setOrgAdmins(new LinkedHashSet<>());
        return organisation;
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
