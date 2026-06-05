package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.model.UserModelDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.service.ActivityService;

import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public List<Activity> getAllActivities() {
        return activityService.getAllActivities();
    }

    @GetMapping("/{id}")
    public Activity getActivityById(@PathVariable int id) {
        return activityService.getActivityById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Activity> getActivitiesByUserId(@PathVariable int userId) {
        return activityService.getAllActivities().stream()
                .filter(a -> a.getParticipants().stream().anyMatch(u -> u.getId() == userId))
                .toList();
    }

    @PostMapping
    public Activity createActivity(@RequestBody Activity activity) {
        return activityService.addActivity(activity);
    }

    @DeleteMapping("/{id}")
    public void deleteActivity(@PathVariable int id) {
        activityService.deleteActivity(id);
    }

    @PostMapping( "/join/{id}")
    public boolean joinActivity(@AuthenticationPrincipal UserModelDetails userDetails, @PathVariable int id) {
        return activityService.joinActivity(id, userDetails.getUserId());
    }
}
