package at.jku.volunteer_app.contract;

import java.util.List;

public record EngagementLevelOverviewDTO(
        int organisationId,
        String organisationName,
        boolean canManage,
        int currentLevel,
        String currentLevelName,
        long activeRegistrations,
        boolean canInvite,
        String inviteLimitation,
        boolean canManageActivitiesAndGoals,
        String managementLimitation,
        List<EngagementLevelRequirementDTO> levels
) {
}
