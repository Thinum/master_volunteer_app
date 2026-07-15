package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.EngagementTimeUnit;

import java.util.List;

public record EngagementLevelRequirementDTO(
        int level,
        String name,
        String engagementLabel,
        List<String> functionality,
        String unlockCondition,
        Integer registrationLimit,
        int requiredActivities,
        int timespanValue,
        EngagementTimeUnit timespanUnit,
        boolean permanentOnceReached
) {
}
