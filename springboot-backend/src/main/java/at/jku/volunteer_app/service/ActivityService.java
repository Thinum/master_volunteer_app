package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.repository.ActivityRepository;

import java.security.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    public List<Activity> getAllActivities(){
        return activityRepository.findAll();
    }

    public Activity getActivityById(int id) {
        return activityRepository.findById(id).get();
    }

    public Activity addActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public Activity updateActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public Activity getActivityByProjectId(int projectId) {
        return activityRepository.findByProjectId(projectId).get();
    }

    public List<Activity> getActivitiesForUser(at.jku.volunteer_app.model.User user) {
        return activityRepository.findAllByParticipantsContains(user);
    }

    public void deleteActivity(int id) {
        activityRepository.deleteById(id);
    }

    public boolean joinActivity(int activityId, int userId) {
        Optional<Activity> optionalActivity = activityRepository.findById(activityId);
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalActivity.isEmpty() || optionalUser.isEmpty()) {
            return false;
        }
        Activity activity = optionalActivity.get();
        User user = optionalUser.get();
        if (activity.getParticipants().stream().anyMatch(user1 -> user1.getId() == userId)) {
            return false;
        }
        activity.getParticipants().add(user);
        activityRepository.save(activity);
        return true;
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
