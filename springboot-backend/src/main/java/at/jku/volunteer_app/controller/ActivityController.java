package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.model.UserModelDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
    public List<ActivityDTO> getAllActivities() {
        return ContractMapper.toActivityDTOList(activityService.getAllActivities());
    }

    @GetMapping("/{id}")
    public ActivityDTO getActivityById(@PathVariable int id) {
        return ContractMapper.toActivityDTO(activityService.getActivityById(id));
    }

    @GetMapping("/user/{userId}")
    public List<ActivityDTO> getActivitiesByUserId(@PathVariable int userId) {
        return ContractMapper.toActivityDTOList(activityService.getAllActivities().stream()
                .filter(a -> a.getParticipants().stream().anyMatch(u -> u.getId() == userId))
                .toList());
    }

    @PostMapping
    public ActivityDTO createActivity(@RequestBody ActivityDTO activity) {
        return ContractMapper.toActivityDTO(activityService.addActivity(ContractMapper.toActivityEntity(activity)));
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
