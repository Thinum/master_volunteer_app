package at.jku.volunteer_app.contract;

public record ActivityEngagementAccessDTO(
        boolean member,
        int organisationId,
        int currentLevel,
        String currentLevelName,
        long activeRegistrations,
        Integer registrationLimit,
        boolean canRegister,
        boolean canDeregister,
        String limitationMessage
) {
}
