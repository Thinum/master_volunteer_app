package at.jku.volunteer_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.repository.ActivityRepository;

import java.util.List;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
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
        return activityRepository.findAllByFriendsContains(user);
    }

    public void deleteActivity(int id) {
        activityRepository.deleteById(id);
    }
}
