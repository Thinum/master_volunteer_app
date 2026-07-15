package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.CommunityGoalDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.service.CommunityGoalService;
import at.jku.volunteer_app.model.UserModelDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
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
                                       @RequestBody CommunityGoalDTO goal,
                                       @AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toCommunityGoalDTO(
                communityGoalService.createGoal(ContractMapper.toCommunityGoalEntity(goal), organisationId, requireUser(userDetails))
        );
    }

    @PutMapping("/{id}")
    public CommunityGoalDTO updateGoal(@PathVariable int id,
                                       @RequestBody CommunityGoalDTO goal,
                                       @AuthenticationPrincipal UserModelDetails userDetails) {
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
                communityGoalService.updateGoal(ContractMapper.toCommunityGoalEntity(goalToUpdate), requireUser(userDetails))
        );
    }

    @DeleteMapping("/{id}")
    public boolean deleteGoal(@PathVariable int id, @AuthenticationPrincipal UserModelDetails userDetails) {
        return communityGoalService.deleteGoal(id, requireUser(userDetails));
    }

    private int requireUser(UserModelDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userDetails.getUserId();
    }
}
