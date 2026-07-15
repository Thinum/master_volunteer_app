package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.OrganisationRecommendationDTO;
import at.jku.volunteer_app.contract.RecommendationReasonDTO;
import at.jku.volunteer_app.contract.RecommendationReasonType;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.OrganisationMember;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class OrganisationRecommendationService {

    private static final double TAG_MATCH_SCORE = 10.0;

    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;

    public OrganisationRecommendationService(
            OrganisationRepository organisationRepository,
            UserRepository userRepository
    ) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganisationRecommendationDTO> getRecommendationsForUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return organisationRepository.findAll().stream()
                .filter(organisation -> isRecommendable(organisation, userId))
                .map(organisation -> scoreOrganisation(user, organisation))
                .filter(scored -> scored.score() > 0.0)
                .sorted(Comparator.comparingDouble(ScoredOrganisation::score).reversed()
                        .thenComparing(scored -> safeText(scored.organisation().getOrgName()), String.CASE_INSENSITIVE_ORDER))
                .map(scored -> new OrganisationRecommendationDTO(
                        ContractMapper.toOrganisationDTO(scored.organisation()),
                        scored.score(),
                        scored.reasons()
                ))
                .toList();
    }

    private ScoredOrganisation scoreOrganisation(User user, Organisation organisation) {
        Set<InterestCategory> interests = new LinkedHashSet<>(safeList(user.getInterestCategories()));
        Set<String> skills = new LinkedHashSet<>();
        user.getSkills().stream().map(this::normalize).forEach(skills::add);

        List<RecommendationReasonDTO> reasons = new ArrayList<>();
        for (String tag : safeSet(organisation.getTags())) {
            if (tag == null || tag.isBlank()) {
                continue;
            }

            boolean matchesInterest = InterestCategory.fromFreeText(tag).stream().anyMatch(interests::contains);
            boolean matchesSkill = skills.contains(normalize(tag));
            if (matchesInterest || matchesSkill) {
                String label = tag.trim().replaceAll("\\s+", " ");
                reasons.add(new RecommendationReasonDTO(
                        RecommendationReasonType.TAG,
                        label,
                        "Organization tag matches your profile: " + label,
                        TAG_MATCH_SCORE
                ));
            }
        }

        return new ScoredOrganisation(organisation, reasons.size() * TAG_MATCH_SCORE, reasons);
    }

    private boolean isRecommendable(Organisation organisation, int userId) {
        if (organisation == null || organisation.isDeactivated()) {
            return false;
        }

        return safeSet(organisation.getOrgMembers()).stream()
                .map(OrganisationMember::getUser)
                .noneMatch(member -> member != null && member.getId() == userId);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private <T> Set<T> safeSet(Set<T> values) {
        return values == null ? Set.of() : values;
    }

    private record ScoredOrganisation(
            Organisation organisation,
            double score,
            List<RecommendationReasonDTO> reasons
    ) {
    }
}
