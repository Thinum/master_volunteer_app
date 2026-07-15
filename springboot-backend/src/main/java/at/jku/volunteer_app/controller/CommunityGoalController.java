package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.CommunityGoalDTO;
import at.jku.volunteer_app.contract.ContractMapper;
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
    public List<CommunityGoalDTO> getGoalsByOrganisation(@RequestParam("organisationId") int organisationId) {
        return communityGoalService.getGoalsForOrganisation(organisationId).stream()
                .map(communityGoalService::toGoalDTOWithProgress)
                .toList();
    }

    @GetMapping("/activity-tags")
    public List<String> getActivityTagsByOrganisation(@RequestParam("organisationId") int organisationId) {
        return communityGoalService.getActivityTagsForOrganisation(organisationId);
    }

    @GetMapping("/activity-interests")
    public List<String> getActivityInterestsByOrganisation(@RequestParam("organisationId") int organisationId) {
        return communityGoalService.getActivityInterestsForOrganisation(organisationId);
    }

    @GetMapping("/{id}")
    public CommunityGoalDTO getGoalById(@PathVariable int id) {
        return communityGoalService.toGoalDTOWithProgress(communityGoalService.getGoalById(id));
    }

    @PostMapping
    public CommunityGoalDTO createGoal(@RequestParam("organisationId") int organisationId,
                                       @RequestBody CommunityGoalDTO goal) {
        return ContractMapper.toCommunityGoalDTO(
                communityGoalService.createGoal(ContractMapper.toCommunityGoalEntity(goal), organisationId)
        );
    }

    @PutMapping("/{id}")
    public CommunityGoalDTO updateGoal(@PathVariable int id,
                                       @RequestBody CommunityGoalDTO goal) {
        CommunityGoalDTO goalToUpdate = new CommunityGoalDTO(
                id,
                goal.title(),
                goal.description(),
                goal.targetValue(),
                goal.currentValue(),
                goal.activityTags(),
                goal.contributions(),
                goal.startDate(),
                goal.endDate(),
                goal.status(),
                goal.createdAt(),
                goal.updatedAt(),
                null
        );
        return communityGoalService.toGoalDTOWithProgress(
                communityGoalService.updateGoal(ContractMapper.toCommunityGoalEntity(goalToUpdate))
        );
    }

    @DeleteMapping("/{id}")
    public boolean deleteGoal(@PathVariable int id) {
        return communityGoalService.deleteGoal(id);
    }
}
