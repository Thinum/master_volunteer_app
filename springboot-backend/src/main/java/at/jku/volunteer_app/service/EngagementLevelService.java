package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.ActivityEngagementAccessDTO;
import at.jku.volunteer_app.contract.EngagementLevelOverviewDTO;
import at.jku.volunteer_app.contract.EngagementLevelRequirementDTO;
import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.ActivityRepository;
import at.jku.volunteer_app.repository.EngagementLevelRequirementRepository;
import at.jku.volunteer_app.repository.OrganisationMemberRepository;
import at.jku.volunteer_app.repository.OrganisationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class EngagementLevelService {
    public static final int DEDICATED_LEVEL = 3;

    private static final Map<Integer, LevelDefinition> DEFINITIONS = Map.of(
            0, new LevelDefinition("Inactive Member", "No Engagement",
                    List.of("Register for and deregister from activities"), false),
            1, new LevelDefinition("Active Member", "Basic Engagement",
                    List.of("Invite other people", "Register for and deregister from activities"), false),
            2, new LevelDefinition("Engaged Volunteer", "Moderate Engagement",
                    List.of("Invite other people", "Register for and deregister from activities"), false),
            3, new LevelDefinition("Dedicated Volunteer", "High Engagement",
                    List.of("Create, update and delete activities", "Manage organization goals"), true)
    );

    private final EngagementLevelRequirementRepository requirementRepository;
    private final OrganisationMemberRepository memberRepository;
    private final OrganisationRepository organisationRepository;
    private final ActivityRepository activityRepository;
    private final OrganisationAdminService organisationAdminService;

    public EngagementLevelService(EngagementLevelRequirementRepository requirementRepository,
                                  OrganisationMemberRepository memberRepository,
                                  OrganisationRepository organisationRepository,
                                  ActivityRepository activityRepository,
                                  OrganisationAdminService organisationAdminService) {
        this.requirementRepository = requirementRepository;
        this.memberRepository = memberRepository;
        this.organisationRepository = organisationRepository;
        this.activityRepository = activityRepository;
        this.organisationAdminService = organisationAdminService;
    }

    @Transactional
    public void ensureDefaults(Organisation organisation) {
        if (organisation == null || organisation.getId() <= 0) {
            return;
        }
        Map<Integer, EngagementLevelRequirement> existing = new HashMap<>();
        requirementRepository.findAllByOrganisation_IdOrderByLevelAsc(organisation.getId())
                .forEach(requirement -> existing.put(requirement.getLevel(), requirement));

        for (int level = 0; level <= DEDICATED_LEVEL; level++) {
            if (!existing.containsKey(level)) {
                requirementRepository.save(defaultRequirement(organisation, level));
            }
        }
    }

    @Transactional
    public EngagementLevelOverviewDTO getOverview(int organisationId, int userId) {
        Organisation organisation = getOrganisation(organisationId);
        ensureDefaults(organisation);
        int currentLevel = getCurrentLevel(organisationId, userId);
        boolean canManageSettings = organisationAdminService.isAdminOf(userId, organisationId);
        boolean canManageContent = canManageSettings || currentLevel >= DEDICATED_LEVEL;
        long activeRegistrations = currentLevel < 0 ? 0 : countActiveRegistrations(organisationId, userId);

        return new EngagementLevelOverviewDTO(
                organisationId,
                organisation.getOrgName(),
                canManageSettings,
                currentLevel,
                levelName(currentLevel),
                activeRegistrations,
                currentLevel >= 1,
                currentLevel >= 1 ? null : "Reach Level 1 by completing the organization’s Level 1 activity requirement to invite others.",
                canManageContent,
                canManageContent ? null : "Reach Level 3 to create, update or delete activities and manage organization goals.",
                getRequirements(organisationId).stream().map(this::toDTO).toList()
        );
    }

    @Transactional
    public EngagementLevelOverviewDTO updateRequirements(int organisationId, int userId,
                                                          List<EngagementLevelRequirementDTO> updates) {
        organisationAdminService.requireAdminOf(userId, organisationId);
        Organisation organisation = getOrganisation(organisationId);
        ensureDefaults(organisation);

        if (updates == null || updates.size() != 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All four engagement levels are required");
        }

        Map<Integer, EngagementLevelRequirementDTO> updatesByLevel = new HashMap<>();
        updates.forEach(update -> {
            if (update == null || update.level() < 0 || update.level() > DEDICATED_LEVEL
                    || updatesByLevel.put(update.level(), update) != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Engagement levels 0 through 3 must each be supplied once");
            }
        });

        getRequirements(organisationId).forEach(requirement -> {
            EngagementLevelRequirementDTO update = updatesByLevel.get(requirement.getLevel());
            validateUpdate(update);
            requirement.setRegistrationLimit(update.registrationLimit());
            if (requirement.getLevel() > 0) {
                requirement.setRequiredActivities(update.requiredActivities());
                requirement.setTimespanValue(update.timespanValue());
                requirement.setTimespanUnit(update.timespanUnit());
            }
        });
        return getOverview(organisationId, userId);
    }

    @Transactional
    public int getCurrentLevel(int organisationId, int userId) {
        Optional<OrganisationMember> optionalMember = memberRepository
                .findByOrganisation_IdAndUser_Id(organisationId, userId);
        if (organisationAdminService.isAdminOf(userId, organisationId)) {
            optionalMember.ifPresent(member -> {
                if (member.getEngagementLevel() < DEDICATED_LEVEL) {
                    member.setEngagementLevel(DEDICATED_LEVEL);
                    memberRepository.save(member);
                }
            });
            return DEDICATED_LEVEL;
        }
        if (optionalMember.isEmpty()) {
            return -1;
        }

        OrganisationMember member = optionalMember.get();
        if (member.getEngagementLevel() >= DEDICATED_LEVEL) {
            return DEDICATED_LEVEL;
        }

        ensureDefaults(member.getOrganisation());
        int calculatedLevel = 0;
        List<EngagementLevelRequirement> requirements = getRequirements(organisationId);
        for (int candidate = DEDICATED_LEVEL; candidate >= 1; candidate--) {
            int candidateLevel = candidate;
            EngagementLevelRequirement requirement = requirements.get(candidateLevel);
            if (countCompletedActivities(organisationId, userId, requirement) >= requirement.getRequiredActivities()) {
                calculatedLevel = candidate;
                break;
            }
        }

        if (member.getEngagementLevel() != calculatedLevel) {
            member.setEngagementLevel(calculatedLevel);
            memberRepository.save(member);
        }
        return calculatedLevel;
    }

    @Transactional
    public void refreshMemberLevels(Organisation organisation) {
        if (organisation == null || organisation.getOrgMembers() == null) {
            return;
        }
        organisation.getOrgMembers().forEach(member -> getCurrentLevel(organisation.getId(), member.getUser().getId()));
    }

    @Transactional
    public boolean canManageActivitiesAndGoals(int userId, int organisationId) {
        return organisationAdminService.isAdminOf(userId, organisationId)
                || getCurrentLevel(organisationId, userId) >= DEDICATED_LEVEL;
    }

    public void requireCanManageActivitiesAndGoals(int userId, int organisationId) {
        if (!canManageActivitiesAndGoals(userId, organisationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Reach Level 3 in this organization to manage its activities and goals");
        }
    }

    @Transactional
    public List<Organisation> getManageableOrganisations(int userId) {
        return organisationRepository.findAll().stream()
                .filter(organisation -> canManageActivitiesAndGoals(userId, organisation.getId()))
                .toList();
    }

    @Transactional
    public ActivityEngagementAccessDTO getActivityAccess(Activity activity, int userId) {
        if (activity == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
        }
        boolean alreadyRegistered = safeParticipants(activity).stream().anyMatch(user -> user.getId() == userId);
        if (alreadyRegistered) {
            Organisation organisation = firstOrganisation(activity);
            int level = organisation == null ? -1 : getCurrentLevel(organisation.getId(), userId);
            return new ActivityEngagementAccessDTO(
                    level >= 0,
                    organisation == null ? 0 : organisation.getId(),
                    level,
                    levelName(level),
                    organisation == null ? 0 : countActiveRegistrations(organisation.getId(), userId),
                    organisation == null || level < 0 ? null : getRequirement(organisation.getId(), level).getRegistrationLimit(),
                    false,
                    true,
                    "You are already registered. You can deregister from this activity."
            );
        }

        List<Organisation> organisations = activity.getOrganisations() == null ? List.of() : activity.getOrganisations();
        ActivityEngagementAccessDTO bestDeniedAccess = null;
        for (Organisation organisation : organisations) {
            int level = getCurrentLevel(organisation.getId(), userId);
            if (level < 0) {
                continue;
            }
            ensureDefaults(organisation);
            EngagementLevelRequirement requirement = getRequirement(organisation.getId(), level);
            long activeRegistrations = countActiveRegistrations(organisation.getId(), userId);
            Integer limit = requirement.getRegistrationLimit();
            boolean allowed = limit == null || activeRegistrations < limit;
            ActivityEngagementAccessDTO access = new ActivityEngagementAccessDTO(
                    true,
                    organisation.getId(),
                    level,
                    levelName(level),
                    activeRegistrations,
                    limit,
                    allowed,
                    false,
                    allowed ? null : "Your " + levelName(level) + " registration limit for "
                            + organisation.getOrgName() + " has been reached (" + activeRegistrations + " of " + limit
                            + "). Complete activities to reach the next level or deregister from another activity."
            );
            if (allowed) {
                return access;
            }
            if (bestDeniedAccess == null || access.currentLevel() > bestDeniedAccess.currentLevel()) {
                bestDeniedAccess = access;
            }
        }

        if (bestDeniedAccess != null) {
            return bestDeniedAccess;
        }
        return new ActivityEngagementAccessDTO(
                false, 0, -1, levelName(-1), 0, null, false, false,
                "Join one of this activity’s organizations before registering for the activity."
        );
    }

    public void requireCanRegister(Activity activity, int userId) {
        ActivityEngagementAccessDTO access = getActivityAccess(activity, userId);
        if (!access.canRegister()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, access.limitationMessage());
        }
    }

    private List<EngagementLevelRequirement> getRequirements(int organisationId) {
        return requirementRepository.findAllByOrganisation_IdOrderByLevelAsc(organisationId);
    }

    private EngagementLevelRequirement getRequirement(int organisationId, int level) {
        return requirementRepository.findByOrganisation_IdAndLevel(organisationId, level)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Engagement level configuration is incomplete"));
    }

    private long countCompletedActivities(int organisationId, int userId,
                                          EngagementLevelRequirement requirement) {
        Timestamp cutoff = cutoff(requirement.getTimespanValue(), requirement.getTimespanUnit());
        Timestamp now = new Timestamp(System.currentTimeMillis());
        return activityRepository.findAllByOrganisations_Id(organisationId).stream()
                .filter(activity -> activity.getStatus() == ActivityStatus.finished)
                .filter(activity -> activity.getDate() != null && !activity.getDate().before(cutoff)
                        && !activity.getDate().after(now))
                .filter(activity -> safeParticipants(activity).stream().anyMatch(user -> user.getId() == userId))
                .map(Activity::getId)
                .distinct()
                .count();
    }

    private long countActiveRegistrations(int organisationId, int userId) {
        return activityRepository.findAllByOrganisations_Id(organisationId).stream()
                .filter(activity -> activity.getStatus() != ActivityStatus.finished
                        && activity.getStatus() != ActivityStatus.canceled)
                .filter(activity -> safeParticipants(activity).stream().anyMatch(user -> user.getId() == userId))
                .map(Activity::getId)
                .distinct()
                .count();
    }

    private Timestamp cutoff(int value, EngagementTimeUnit unit) {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime cutoff = switch (unit == null ? EngagementTimeUnit.MONTHS : unit) {
            case DAYS -> now.minusDays(value);
            case WEEKS -> now.minusWeeks(value);
            case MONTHS -> now.minusMonths(value);
            case YEARS -> now.minusYears(value);
        };
        return Timestamp.from(cutoff.toInstant());
    }

    private void validateUpdate(EngagementLevelRequirementDTO update) {
        if (update.registrationLimit() != null && update.registrationLimit() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration limits cannot be negative");
        }
        if (update.level() > 0 && (update.requiredActivities() < 1 || update.timespanValue() < 1
                || update.timespanUnit() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Activity count, timespan and timespan unit are required for Levels 1 through 3");
        }
    }

    private EngagementLevelRequirement defaultRequirement(Organisation organisation, int level) {
        EngagementLevelRequirement requirement = new EngagementLevelRequirement();
        requirement.setOrganisation(organisation);
        requirement.setLevel(level);
        switch (level) {
            case 0 -> {
                requirement.setRegistrationLimit(3);
                requirement.setRequiredActivities(0);
                requirement.setTimespanValue(0);
                requirement.setTimespanUnit(EngagementTimeUnit.MONTHS);
            }
            case 1 -> {
                requirement.setRegistrationLimit(20);
                requirement.setRequiredActivities(1);
                requirement.setTimespanValue(3);
                requirement.setTimespanUnit(EngagementTimeUnit.MONTHS);
            }
            case 2 -> {
                requirement.setRegistrationLimit(null);
                requirement.setRequiredActivities(4);
                requirement.setTimespanValue(1);
                requirement.setTimespanUnit(EngagementTimeUnit.MONTHS);
            }
            case 3 -> {
                requirement.setRegistrationLimit(null);
                requirement.setRequiredActivities(100);
                requirement.setTimespanValue(1);
                requirement.setTimespanUnit(EngagementTimeUnit.YEARS);
            }
            default -> throw new IllegalArgumentException("Unknown engagement level " + level);
        }
        return requirement;
    }

    private EngagementLevelRequirementDTO toDTO(EngagementLevelRequirement requirement) {
        LevelDefinition definition = DEFINITIONS.get(requirement.getLevel());
        return new EngagementLevelRequirementDTO(
                requirement.getLevel(),
                definition.name(),
                definition.engagementLabel(),
                definition.functionality(),
                unlockCondition(requirement),
                requirement.getRegistrationLimit(),
                requirement.getRequiredActivities(),
                requirement.getTimespanValue(),
                requirement.getTimespanUnit(),
                definition.permanentOnceReached()
        );
    }

    private String unlockCondition(EngagementLevelRequirement requirement) {
        if (requirement.getLevel() == 0) {
            return "Join the organization";
        }
        return "Complete " + requirement.getRequiredActivities() + " "
                + pluralize("activity", requirement.getRequiredActivities()) + " within "
                + requirement.getTimespanValue() + " "
                + requirement.getTimespanUnit().name().toLowerCase(Locale.ROOT);
    }

    private String pluralize(String word, int count) {
        return count == 1 ? word : "activities";
    }

    private String levelName(int level) {
        return level < 0 ? "New Member" : DEFINITIONS.get(level).name();
    }

    private Organisation getOrganisation(int organisationId) {
        return organisationRepository.findById(organisationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"));
    }

    private Organisation firstOrganisation(Activity activity) {
        return activity.getOrganisations() == null || activity.getOrganisations().isEmpty()
                ? null : activity.getOrganisations().get(0);
    }

    private List<User> safeParticipants(Activity activity) {
        return activity.getParticipants() == null ? List.of() : activity.getParticipants();
    }

    private record LevelDefinition(String name, String engagementLabel, List<String> functionality,
                                   boolean permanentOnceReached) {
    }
}
