package at.jku.volunteer_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.repository.ActivityRepository;

import java.util.List;

@Service
public class ActivityService {
    @Autowired
    private ActivityRepository activityRepository;
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

    public Activity getActivityByProjectId(int project_id) {
        return activityRepository.findById(project_id).get();
    }

    public void deleteActivity(int id) {
        activityRepository.deleteById(id);
    }
}
