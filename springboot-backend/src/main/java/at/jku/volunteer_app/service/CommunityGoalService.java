package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.CommunityGoalContributionDTO;
import at.jku.volunteer_app.contract.CommunityGoalDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.ActivityStatus;
import at.jku.volunteer_app.model.CommunityGoal;
import at.jku.volunteer_app.model.Interest;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.CommunityGoalRepository;
import at.jku.volunteer_app.repository.InterestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CommunityGoalService {

    private final CommunityGoalRepository communityGoalRepository;
    private final OrganisationService organisationService;
    private final ActivityRepository activityRepository;
    private final InterestRepository interestRepository;

    public CommunityGoalService(CommunityGoalRepository communityGoalRepository,
                                OrganisationService organisationService,
                                ActivityRepository activityRepository,
                                InterestRepository interestRepository) {
        this.communityGoalRepository = communityGoalRepository;
        this.organisationService = organisationService;
        this.activityRepository = activityRepository;
        this.interestRepository = interestRepository;
    }

    public CommunityGoal createGoal(CommunityGoal goal, int organisationId) {
        goal.setOrganisation(organisationService.getOrganisationById(organisationId));
        goal.setActivityInterests(resolveInterests(goal.getActivityTags()));
        goal.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        goal.setStatus("ACTIVE");
        goal.setCurrentValue(calculateCurrentValue(goal));
        return communityGoalRepository.save(goal);
    }

    @Transactional(readOnly = true)
    public List<CommunityGoal> getGoalsForOrganisation(int orgId) {
        List<CommunityGoal> goals = communityGoalRepository.findByOrganisationId(orgId);
        goals.forEach(goal -> goal.setCurrentValue(calculateCurrentValue(goal)));
        return goals;
    }

    public CommunityGoal getGoalById(int id) {
        return communityGoalRepository.findById(id).orElse(null);
    }

    public CommunityGoal updateGoal(CommunityGoal goal) {
        CommunityGoal existingGoal = getGoalById(goal.getId());
        if (existingGoal != null) {
            goal.setCreatedAt(existingGoal.getCreatedAt());
            goal.setOrganisation(existingGoal.getOrganisation());
        }
        goal.setActivityInterests(resolveInterests(goal.getActivityTags()));
        goal.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        goal.setCurrentValue(calculateCurrentValue(goal));
        return communityGoalRepository.save(goal);
    }

    public boolean deleteGoal(int id) {
        if (!communityGoalRepository.existsById(id)) {
            return false;
        }
        communityGoalRepository.deleteById(id);
        return true;
    }

    @Transactional(readOnly = true)
    public List<String> getActivityTagsForOrganisation(int organisationId) {
        return activityRepository.findAllByOrganisations_Id(organisationId).stream()
                .flatMap(activity -> safeList(activity.getTags()).stream())
                .filter(tag -> tag != null && !tag.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getActivityInterestsForOrganisation(int organisationId) {
        return activityRepository.findAllByOrganisations_Id(organisationId).stream()
                .flatMap(activity -> getActivityInterestNames(activity).stream())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    @Transactional(readOnly = true)
    public CommunityGoalDTO toGoalDTOWithProgress(CommunityGoal goal) {
        if (goal == null) {
            return null;
        }

        List<Activity> matchingActivities = getMatchingActivities(goal);
        List<CommunityGoalContributionDTO> contributions = buildContributions(matchingActivities);

        return new CommunityGoalDTO(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getTargetValue(),
                matchingActivities.size(),
                getGoalActivityInterestNames(goal),
                contributions,
                goal.getStartDate(),
                goal.getEndDate(),
                goal.getStatus(),
                goal.getCreatedAt(),
                goal.getUpdatedAt(),
                ContractMapper.toOrganisationDTO(goal.getOrganisation())
        );
    }

    public int calculateCurrentValue(int goalId) {
        CommunityGoal goal = getGoalById(goalId);
        return calculateCurrentValue(goal);
    }

    private int calculateCurrentValue(CommunityGoal goal) {
        return getMatchingActivities(goal).size();
    }

    private List<Activity> getMatchingActivities(CommunityGoal goal) {
        if (goal == null || goal.getOrganisation() == null) {
            return List.of();
        }

        Set<String> selectedInterests = getGoalActivityInterestNames(goal).stream()
                .filter(interest -> interest != null && !interest.isBlank())
                .map(this::normalizeInterestName)
                .collect(Collectors.toSet());

        return activityRepository.findAllByOrganisations_Id(goal.getOrganisation().getId()).stream()
                .filter(activity -> activity.getStatus() == ActivityStatus.finished)
                .filter(activity -> isWithinGoalDates(activity, goal))
                .filter(activity -> selectedInterests.isEmpty() || getActivityInterestNames(activity).stream()
                        .map(this::normalizeInterestName)
                        .anyMatch(selectedInterests::contains))
                .toList();
    }

    private List<String> getActivityInterestNames(Activity activity) {
        if (activity == null) {
            return List.of();
        }

        Map<String, String> labels = new LinkedHashMap<>();
        safeList(activity.getCategories()).stream()
                .filter(Objects::nonNull)
                .forEach(category -> labels.put(category.getCode(), category.getLabel()));
        safeList(activity.getTags()).stream()
                .filter(Objects::nonNull)
                .flatMap(tag -> InterestCategory.fromFreeText(tag).stream())
                .forEach(category -> labels.put(category.getCode(), category.getLabel()));
        return new ArrayList<>(labels.values());
    }

    private List<String> getGoalActivityInterestNames(CommunityGoal goal) {
        if (goal == null) {
            return List.of();
        }

        if (goal.getActivityInterests() != null && !goal.getActivityInterests().isEmpty()) {
            return canonicalizeInterestNames(goal.getActivityInterests().stream()
                    .map(Interest::getName)
                    .toList());
        }

        return canonicalizeInterestNames(goal.getActivityTags());
    }

    private List<Interest> resolveInterests(List<String> names) {
        List<String> normalizedNames = canonicalizeInterestNames(names);

        if (normalizedNames.isEmpty()) {
            return List.of();
        }

        List<Interest> existingInterests = interestRepository.findAll();
        List<Interest> resolvedInterests = new ArrayList<>();

        normalizedNames.forEach(name -> {
            Interest existingInterest = existingInterests.stream()
                    .filter(interest -> name.equals(normalizeInterestName(interest.getName())))
                    .findFirst()
                    .orElse(null);

            if (existingInterest != null) {
                if (!name.equals(existingInterest.getName())) {
                    existingInterest.setName(name);
                    interestRepository.save(existingInterest);
                }
                resolvedInterests.add(existingInterest);
                return;
            }

            Interest interest = new Interest();
            interest.setName(name);
            Interest savedInterest = interestRepository.save(interest);
            existingInterests.add(savedInterest);
            resolvedInterests.add(savedInterest);
        });

        return resolvedInterests;
    }

    private List<String> canonicalizeInterestNames(List<String> values) {
        Map<String, String> canonical = new LinkedHashMap<>();
        safeList(values).stream()
                .filter(Objects::nonNull)
                .forEach(value -> {
                    List<InterestCategory> categories = InterestCategory.fromFreeText(value);
                    if (!categories.isEmpty()) {
                        categories.forEach(category -> canonical.put(category.getCode(), category.getLabel()));
                        return;
                    }

                    String fallback = normalizeInterestName(value);
                    if (fallback != null) {
                        canonical.put(fallback.toLowerCase(Locale.ROOT), fallback);
                    }
                });
        return new ArrayList<>(canonical.values());
    }

    private String normalizeInterestName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim().replaceAll("\\s+", " ");
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }

    private boolean isWithinGoalDates(Activity activity, CommunityGoal goal) {
        if (activity.getDate() == null) {
            return false;
        }
        if (goal.getStartDate() != null && activity.getDate().before(goal.getStartDate())) {
            return false;
        }
        return goal.getEndDate() == null || !activity.getDate().after(goal.getEndDate());
    }

    private List<CommunityGoalContributionDTO> buildContributions(List<Activity> activities) {
        Map<Integer, ContributionBucket> activitiesByMember = new LinkedHashMap<>();

        activities.stream()
                .sorted(Comparator.comparing(Activity::getDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(activity -> safeList(activity.getParticipants()).forEach(member ->
                        activitiesByMember
                                .computeIfAbsent(
                                        member.getId(),
                                        ignored -> new ContributionBucket(member, new ArrayList<>())
                                )
                                .activities()
                                .add(ContractMapper.toActivityDTO(activity))
                ));

        return activitiesByMember.values().stream()
                .map(bucket -> new CommunityGoalContributionDTO(
                        ContractMapper.toUserDTO(bucket.member()),
                        bucket.activities()
                ))
                .toList();
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private record ContributionBucket(User member, List<ActivityDTO> activities) {
    }
}
