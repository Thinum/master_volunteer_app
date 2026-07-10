package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.ActivityRecommendationDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.ActivityRecommendationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.service.ActivityService;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {
    private final ActivityService activityService;
    private final ActivityRecommendationService activityRecommendationService;

    public ActivityController(ActivityService activityService, ActivityRecommendationService activityRecommendationService) {
        this.activityService = activityService;
        this.activityRecommendationService = activityRecommendationService;
    }

    @GetMapping
    public List<ActivityDTO> getAllActivities() {
        return ContractMapper.toActivityDTOList(activityService.getAllActivities());
    }

    @GetMapping("/tags/catalog")
    public List<String> getActivityTagCatalog() {
        return activityService.getActivityTagCatalog();
    }

    @GetMapping("/{id}")
    public ActivityDTO getActivityById(@PathVariable int id) {
        return ContractMapper.toActivityDTO(activityService.getActivityById(id));
    }

    @GetMapping("/recommendations")
    public List<ActivityRecommendationDTO> getRecommendedActivities(
            @AuthenticationPrincipal UserModelDetails userDetails
    ) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return activityRecommendationService.getRecommendationsForUser(userDetails.getUserId());
    }

    @GetMapping("/recommendations/user/{userId}")
    public List<ActivityRecommendationDTO> getRecommendedActivitiesByUserId(@PathVariable int userId) {
        return activityRecommendationService.getRecommendationsForUser(userId);
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
