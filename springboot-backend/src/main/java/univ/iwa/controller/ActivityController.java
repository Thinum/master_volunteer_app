package univ.iwa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import univ.iwa.model.Activity;
import univ.iwa.service.ActivityService;

import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {
    @Autowired
    private ActivityService activityService;

    @GetMapping
    public List<Activity> getAllActivities() {
        return activityService.getAllActivities();
    }

    @GetMapping("/{id}")
    public Activity getActivityById(@PathVariable int id) {
        return activityService.getActivityById(id);
    }

    @PostMapping
    public Activity createActivity(@RequestBody Activity activity) {
        return activityService.addActivity(activity);
    }

    @DeleteMapping("/{id}")
    public void deleteActivity(@PathVariable int id) {
        activityService.deleteActivity(id);
    }
}
