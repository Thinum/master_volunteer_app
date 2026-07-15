package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ActivityRecommendationDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.RecommendationReasonDTO;
import at.jku.volunteer_app.contract.RecommendationReasonType;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.ActivitySkillRequirement;
import at.jku.volunteer_app.model.ActivityStatus;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.SkillProficiency;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserSkill;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class ActivityRecommendationService {

    private static final double INTEREST_MATCH_SCORE = 28.0;
    private static final double REQUIRED_SKILL_MATCH_SCORE = 34.0;
    private static final double PREFERRED_SKILL_MATCH_SCORE = 18.0;
    private static final double TAG_MATCH_SCORE = 10.0;

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityRecommendationService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityRecommendationDTO> getRecommendationsForUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return activityRepository.findAll().stream()
                .filter(activity -> isRecommendableActivity(activity, userId))
                .map(activity -> scoreActivity(user, activity))
                .filter(scored -> scored.score() > 0.0)
                .sorted(Comparator.comparingDouble(ScoredActivity::score).reversed()
                        .thenComparing(scored -> scored.activity().getDate(), Comparator.nullsLast(Timestamp::compareTo))
                        .thenComparing(scored -> safeText(scored.activity().getTitle()), String.CASE_INSENSITIVE_ORDER))
                .map(scored -> new ActivityRecommendationDTO(
                        ContractMapper.toActivityDTO(scored.activity()),
                        round(scored.score()),
                        scored.reasons()
                ))
                .toList();
    }

    private ScoredActivity scoreActivity(User user, Activity activity) {
        List<RecommendationReasonDTO> reasons = new ArrayList<>();
        double score = 0.0;

        Set<InterestCategory> userInterests = new LinkedHashSet<>(safeList(user.getInterestCategories()));
        Set<InterestCategory> activityCategories = collectActivityCategories(activity);

        for (InterestCategory category : activityCategories) {
            if (userInterests.contains(category)) {
                score += addReason(
                        reasons,
                        RecommendationReasonType.INTEREST,
                        category.getLabel(),
                        "Matches your interest in " + category.getLabel(),
                        INTEREST_MATCH_SCORE
                );
            }
        }

        score += addMatchingTagReasons(reasons, userInterests, activity);
        score += addSkillReasons(reasons, user, activity.getRequiredSkills(), true);
        score += addSkillReasons(reasons, user, activity.getPreferredSkills(), false);

        return new ScoredActivity(activity, score, reasons);
    }

    private double addMatchingTagReasons(
            List<RecommendationReasonDTO> reasons,
            Set<InterestCategory> userInterests,
            Activity activity
    ) {
        double score = 0.0;
        Set<String> matchedTags = new LinkedHashSet<>();

        for (String tag : safeList(activity.getTags())) {
            if (tag == null || tag.isBlank()) {
                continue;
            }

            boolean matchesUserInterest = InterestCategory.fromFreeText(tag).stream().anyMatch(userInterests::contains);
            if (matchesUserInterest && matchedTags.add(normalizeText(tag))) {
                score += addReason(
                        reasons,
                        RecommendationReasonType.TAG,
                        cleanLabel(tag),
                        "Activity tag matches your profile: " + cleanLabel(tag),
                        TAG_MATCH_SCORE
                );
            }
        }

        return score;
    }

    private double addSkillReasons(
            List<RecommendationReasonDTO> reasons,
            User user,
            List<ActivitySkillRequirement> activitySkills,
            boolean required
    ) {
        double score = 0.0;
        Map<String, UserSkill> userSkillsByKey = indexUserSkills(user);
        Set<String> matchedSkills = new LinkedHashSet<>();

        for (ActivitySkillRequirement requirement : safeList(activitySkills)) {
            if (requirement == null || requirement.getName() == null || requirement.getName().isBlank()) {
                continue;
            }

            UserSkill matchingSkill = findMatchingUserSkill(userSkillsByKey, requirement);
            if (matchingSkill == null) {
                continue;
            }

            String matchedSkillKey = skillKey(requirement.getName(), requirement.getEscoSkillUri());
            if (!matchedSkills.add(matchedSkillKey)) {
                continue;
            }

            SkillProficiency minimum = requirement.getMinimumProficiencyOrDefault();
            SkillProficiency userLevel = matchingSkill.getProficiencyOrDefault();
            double baseScore = required ? REQUIRED_SKILL_MATCH_SCORE : PREFERRED_SKILL_MATCH_SCORE;
            double contribution = baseScore * proficiencyFit(userLevel, minimum);

            score += addReason(
                    reasons,
                    required ? RecommendationReasonType.REQUIRED_SKILL : RecommendationReasonType.PREFERRED_SKILL,
                    cleanLabel(requirement.getName()),
                    skillReasonDetail(required, cleanLabel(requirement.getName()), userLevel, minimum),
                    contribution
            );
        }

        return score;
    }

    private Set<InterestCategory> collectActivityCategories(Activity activity) {
        Set<InterestCategory> categories = new LinkedHashSet<>(safeList(activity.getCategories()));

        safeList(activity.getTags()).forEach(tag -> categories.addAll(InterestCategory.fromFreeText(tag)));
        categories.addAll(InterestCategory.fromFreeText(activity.getTitle()));
        categories.addAll(InterestCategory.fromFreeText(activity.getDescription()));
        categories.addAll(InterestCategory.fromFreeText(activity.getBody()));

        for (Organisation organisation : safeList(activity.getOrganisations())) {
            if (organisation == null) {
                continue;
            }
            if (organisation.getCategory() != null) {
                categories.addAll(InterestCategory.fromFreeText(organisation.getCategory().name()));
            }
            safeSet(organisation.getTags()).forEach(tag -> categories.addAll(InterestCategory.fromFreeText(tag)));
        }

        return categories;
    }

    private Map<String, UserSkill> indexUserSkills(User user) {
        Map<String, UserSkill> skillsByKey = new LinkedHashMap<>();

        for (UserSkill skill : safeList(user.getSkillProfiles())) {
            if (skill == null || skill.getName() == null || skill.getName().isBlank()) {
                continue;
            }

            String nameKey = skillKey(skill.getName(), null);
            skillsByKey.putIfAbsent(nameKey, skill);

            if (skill.getEscoSkillUri() != null && !skill.getEscoSkillUri().isBlank()) {
                skillsByKey.putIfAbsent(skillKey(skill.getName(), skill.getEscoSkillUri()), skill);
            }
        }

        return skillsByKey;
    }

    private UserSkill findMatchingUserSkill(
            Map<String, UserSkill> userSkillsByKey,
            ActivitySkillRequirement requirement
    ) {
        if (requirement.getEscoSkillUri() != null && !requirement.getEscoSkillUri().isBlank()) {
            UserSkill uriMatch = userSkillsByKey.get(skillKey(requirement.getName(), requirement.getEscoSkillUri()));
            if (uriMatch != null) {
                return uriMatch;
            }
        }

        return userSkillsByKey.get(skillKey(requirement.getName(), null));
    }

    private boolean isRecommendableActivity(Activity activity, int userId) {
        if (activity == null || !activity.isPublic()) {
            return false;
        }
        if (activity.getStatus() == ActivityStatus.finished || activity.getStatus() == ActivityStatus.canceled) {
            return false;
        }
        if (isActivityFull(activity)) {
            return false;
        }
        return safeList(activity.getParticipants()).stream()
                .noneMatch(participant -> participant != null && participant.getId() == userId);
    }

    private boolean isActivityFull(Activity activity) {
        int capacity = activity.getCapacity();
        if (capacity <= 0) {
            return false;
        }

        int spotsTaken = activity.getParticipants() == null ? activity.getSpotsTaken() : activity.getParticipants().size();
        return spotsTaken >= capacity;
    }

    private String skillReasonDetail(
            boolean required,
            String skillName,
            SkillProficiency userLevel,
            SkillProficiency minimum
    ) {
        String requirementType = required ? "required" : "preferred";
        if (minimum == null || userLevel.meets(minimum)) {
            return "You match the " + requirementType + " skill " + skillName;
        }

        return "You partially match the " + requirementType + " skill " + skillName;
    }

    private double proficiencyFit(SkillProficiency userLevel, SkillProficiency minimum) {
        SkillProficiency effectiveUserLevel = userLevel == null ? SkillProficiency.defaultUserLevel() : userLevel;
        SkillProficiency effectiveMinimum = minimum == null ? SkillProficiency.defaultActivityMinimum() : minimum;
        if (effectiveUserLevel.meets(effectiveMinimum)) {
            return 1.0 + Math.max(0, effectiveUserLevel.getLevel() - effectiveMinimum.getLevel()) * 0.08;
        }

        return Math.max(0.35, (double) effectiveUserLevel.getLevel() / effectiveMinimum.getLevel());
    }

    private double addReason(
            List<RecommendationReasonDTO> reasons,
            RecommendationReasonType type,
            String label,
            String detail,
            double contribution
    ) {
        double roundedContribution = round(contribution);
        String normalizedLabel = normalizeText(label);

        for (int i = 0; i < reasons.size(); i++) {
            RecommendationReasonDTO existingReason = reasons.get(i);
            if (!normalizeText(existingReason.label()).equals(normalizedLabel)) {
                continue;
            }

            if (roundedContribution > existingReason.scoreContribution()) {
                reasons.set(i, new RecommendationReasonDTO(type, label, detail, roundedContribution));
                return contribution - existingReason.scoreContribution();
            }

            return 0.0;
        }

        reasons.add(new RecommendationReasonDTO(type, label, detail, roundedContribution));
        return contribution;
    }

    private String skillKey(String name, String escoSkillUri) {
        if (escoSkillUri != null && !escoSkillUri.isBlank()) {
            return normalizeText(escoSkillUri);
        }
        return normalizeSkillName(name);
    }

    private String normalizeSkillName(String value) {
        return normalizeText(value).replace("organization", "organisation");
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String cleanLabel(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private <T> Set<T> safeSet(Set<T> values) {
        return values == null ? Set.of() : values;
    }

    private record ScoredActivity(Activity activity, double score, List<RecommendationReasonDTO> reasons) {
    }
}
