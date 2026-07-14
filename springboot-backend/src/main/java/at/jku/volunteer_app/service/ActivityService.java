package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.OrganisationRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.repository.ActivityRepository;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final OrganisationAdminService organisationAdminService;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository,
                           OrganisationRepository organisationRepository,
                           OrganisationAdminService organisationAdminService) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.organisationAdminService = organisationAdminService;
    }

    public List<Activity> getAllActivities(){
        return activityRepository.findAll();
    }

    public List<String> getActivityTagCatalog() {
        Set<String> tags = new LinkedHashSet<>(List.of(
                "outdoor",
                "outdoors",
                "indoor",
                "beginner-friendly",
                "social",
                "weekend",
                "physical",
                "advanced",
                "after-school",
                "community",
                "environment",
                "education",
                "animals",
                "food",
                "emergency",
                "training",
                "rescue",
                "music",
                "fundraising",
                "families",
                "students",
                "shelter",
                "care"
        ));

        activityRepository.findAll().forEach(activity ->
                safeList(activity.getTags()).stream()
                        .map(this::cleanTag)
                        .filter(tag -> tag != null && !tag.isBlank())
                        .forEach(tags::add)
        );

        return new ArrayList<>(tags);
    }

    public Activity getActivityById(int id) {
        return activityRepository.findById(id).get();
    }

    public Activity addActivity(Activity activity) {
        normalizeActivityProfile(activity);
        syncSpotsTaken(activity);
        return activityRepository.save(activity);
    }

    public Activity updateActivity(Activity activity) {
        normalizeActivityProfile(activity);
        syncSpotsTaken(activity);
        return activityRepository.save(activity);
    }

    @Transactional
    public Activity createActivity(Activity activity, int userId) {
        List<Organisation> organisations = resolveAdministeredOrganisations(activity, userId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Timestamp now = new Timestamp(System.currentTimeMillis());

        activity.setId(0);
        activity.setOrganisations(organisations);
        activity.setCreatedBy(creator);
        activity.setParticipants(new ArrayList<>());
        activity.setAppointments(new ArrayList<>());
        activity.setCreatedAt(now);
        activity.setUpdatedAt(now);
        return addActivity(activity);
    }

    @Transactional
    public Activity updateActivity(int id, Activity changes, int userId) {
        Activity existing = getActivityOrThrow(id);
        requireAdminOfAll(existing.getOrganisations(), userId);
        List<Organisation> organisations = resolveAdministeredOrganisations(changes, userId);

        BeanUtils.copyProperties(changes, existing,
                "id", "organisations", "participants", "appointments", "createdBy", "createdAt", "spotsTaken");
        existing.setOrganisations(organisations);
        existing.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        normalizeActivityProfile(existing);
        syncSpotsTaken(existing);
        return activityRepository.save(existing);
    }

    @Transactional
    public void deleteActivity(int id, int userId) {
        Activity existing = getActivityOrThrow(id);
        requireAdminOfAll(existing.getOrganisations(), userId);
        activityRepository.delete(existing);
    }

    private Activity getActivityOrThrow(int id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    }

    private List<Organisation> resolveAdministeredOrganisations(Activity activity, int userId) {
        List<Integer> ids = activity == null || activity.getOrganisations() == null
                ? List.of()
                : activity.getOrganisations().stream().map(Organisation::getId).distinct().toList();
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one organisation is required");
        }
        ids.forEach(id -> organisationAdminService.requireAdminOf(userId, id));
        return ids.stream().map(id -> organisationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"))).toList();
    }

    private void requireAdminOfAll(List<Organisation> organisations, int userId) {
        List<Organisation> owners = safeList(organisations);
        if (owners.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "An activity without an owning organisation cannot be managed");
        }
        owners.forEach(org -> organisationAdminService.requireAdminOf(userId, org.getId()));
    }

    public Activity getActivityByProjectId(int projectId) {
        return activityRepository.findByProjectId(projectId).get();
    }

    public List<Activity> getActivitiesForUser(at.jku.volunteer_app.model.User user) {
        return activityRepository.findAllByParticipantsContains(user);
    }

    public boolean joinActivity(int activityId, int userId) {
        Optional<Activity> optionalActivity = activityRepository.findById(activityId);
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalActivity.isEmpty() || optionalUser.isEmpty()) {
            return false;
        }
        Activity activity = optionalActivity.get();
        User user = optionalUser.get();
        if (activity.getParticipants() == null) {
            activity.setParticipants(new ArrayList<>());
        }
        if (activity.getParticipants().stream().anyMatch(user1 -> user1.getId() == userId)) {
            return false;
        }
        if (activity.getCapacity() > 0 && activity.getParticipants().size() >= activity.getCapacity()) {
            return false;
        }
        activity.getParticipants().add(user);
        activity.setSpotsTaken(activity.getParticipants().size());
        activityRepository.save(activity);
        return true;
    }

    private void syncSpotsTaken(Activity activity) {
        if (activity != null && activity.getParticipants() != null) {
            activity.setSpotsTaken(activity.getParticipants().size());
        }
    }

    private void normalizeActivityProfile(Activity activity) {
        if (activity == null) {
            return;
        }

        if (activity.getTags() == null) {
            activity.setTags(List.of());
        } else {
            activity.setTags(cleanTags(activity.getTags()));
        }

        if (activity.getCategories() == null || activity.getCategories().isEmpty()) {
            activity.setCategories(inferCategories(activity));
        }
    }

    private List<InterestCategory> inferCategories(Activity activity) {
        Set<InterestCategory> categories = new LinkedHashSet<>();

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
            if (organisation.getTags() != null) {
                organisation.getTags().forEach(tag -> categories.addAll(InterestCategory.fromFreeText(tag)));
            }
        }

        return new ArrayList<>(categories);
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private String cleanTag(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private List<String> cleanTags(List<String> values) {
        Set<String> seen = new LinkedHashSet<>();
        List<String> cleaned = new ArrayList<>();

        safeList(values).stream()
                .map(this::cleanTag)
                .filter(tag -> tag != null && !tag.isBlank())
                .forEach(tag -> {
                    String key = tag.replace('_', ' ')
                            .replace('-', ' ')
                            .toLowerCase()
                            .replaceAll("\\s+", " ");
                    if (seen.add(key)) {
                        cleaned.add(tag);
                    }
                });

        return cleaned;
    }

//    public List<Activity> getCompletedActivitiesForOrganisation(
//            int organisationId,
//            Timestamp start,
//            Timestamp end
//    ) {
//        //Timestamp now = new Timestamp(System.currentTimeMillis());
//
//        List<Activity> activities =
//                activityRepository.findByOrganisationAndDateRange(
//                        organisationId,
//                        start,
//                        end
//                );
//
//        return activities.stream()
//                .filter(a -> a.getDate() != null && a.getDate().before(now))
//                .toList();
//    }
}
