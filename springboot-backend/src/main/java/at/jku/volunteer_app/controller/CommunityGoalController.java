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
                .map(ContractMapper::toCommunityGoalDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public CommunityGoalDTO getGoalById(@PathVariable int id) {
        return ContractMapper.toCommunityGoalDTO(communityGoalService.getGoalById(id));
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
                goal.startDate(),
                goal.endDate(),
                goal.status(),
                goal.createdAt(),
                goal.updatedAt(),
                goal.organisation()
        );
        return ContractMapper.toCommunityGoalDTO(communityGoalService.updateGoal(ContractMapper.toCommunityGoalEntity(goalToUpdate)));
    }

    @DeleteMapping("/{id}")
    public boolean deleteGoal(@PathVariable int id) {
        return communityGoalService.deleteGoal(id);
    }
}
