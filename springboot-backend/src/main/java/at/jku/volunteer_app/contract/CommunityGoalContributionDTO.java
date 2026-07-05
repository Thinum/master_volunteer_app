package at.jku.volunteer_app.contract;

import java.util.List;

public record CommunityGoalContributionDTO(
        UserDTO member,
        List<ActivityDTO> activities
) {
}
