package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.model.CommunityGoal;
import at.jku.volunteer_app.service.CommunityGoalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/community-goals")
public class CommunityGoalController {

    private final CommunityGoalService communityGoalService;

    public CommunityGoalController(CommunityGoalService communityGoalService) {
        this.communityGoalService = communityGoalService;
    }

    @GetMapping
    public List<CommunityGoal> getGoalsByOrganisation(@RequestParam("organisationId") int organisationId) {
        return communityGoalService.getGoalsForOrganisation(organisationId);
    }

    @GetMapping("/{id}")
    public CommunityGoal getGoalById(@PathVariable int id) {
        return communityGoalService.getGoalById(id);
    }

    @PostMapping
    public CommunityGoal createGoal(@RequestParam("organisationId") int organisationId,
                                    @RequestBody CommunityGoal goal) {
        return communityGoalService.createGoal(goal, organisationId);
    }

    @PutMapping("/{id}")
    public CommunityGoal updateGoal(@PathVariable int id,
                                    @RequestBody CommunityGoal goal) {
        goal.setId(id);
        return communityGoalService.updateGoal(goal);
    }

    @DeleteMapping("/{id}")
    public boolean deleteGoal(@PathVariable int id) {
        return communityGoalService.deleteGoal(id);
    }
}